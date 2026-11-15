import crypto from 'node:crypto';
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

export function getEnvConfig() {
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || '';
  const supabasePublishableKey =
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    '';
  const adminPasscode = (process.env.ADMIN_PASSCODE || '5522').trim();

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
  });
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

export function sendJson(res: ApiResponse, statusCode: number, data: unknown): void {
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
