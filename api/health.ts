import {
  formatSupabaseError,
  getEnvConfig,
  getServerSupabaseClient,
  isMissingTableError,
  sendJson,
  type ApiRequest,
  type ApiResponse,
} from './_lib/backend.js';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    sendJson(res, 405, { ok: false, error: 'Method not allowed' });
    return;
  }

  const {
    supabaseUrl,
    supabaseSecretKey,
    supabasePublishableKey,
    hasPlaceholder,
  } = getEnvConfig();
  const supabase = getServerSupabaseClient();

  let supabaseHost = '';
  try {
    if (supabaseUrl) {
      supabaseHost = new URL(supabaseUrl).host;
    }
  } catch {
    supabaseHost = 'invalid-url';
  }

  if (!supabase) {
    sendJson(res, 200, {
      ok: true,
      supabaseConfigured: false,
      placeholderDetected: hasPlaceholder,
      supabaseHost,
      hasSecretKey: Boolean(supabaseSecretKey),
      hasPublishableKey: Boolean(supabasePublishableKey),
      hint: hasPlaceholder
        ? 'Vercel is using placeholder values from .env.example. Replace SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY, VITE_SUPABASE_URL, and VITE_SUPABASE_PUBLISHABLE_KEY in Vercel Settings -> Environment Variables and redeploy.'
        : 'Add SUPABASE_URL and SUPABASE_SECRET_KEY in Vercel Settings -> Environment Variables and redeploy.',
    });
    return;
  }

  try {
    const { error } = await supabase
      .from('orders')
      .select('order_number')
      .limit(1);

    if (error && !isMissingTableError(error)) {
      sendJson(res, 200, {
        ok: true,
        supabaseConfigured: true,
        supabaseHost,
        supabaseReachable: false,
        error: formatSupabaseError(error),
      });
      return;
    }

    sendJson(res, 200, {
      ok: true,
      supabaseConfigured: true,
      supabaseHost,
      supabaseReachable: true,
      schemaPending: isMissingTableError(error),
    });
  } catch (err) {
    sendJson(res, 200, {
      ok: true,
      supabaseConfigured: true,
      supabaseHost,
      supabaseReachable: false,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
