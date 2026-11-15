import {
  getServerSupabaseClient,
  isMissingTableError,
  readJsonBody,
  sendJson,
  type ApiRequest,
  type ApiResponse,
} from './_lib/backend';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { ok: false, error: 'Method not allowed' });
    return;
  }

  const body = await readJsonBody<{ email?: string }>(req);
  const email = String(body.email || '')
    .trim()
    .toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    sendJson(res, 400, {
      ok: false,
      error: 'Please enter a valid email address.',
    });
    return;
  }

  const supabase = getServerSupabaseClient();
  if (!supabase) {
    sendJson(res, 201, {
      ok: true,
      persisted: false,
      reason: 'supabase_unconfigured',
    });
    return;
  }

  const { error } = await supabase
    .from('newsletter_subscribers')
    .upsert(
      { email, source: 'footer_dispatch' },
      { onConflict: 'email', ignoreDuplicates: true },
    );

  if (error) {
    if (isMissingTableError(error)) {
      sendJson(res, 201, {
        ok: true,
        persisted: false,
        reason: 'schema_pending',
      });
      return;
    }
    sendJson(res, 502, { ok: false, error: 'Subscription failed.' });
    return;
  }

  sendJson(res, 201, { ok: true, persisted: true });
}
