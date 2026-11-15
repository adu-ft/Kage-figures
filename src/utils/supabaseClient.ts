import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function cleanPublicEnv(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw.trim().replace(/^["']|["']$/g, '').trim();
}

const SUPABASE_URL = cleanPublicEnv(import.meta.env.VITE_SUPABASE_URL);
const SUPABASE_PUBLISHABLE_KEY = cleanPublicEnv(
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);

let browserClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (browserClient) return browserClient;
  if (
    !SUPABASE_URL ||
    !SUPABASE_PUBLISHABLE_KEY ||
    SUPABASE_URL.includes('your-project-ref') ||
    SUPABASE_PUBLISHABLE_KEY.startsWith('MY_SUPABASE_')
  ) {
    return null;
  }
  browserClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  return browserClient;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderLinePayload {
  productId: string;
  code: string;
  title: string;
  variantId: string;
  variantLabel: string;
  unitPrice: number;
  quantity: number;
  imageUrl?: string;
}

export interface OrderRecord {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  delivery_estimate: string | null;
  items: OrderLinePayload[];
  subtotal_inr: number;
  status: OrderStatus;
  created_at: string;
}

export interface NewsletterSubscriberRecord {
  id: string;
  email: string;
  source: string;
  created_at: string;
}

export interface SubmitOrderPayload {
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  deliveryEstimate: string;
  items: OrderLinePayload[];
  subtotalInr: number;
}

export interface SubmitOrderResult {
  ok: boolean;
  orderNumber: string;
  persisted: boolean;
  error?: string;
}

export async function submitOrder(
  payload: SubmitOrderPayload,
): Promise<SubmitOrderResult> {
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = (await response.json()) as {
        ok?: boolean;
        orderNumber?: string;
        persisted?: boolean;
        error?: string;
      };
      if (response.ok && data.ok && data.orderNumber) {
        return {
          ok: true,
          orderNumber: data.orderNumber,
          persisted: Boolean(data.persisted),
        };
      }
      if (response.status >= 400 && response.status < 500 && data.error) {
        return {
          ok: false,
          orderNumber: '',
          persisted: false,
          error: data.error,
        };
      }
    }
  } catch {
    // Backend /api route unavailable on static deployment; fall back to publishable Supabase client
  }

  const fallbackOrderNumber = `KF-${Math.floor(10000 + Math.random() * 89999)}`;
  const client = getSupabaseClient();
  if (!client) {
    return {
      ok: true,
      orderNumber: fallbackOrderNumber,
      persisted: false,
    };
  }

  const cleanedPhone = payload.customerPhone.replace(/\D/g, '');
  const { error } = await client.from('orders').insert({
    order_number: fallbackOrderNumber,
    customer_name: payload.customerName,
    customer_phone: `+91 ${cleanedPhone}`,
    shipping_address: payload.shippingAddress,
    locality: payload.locality,
    city: payload.city,
    state: payload.state,
    pincode: payload.pincode,
    delivery_estimate: payload.deliveryEstimate || null,
    items: payload.items,
    subtotal_inr: Math.round(payload.subtotalInr),
    status: 'pending',
  });

  if (error) {
    return {
      ok: true,
      orderNumber: fallbackOrderNumber,
      persisted: false,
    };
  }

  return {
    ok: true,
    orderNumber: fallbackOrderNumber,
    persisted: true,
  };
}

export async function subscribeNewsletter(
  email: string,
): Promise<{ ok: boolean; persisted: boolean; error?: string }> {
  const normalized = email.trim().toLowerCase();
  try {
    const response = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalized }),
    });
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = (await response.json()) as {
        ok?: boolean;
        persisted?: boolean;
        error?: string;
      };
      if (response.ok && data.ok) {
        return { ok: true, persisted: Boolean(data.persisted) };
      }
      if (response.status >= 400 && response.status < 500 && data.error) {
        return { ok: false, persisted: false, error: data.error };
      }
    }
  } catch {
    // Fallback to direct publishable client on static deployments
  }

  const client = getSupabaseClient();
  if (!client) {
    return { ok: true, persisted: false };
  }

  const { error } = await client
    .from('newsletter_subscribers')
    .insert({ email: normalized, source: 'footer_dispatch' });

  if (error && error.code !== '23505') {
    return { ok: true, persisted: false };
  }

  return { ok: true, persisted: true };
}

export async function adminLogin(
  passcode: string,
): Promise<{ ok: boolean; token?: string; error?: string }> {
  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode }),
    });
    const data = (await response.json()) as {
      ok?: boolean;
      token?: string;
      error?: string;
    };
    if (!response.ok || !data.ok || !data.token) {
      return { ok: false, error: data.error || 'Invalid admin passcode.' };
    }
    return { ok: true, token: data.token };
  } catch {
    return {
      ok: false,
      error: 'Unable to reach admin authentication server.',
    };
  }
}

export async function fetchAdminOrders(token: string): Promise<{
  ok: boolean;
  orders: OrderRecord[];
  schemaPending?: boolean;
  unauthorized?: boolean;
  error?: string;
}> {
  try {
    const response = await fetch('/api/admin/orders', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.status === 401) {
      return { ok: false, orders: [], unauthorized: true, error: 'Session expired.' };
    }
    const data = (await response.json()) as {
      ok?: boolean;
      orders?: OrderRecord[];
      schemaPending?: boolean;
      error?: string;
    };
    if (!response.ok || !data.ok) {
      return {
        ok: false,
        orders: [],
        error: data.error || 'Could not load orders.',
      };
    }
    return {
      ok: true,
      orders: data.orders || [],
      schemaPending: Boolean(data.schemaPending),
    };
  } catch {
    return { ok: false, orders: [], error: 'Network error loading orders.' };
  }
}

export async function updateAdminOrderStatus(
  token: string,
  orderNumber: string,
  status: OrderStatus,
): Promise<{ ok: boolean; order?: OrderRecord; error?: string }> {
  try {
    const response = await fetch(
      `/api/admin/orders/${encodeURIComponent(orderNumber)}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      },
    );
    const data = (await response.json()) as {
      ok?: boolean;
      order?: OrderRecord;
      error?: string;
    };
    if (!response.ok || !data.ok) {
      return { ok: false, error: data.error || 'Could not update status.' };
    }
    return { ok: true, order: data.order };
  } catch {
    return { ok: false, error: 'Network error updating order.' };
  }
}

export async function deleteAdminOrder(
  token: string,
  orderNumber: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const response = await fetch(
      `/api/admin/orders/${encodeURIComponent(orderNumber)}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const data = (await response.json()) as { ok?: boolean; error?: string };
    if (!response.ok || !data.ok) {
      return { ok: false, error: data.error || 'Could not delete order.' };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'Network error deleting order.' };
  }
}

export async function fetchAdminSubscribers(token: string): Promise<{
  ok: boolean;
  subscribers: NewsletterSubscriberRecord[];
  schemaPending?: boolean;
  error?: string;
}> {
  try {
    const response = await fetch('/api/admin/subscribers', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = (await response.json()) as {
      ok?: boolean;
      subscribers?: NewsletterSubscriberRecord[];
      schemaPending?: boolean;
      error?: string;
    };
    if (!response.ok || !data.ok) {
      return {
        ok: false,
        subscribers: [],
        error: data.error || 'Could not load subscribers.',
      };
    }
    return {
      ok: true,
      subscribers: data.subscribers || [],
      schemaPending: Boolean(data.schemaPending),
    };
  } catch {
    return {
      ok: false,
      subscribers: [],
      error: 'Network error loading subscribers.',
    };
  }
}
