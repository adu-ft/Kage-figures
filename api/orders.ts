import {
  getServerSupabaseClient,
  isMissingTableError,
  readJsonBody,
  sendJson,
  type ApiRequest,
  type ApiResponse,
} from './_lib/backend.js';

interface OrderItemInput {
  productId: string;
  code: string;
  title: string;
  variantId: string;
  variantLabel: string;
  unitPrice: number;
  quantity: number;
}

interface CreateOrderBody {
  customerName?: string;
  customerPhone?: string;
  shippingAddress?: string;
  locality?: string;
  city?: string;
  state?: string;
  pincode?: string;
  deliveryEstimate?: string;
  items?: OrderItemInput[];
  subtotalInr?: number;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { ok: false, error: 'Method not allowed' });
    return;
  }

  const body = await readJsonBody<CreateOrderBody>(req);
  const customerName = String(body.customerName || '')
    .trim()
    .replace(/\s+/g, ' ');
  const customerPhone = String(body.customerPhone || '').replace(/\D/g, '');
  const shippingAddress = String(body.shippingAddress || '').trim();
  const locality = String(body.locality || '').trim();
  const city = String(body.city || '').trim();
  const state = String(body.state || '').trim();
  const pincode = String(body.pincode || '').replace(/\D/g, '');
  const deliveryEstimate = String(body.deliveryEstimate || '').trim();
  const items = Array.isArray(body.items) ? body.items : [];
  const subtotalInr = Number(body.subtotalInr || 0);

  if (customerName.length < 3) {
    sendJson(res, 400, { ok: false, error: 'Invalid customer full name.' });
    return;
  }
  if (!/^[6-9]\d{9}$/.test(customerPhone)) {
    sendJson(res, 400, {
      ok: false,
      error: 'Invalid 10-digit Indian mobile number.',
    });
    return;
  }
  if (!/^[1-9]\d{5}$/.test(pincode) || !city || !state) {
    sendJson(res, 400, {
      ok: false,
      error: 'Invalid verified Indian delivery PIN code.',
    });
    return;
  }
  if (shippingAddress.length < 8) {
    sendJson(res, 400, { ok: false, error: 'Shipping address is too short.' });
    return;
  }
  if (items.length === 0 || !Number.isFinite(subtotalInr) || subtotalInr <= 0) {
    sendJson(res, 400, {
      ok: false,
      error: 'Order must contain at least one item.',
    });
    return;
  }

  const orderNumber = `KF-${Math.floor(10000 + Math.random() * 89999)}`;
  const supabase = getServerSupabaseClient();

  if (!supabase) {
    sendJson(res, 201, {
      ok: true,
      orderNumber,
      persisted: false,
      reason: 'supabase_unconfigured',
    });
    return;
  }

  const { error } = await supabase.from('orders').insert({
    order_number: orderNumber,
    customer_name: customerName,
    customer_phone: `+91 ${customerPhone}`,
    shipping_address: shippingAddress,
    locality: locality || city,
    city,
    state,
    pincode,
    delivery_estimate: deliveryEstimate || null,
    items,
    subtotal_inr: Math.round(subtotalInr),
    status: 'pending',
  });

  if (error) {
    if (isMissingTableError(error)) {
      sendJson(res, 201, {
        ok: true,
        orderNumber,
        persisted: false,
        reason: 'schema_pending',
      });
      return;
    }
    sendJson(res, 502, {
      ok: false,
      error: 'Could not persist order to database.',
    });
    return;
  }

  sendJson(res, 201, {
    ok: true,
    orderNumber,
    persisted: true,
  });
}
