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

  const { supabaseUrl, supabaseSecretKey, supabasePublishableKey } =
    getEnvConfig();
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
      supabaseHost,
      hasSecretKey: Boolean(supabaseSecretKey),
      hasPublishableKey: Boolean(supabasePublishableKey),
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
