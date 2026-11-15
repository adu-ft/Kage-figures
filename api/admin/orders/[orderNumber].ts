import {
  extractBearerToken,
  getServerSupabaseClient,
  readJsonBody,
  sendJson,
  VALID_ORDER_STATUSES,
  verifyAdminToken,
  type ApiRequest,
  type ApiResponse,
  type OrderStatus,
} from '../../_lib/backend.js';

function resolveOrderNumber(req: ApiRequest): string {
  const fromQuery = req.query?.orderNumber;
  if (typeof fromQuery === 'string' && fromQuery.trim()) {
    return decodeURIComponent(fromQuery.trim());
  }
  if (Array.isArray(fromQuery) && fromQuery[0]?.trim()) {
    return decodeURIComponent(fromQuery[0].trim());
  }
  const urlPath = (req.url || '').split('?')[0];
  const segments = urlPath.split('/').filter(Boolean);
  const last = segments[segments.length - 1] || '';
  return decodeURIComponent(last.trim());
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'PATCH' && req.method !== 'DELETE') {
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

  const orderNumber = resolveOrderNumber(req);
  if (!orderNumber) {
    sendJson(res, 400, { ok: false, error: 'Missing order number.' });
    return;
  }

  if (req.method === 'PATCH') {
    const body = await readJsonBody<{ status?: string }>(req);
    const nextStatus = String(body.status || '').trim() as OrderStatus;

    if (!VALID_ORDER_STATUSES.includes(nextStatus)) {
      sendJson(res, 400, { ok: false, error: 'Invalid order status.' });
      return;
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ status: nextStatus })
      .eq('order_number', orderNumber)
      .select('*')
      .single();

    if (error) {
      sendJson(res, 502, { ok: false, error: error.message });
      return;
    }

    sendJson(res, 200, { ok: true, order: data });
    return;
  }

  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('order_number', orderNumber);

  if (error) {
    sendJson(res, 502, { ok: false, error: error.message });
    return;
  }

  sendJson(res, 200, { ok: true });
}
