import {
  getServerSupabaseClient,
  sendJson,
  type ApiRequest,
  type ApiResponse,
} from './_lib/backend.js';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    sendJson(res, 405, { ok: false, error: 'Method not allowed' });
    return;
  }

  const supabase = getServerSupabaseClient();
  sendJson(res, 200, {
    ok: true,
    supabaseConfigured: Boolean(supabase),
  });
}
