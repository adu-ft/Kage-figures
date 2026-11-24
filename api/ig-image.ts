import type { Request, Response } from 'express';

interface CachedImage {
  contentType: string;
  data: Buffer;
  timestamp: number;
}

// In-memory caches — completely ephemeral in RAM, ZERO disk writes
const imageMemoryCache = new Map<string, CachedImage>();
const slideUrlsCache = new Map<string, { urls: string[]; timestamp: number }>();

// Clean older cache entries if cache grows past 1000 images to prevent unbounded RAM growth
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

export async function handleInstagramImage(req: Request, res: Response): Promise<void> {
  const shortcode = req.params.shortcode;
  if (!shortcode || !/^[\w-]+$/.test(shortcode)) {
    res.status(400).send('Invalid shortcode');
    return;
  }

  const slideIndex = Math.max(1, parseInt(req.params.index || '1', 10));
  const cacheKey = `${shortcode}:${slideIndex}`;

  const cached = imageMemoryCache.get(cacheKey);
  if (cached) {
    res.setHeader('Content-Type', cached.contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    res.send(cached.data);
    return;
  }

  try {
    let targetUrl: string | undefined;

    if (slideIndex === 1) {
      targetUrl = `https://www.instagram.com/p/${shortcode}/media/?size=l`;
    } else {
      const slides = await getInstagramSlideUrls(shortcode);
      if (slides.length >= slideIndex) {
        targetUrl = slides[slideIndex - 1];
      } else if (slides.length > 0) {
        targetUrl = slides[slides.length - 1];
      } else {
        targetUrl = `https://www.instagram.com/p/${shortcode}/media/?size=l`;
      }
    }

    let imgRes = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
      redirect: 'follow',
    });

    // If slide 1 /media/?size=l had an issue or redirected poorly, try embed fallback
    if (!imgRes.ok && slideIndex === 1) {
      const slides = await getInstagramSlideUrls(shortcode);
      if (slides.length > 0) {
        imgRes = await fetch(slides[0], {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        });
      }
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
        res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
        res.send(buffer);
        return;
      }
    }

    res.status(404).send('Image not found');
  } catch (err) {
    console.error(`[IG Proxy] Failed to proxy image for ${shortcode} slide ${slideIndex}:`, err);
    res.status(500).send('Error streaming image');
  }
}

export async function handleInstagramSlides(req: Request, res: Response): Promise<void> {
  const shortcode = req.params.shortcode;
  if (!shortcode || !/^[\w-]+$/.test(shortcode)) {
    res.status(400).json({ ok: false, error: 'Invalid shortcode' });
    return;
  }

  const slides = await getInstagramSlideUrls(shortcode);
  res.json({
    ok: true,
    shortcode,
    slideCount: Math.max(1, slides.length),
    images: Array.from({ length: Math.max(1, slides.length) }, (_, i) => `/api/ig-image/${shortcode}/${i + 1}`),
    slideUrls: Array.from({ length: Math.max(1, slides.length) }, (_, i) => `https://www.instagram.com/p/${shortcode}/?img_index=${i + 1}`),
  });
}
