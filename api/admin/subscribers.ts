import {
  extractBearerToken,
  getServerSupabaseClient,
  isMissingTableError,
  sendJson,
  verifyAdminToken,
  type ApiRequest,
  type ApiResponse,
} from '../_lib/backend.js';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    sendJson(res, 405, { ok: false, error: 'Method not allowed' });
    return;
  }

  const token = extractBearerToken(req);
  if (!token || !verifyAdminToken(token)) {
    sendJson(res, 401, { ok: false, error: 'Unauthorized admin session.' });
    return;
  }

  const supabase = getServerSupabaseClient();
  if (!supabase) {
    sendJson(res, 503, {
      ok: false,
      error:
        'Supabase is not configured. Add SUPABASE_URL and SUPABASE_SECRET_KEY in your environment variables.',
    });
    return;
  }

  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    if (isMissingTableError(error)) {
      sendJson(res, 200, { ok: true, subscribers: [], schemaPending: true });
      return;
    }
    sendJson(res, 502, { ok: false, error: error.message });
    return;
  }

  sendJson(res, 200, {
    ok: true,
    subscribers: data || [],
    schemaPending: false,
  });
}
