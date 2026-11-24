import type { IncomingMessage, ServerResponse } from 'node:http';

interface CachedImage {
  contentType: string;
  data: Buffer;
  timestamp: number;
}

// In-memory caches — completely ephemeral in RAM, ZERO disk writes
const imageMemoryCache = new Map<string, CachedImage>();
const slideUrlsCache = new Map<string, { urls: string[]; timestamp: number }>();

function pruneCacheIfNeeded() {
  if (imageMemoryCache.size > 1000) {
    const oldestKeys = Array.from(imageMemoryCache.keys()).slice(0, 200);
    for (const key of oldestKeys) {
      imageMemoryCache.delete(key);
    }
  }
}

function cleanInstagramUrl(raw: string): string {
  return raw
    .replaceAll('\\\\/', '/')
    .replaceAll('\\/', '/')
    .replaceAll('\\u0026', '&')
    .replaceAll('\\u0025', '%')
    .replaceAll('&amp;', '&');
}

export async function getInstagramSlideUrls(shortcode: string): Promise<string[]> {
  const now = Date.now();
  const cached = slideUrlsCache.get(shortcode);
  if (cached && now - cached.timestamp < 3600_000) {
    return cached.urls;
  }

  const embedUrl = `https://www.instagram.com/p/${shortcode}/embed/captioned/`;
  try {
    const res = await fetch(embedUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!res.ok) return [];

    const html = await res.text();
    const unescaped = html.replace(/\\"/g, '"');

    const idx = unescaped.indexOf('"edge_sidecar_to_children"');
    const urls: string[] = [];

    if (idx !== -1) {
      const sub = unescaped.substring(idx, idx + 150000);
      const matches = sub.matchAll(/"display_url"\s*:\s*"([^"]+)"/g);
      for (const m of matches) {
        const u = cleanInstagramUrl(m[1]);
        if (!urls.includes(u)) {
          urls.push(u);
        }
      }
    }

    if (urls.length === 0) {
      const singleMatches = unescaped.matchAll(/"display_url"\s*:\s*"([^"]+)"/g);
      for (const m of singleMatches) {
        const u = cleanInstagramUrl(m[1]);
        if (!urls.includes(u)) {
          urls.push(u);
        }
      }
    }

    slideUrlsCache.set(shortcode, { urls, timestamp: now });
    return urls;
  } catch (err) {
    console.warn(`[IG Proxy] Error extracting slide URLs for ${shortcode}:`, err);
    return [];
  }
}

function extractParams(req: any): { shortcode: string; slideIndex: number } {
  let shortcode = '';
  let slideIndex = 1;

  // 1. Express req.params
  if (req.params?.shortcode) {
    shortcode = req.params.shortcode;
    if (req.params.index) slideIndex = parseInt(req.params.index, 10) || 1;
  }

  // 2. Vercel req.query.slug (from [...slug].ts)
  if (!shortcode && req.query?.slug) {
    const slug = Array.isArray(req.query.slug) ? req.query.slug : [req.query.slug];
    if (slug[0]) shortcode = slug[0];
    if (slug[1]) slideIndex = parseInt(slug[1], 10) || 1;
  }

  // 3. Vercel req.query.path (from rewrites)
  if (!shortcode && typeof req.query?.path === 'string') {
    const parts = req.query.path.split('/').filter(Boolean);
    if (parts[0]) shortcode = parts[0];
    if (parts[1]) slideIndex = parseInt(parts[1], 10) || 1;
  }

  // 4. Query parameters ?shortcode=...&index=...
  if (!shortcode && req.query?.shortcode) {
    const sc = Array.isArray(req.query.shortcode) ? req.query.shortcode[0] : req.query.shortcode;
    if (sc) shortcode = sc;
    const idx = Array.isArray(req.query.index) ? req.query.index[0] : req.query.index;
    if (idx) slideIndex = parseInt(idx, 10) || 1;
  }

  // 5. URL path fallback: parse req.url
  if (!shortcode && req.url) {
    const cleanUrl = req.url.split('?')[0];
    const match = cleanUrl.match(/\/api\/ig-image\/([a-zA-Z0-9_-]+)(?:\/(\d+))?/i);
    if (match) {
      shortcode = match[1];
      if (match[2]) slideIndex = parseInt(match[2], 10) || 1;
    }
  }

  return { shortcode: shortcode.trim(), slideIndex: Math.max(1, slideIndex) };
}

function sendResponse(res: any, status: number, body: any, contentType?: string) {
  if (res.headersSent) return;

  if (contentType) {
    res.setHeader('Content-Type', contentType);
  }

  if (typeof res.status === 'function') {
    res.status(status);
  } else {
    res.statusCode = status;
  }

  if (Buffer.isBuffer(body)) {
    if (typeof res.send === 'function') {
      res.send(body);
    } else {
      res.end(body);
    }
  } else if (typeof body === 'object') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(body));
  } else {
    res.end(String(body));
  }
}

export async function handleInstagramImage(req: any, res: any): Promise<void> {
  const { shortcode, slideIndex } = extractParams(req);

  if (!shortcode || !/^[\w-]+$/.test(shortcode)) {
    sendResponse(res, 400, 'Invalid shortcode');
    return;
  }

  const cacheKey = `${shortcode}:${slideIndex}`;
  const cached = imageMemoryCache.get(cacheKey);
  if (cached) {
    res.setHeader('Content-Type', cached.contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000');
    sendResponse(res, 200, cached.data, cached.contentType);
    return;
  }

  try {
    let targetUrl: string | undefined;

    // First try extracting all slide URLs from the embed
    const slides = await getInstagramSlideUrls(shortcode);
    if (slides.length >= slideIndex) {
      targetUrl = slides[slideIndex - 1];
    } else if (slides.length > 0) {
      targetUrl = slides[slides.length - 1];
    } else {
      // Fallback to /media/?size=l for slide 1
      targetUrl = `https://www.instagram.com/p/${shortcode}/media/?size=l`;
    }

    let imgRes = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
      redirect: 'follow',
    });

    if (!imgRes.ok && slideIndex === 1 && !targetUrl.includes('/media/')) {
      imgRes = await fetch(`https://www.instagram.com/p/${shortcode}/media/?size=l`, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        redirect: 'follow',
      });
    }

    if (imgRes.ok) {
      const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
      const arrayBuf = await imgRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuf);

      if (buffer.length > 500) {
        pruneCacheIfNeeded();
        imageMemoryCache.set(cacheKey, {
          contentType,
          data: buffer,
          timestamp: Date.now(),
        });

        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000');
        sendResponse(res, 200, buffer, contentType);
        return;
      }
    }

    sendResponse(res, 404, 'Image not found');
  } catch (err) {
    console.error(`[IG Proxy] Failed to proxy image for ${shortcode} slide ${slideIndex}:`, err);
    sendResponse(res, 500, 'Error streaming image');
  }
}

export async function handleInstagramSlides(req: any, res: any): Promise<void> {
  const { shortcode } = extractParams(req);
  if (!shortcode || !/^[\w-]+$/.test(shortcode)) {
    sendResponse(res, 400, { ok: false, error: 'Invalid shortcode' });
    return;
  }

  const slides = await getInstagramSlideUrls(shortcode);
  const count = Math.max(1, slides.length);
  sendResponse(res, 200, {
    ok: true,
    shortcode,
    slideCount: count,
    images: Array.from({ length: count }, (_, i) => `/api/ig-image/${shortcode}/${i + 1}`),
    slideUrls: Array.from({ length: count }, (_, i) => `https://www.instagram.com/p/${shortcode}/?img_index=${i + 1}`),
  });
}

export default async function handler(req: any, res: any) {
  return handleInstagramImage(req, res);
}
