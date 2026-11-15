import crypto from 'node:crypto';
import http from 'node:http';
import https from 'node:https';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export const VALID_ORDER_STATUSES = [
  'pending',
  'confirmed',
  'packed',
  'shipped',
  'delivered',
  'cancelled',
] as const;

export type OrderStatus = (typeof VALID_ORDER_STATUSES)[number];

export interface ApiRequest extends IncomingMessage {
  body?: unknown;
  query?: Record<string, string | string[] | undefined>;
}

export interface ApiResponse extends ServerResponse {
  status?: (code: number) => ApiResponse;
  json?: (data: unknown) => void;
}

function cleanEnv(value: string | undefined): string {
  if (!value) return '';
  return value.trim().replace(/^["']|["']$/g, '').trim();
}

function normalizeSupabaseUrl(raw: string): string {
  const cleaned = cleanEnv(raw).replace(/\/+$/, '');
  if (!cleaned) return '';
  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  return `https://${cleaned}`;
}

export function getEnvConfig() {
  const supabaseUrl = normalizeSupabaseUrl(
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
  );
  const supabaseSecretKey = cleanEnv(process.env.SUPABASE_SECRET_KEY);
  const supabasePublishableKey = cleanEnv(
    process.env.SUPABASE_PUBLISHABLE_KEY ||
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  );
  const adminPasscode = cleanEnv(process.env.ADMIN_PASSCODE) || '5522';

  const sessionSecret = crypto
    .createHash('sha256')
    .update(
      `${supabaseSecretKey || supabasePublishableKey || 'kage-dev'}::${adminPasscode}::session`,
    )
    .digest('hex');

  return {
    supabaseUrl,
    supabaseSecretKey,
    supabasePublishableKey,
    adminPasscode,
    sessionSecret,
  };
}

function formatFetchError(err: unknown): string {
  if (!(err instanceof Error)) return String(err);
  const cause = (err as Error & { cause?: unknown }).cause;
  if (cause && typeof cause === 'object') {
    const c = cause as { code?: string; message?: string; errno?: string };
    const detail = [c.code, c.message].filter(Boolean).join(': ');
    if (detail) return `${err.message} (${detail})`;
  }
  return err.message;
}

function headersToRecord(headersInit?: HeadersInit): Record<string, string> {
  const out: Record<string, string> = {};
  if (!headersInit) return out;
  if (headersInit instanceof Headers) {
    headersInit.forEach((value, key) => {
      out[key] = value;
    });
    return out;
  }
  if (Array.isArray(headersInit)) {
    for (const [key, value] of headersInit) {
      out[key] = value;
    }
    return out;
  }
  for (const [key, value] of Object.entries(headersInit)) {
    if (value !== undefined) {
      out[key] = String(value);
    }
  }
  return out;
}

async function nodeHttpsFetch(
  urlStr: string,
  init: RequestInit | undefined,
  forceIpv4: boolean,
): Promise<Response> {
  const target = new URL(urlStr);
  const transport = target.protocol === 'http:' ? http : https;
  const headers = headersToRecord(init?.headers);

  let bodyBuffer: Buffer | undefined;
  if (init?.body !== undefined && init?.body !== null) {
    if (typeof init.body === 'string') {
      bodyBuffer = Buffer.from(init.body, 'utf8');
    } else if (Buffer.isBuffer(init.body)) {
      bodyBuffer = init.body;
    } else if (init.body instanceof Uint8Array) {
      bodyBuffer = Buffer.from(init.body);
    } else if (init.body instanceof ArrayBuffer) {
      bodyBuffer = Buffer.from(init.body);
    } else {
      bodyBuffer = Buffer.from(String(init.body), 'utf8');
    }
    if (bodyBuffer && !headers['content-length'] && !headers['Content-Length']) {
      headers['Content-Length'] = String(bodyBuffer.byteLength);
    }
  }

  return new Promise<Response>((resolve, reject) => {
    const req = transport.request(
      target,
      {
        method: init?.method || 'GET',
        headers,
        timeout: 12000,
        ...(forceIpv4 ? { family: 4 } : {}),
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer | string) => {
          chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
        });
        res.on('end', () => {
          const responseHeaders = new Headers();
          for (const [k, v] of Object.entries(res.headers)) {
            if (Array.isArray(v)) {
              for (const item of v) responseHeaders.append(k, item);
            } else if (v !== undefined) {
              responseHeaders.set(k, v);
            }
          }
          const payload = Buffer.concat(chunks);
          const status = res.statusCode || 200;
          const bodyForResponse =
            status === 204 || status === 205 || status === 304
              ? null
              : payload;
          resolve(
            new Response(bodyForResponse, {
              status,
              statusText: res.statusMessage || '',
              headers: responseHeaders,
            }),
          );
        });
      },
    );

    req.on('timeout', () => {
      req.destroy(new Error('Request timed out after 12000ms'));
    });
    req.on('error', reject);

    if (bodyBuffer) {
      req.write(bodyBuffer);
    }
    req.end();
  });
}

const resilientFetch: typeof fetch = async (input, init) => {
  const url =
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url;

  const requestHeaders =
    input instanceof Request
      ? new Headers(input.headers)
      : new Headers(init?.headers);
  if (init?.headers && input instanceof Request) {
    const extra = headersToRecord(init.headers);
    for (const [k, v] of Object.entries(extra)) {
      requestHeaders.set(k, v);
    }
  }

  const effectiveInit: RequestInit = {
    ...(input instanceof Request
      ? { method: input.method, body: input.body }
      : {}),
    ...init,
    headers: requestHeaders,
  };

  try {
    return await globalThis.fetch(url, effectiveInit);
  } catch (primaryErr) {
    try {
      return await nodeHttpsFetch(url, effectiveInit, false);
    } catch {
      try {
        return await nodeHttpsFetch(url, effectiveInit, true);
      } catch (fallbackErr) {
        throw new Error(
          `Supabase connection failed: ${formatFetchError(fallbackErr)} (primary: ${formatFetchError(primaryErr)})`,
        );
      }
    }
  }
};

export function getServerSupabaseClient(): SupabaseClient | null {
  const { supabaseUrl, supabaseSecretKey, supabasePublishableKey } =
    getEnvConfig();
  const key = supabaseSecretKey || supabasePublishableKey;
  if (!supabaseUrl || !key) return null;
  return createClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: resilientFetch,
    },
  });
}

export function formatSupabaseError(error: {
  message?: string;
  details?: string | null;
  hint?: string | null;
  code?: string | null;
}): string {
  const msg = (error.message || 'Database request failed.').trim();
  const details = (error.details || '').trim();
  if (details && details !== msg && !msg.includes(details)) {
    return `${msg} — ${details}`;
  }
  return msg;
}

export function isMissingTableError(
  error: { code?: string; message?: string } | null,
): boolean {
  if (!error) return false;
  return (
    error.code === '42P01' ||
    error.code === 'PGRST205' ||
    Boolean(error.message?.toLowerCase().includes('could not find the table'))
  );
}

export function verifyPasscode(input: string): boolean {
  const { adminPasscode } = getEnvConfig();
  const expectedDigest = crypto
    .createHash('sha256')
    .update(adminPasscode)
    .digest();
  const actualDigest = crypto.createHash('sha256').update(input).digest();
  return crypto.timingSafeEqual(expectedDigest, actualDigest);
}

export function issueAdminToken(): string {
  const { sessionSecret } = getEnvConfig();
  const exp = Date.now() + 12 * 60 * 60 * 1000;
  const payload = Buffer.from(JSON.stringify({ role: 'admin', exp })).toString(
    'base64url',
  );
  const sig = crypto
    .createHmac('sha256', sessionSecret)
    .update(payload)
    .digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyAdminToken(token: string): boolean {
  const { sessionSecret } = getEnvConfig();
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', sessionSecret)
    .update(payload)
    .digest('base64url');

  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (
    sigBuf.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(sigBuf, expectedBuf)
  ) {
    return false;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8'),
    ) as { role?: string; exp?: number };
    return (
      parsed.role === 'admin' &&
      typeof parsed.exp === 'number' &&
      parsed.exp > Date.now()
    );
  } catch {
    return false;
  }
}

export function extractBearerToken(req: IncomingMessage): string {
  const raw = req.headers.authorization || '';
  const auth = Array.isArray(raw) ? raw[0] || '' : raw;
  return auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
}

export function sendJson(
  res: ApiResponse,
  statusCode: number,
  data: unknown,
): void {
  res.setHeader('Cache-Control', 'no-store');
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    const target = res.status(statusCode);
    if (typeof target.json === 'function') {
      target.json(data);
      return;
    }
  }
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

export async function readJsonBody<T = Record<string, unknown>>(
  req: ApiRequest,
): Promise<T> {
  if (Buffer.isBuffer(req.body)) {
    const rawBuf = req.body.toString('utf8').trim();
    if (!rawBuf) return {} as T;
    try {
      return JSON.parse(rawBuf) as T;
    } catch {
      return {} as T;
    }
  }
  if (req.body && typeof req.body === 'object') {
    return req.body as T;
  }
  if (typeof req.body === 'string' && req.body.trim().length > 0) {
    try {
      return JSON.parse(req.body) as T;
    } catch {
      return {} as T;
    }
  }
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return {} as T;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return {} as T;
  }
}
