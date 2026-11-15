import 'dotenv/config';
import crypto from 'node:crypto';
import express, { type NextFunction, type Request, type Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || '';
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || '';
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || 'kage-vault-2026';

const SESSION_SECRET = crypto
  .createHash('sha256')
  .update(`${SUPABASE_SECRET_KEY || 'kage-dev'}::${ADMIN_PASSCODE}::session`)
  .digest('hex');

const VALID_ORDER_STATUSES = [
  'pending',
  'confirmed',
  'packed',
  'shipped',
  'delivered',
  'cancelled',
] as const;

type OrderStatus = (typeof VALID_ORDER_STATUSES)[number];

function createServerSupabaseClient(): SupabaseClient | null {
  const key = SUPABASE_SECRET_KEY || SUPABASE_PUBLISHABLE_KEY;
  if (!SUPABASE_URL || !key) return null;
  return createClient(SUPABASE_URL, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

const supabaseAdmin = createServerSupabaseClient();

function isMissingTableError(
  error: { code?: string; message?: string } | null,
): boolean {
  if (!error) return false;
  return (
    error.code === '42P01' ||
    error.code === 'PGRST205' ||
    Boolean(error.message?.toLowerCase().includes('could not find the table'))
  );
}

function verifyPasscode(input: string): boolean {
  const expectedDigest = crypto
    .createHash('sha256')
    .update(ADMIN_PASSCODE)
    .digest();
  const actualDigest = crypto.createHash('sha256').update(input).digest();
  return crypto.timingSafeEqual(expectedDigest, actualDigest);
}

function issueAdminToken(): string {
  const exp = Date.now() + 12 * 60 * 60 * 1000;
  const payload = Buffer.from(JSON.stringify({ role: 'admin', exp })).toString(
    'base64url',
  );
  const sig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');
  return `${payload}.${sig}`;
}

function verifyAdminToken(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
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

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (!token || !verifyAdminToken(token)) {
    res.status(401).json({ ok: false, error: 'Unauthorized admin session.' });
    return;
  }
  next();
}

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

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', async (_req: Request, res: Response) => {
    res.json({
      ok: true,
      supabaseConfigured: Boolean(supabaseAdmin),
    });
  });

  app.post('/api/orders', async (req: Request, res: Response) => {
    const body = (req.body || {}) as CreateOrderBody;
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
      res.status(400).json({ ok: false, error: 'Invalid customer full name.' });
      return;
    }
    if (!/^[6-9]\d{9}$/.test(customerPhone)) {
      res
        .status(400)
        .json({ ok: false, error: 'Invalid 10-digit Indian mobile number.' });
      return;
    }
    if (!/^[1-9]\d{5}$/.test(pincode) || !city || !state) {
      res
        .status(400)
        .json({ ok: false, error: 'Invalid verified Indian delivery PIN code.' });
      return;
    }
    if (shippingAddress.length < 8) {
      res
        .status(400)
        .json({ ok: false, error: 'Shipping address is too short.' });
      return;
    }
    if (items.length === 0 || !Number.isFinite(subtotalInr) || subtotalInr <= 0) {
      res
        .status(400)
        .json({ ok: false, error: 'Order must contain at least one item.' });
      return;
    }

    const orderNumber = `KF-${Math.floor(10000 + Math.random() * 89999)}`;

    if (!supabaseAdmin) {
      res.status(201).json({
        ok: true,
        orderNumber,
        persisted: false,
        reason: 'supabase_unconfigured',
      });
      return;
    }

    const { error } = await supabaseAdmin.from('orders').insert({
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
        res.status(201).json({
          ok: true,
          orderNumber,
          persisted: false,
          reason: 'schema_pending',
        });
        return;
      }
      res.status(502).json({
        ok: false,
        error: 'Could not persist order to database.',
      });
      return;
    }

    res.status(201).json({
      ok: true,
      orderNumber,
      persisted: true,
    });
  });

  app.post('/api/newsletter', async (req: Request, res: Response) => {
    const email = String((req.body as { email?: string })?.email || '')
      .trim()
      .toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      res
        .status(400)
        .json({ ok: false, error: 'Please enter a valid email address.' });
      return;
    }

    if (!supabaseAdmin) {
      res
        .status(201)
        .json({ ok: true, persisted: false, reason: 'supabase_unconfigured' });
      return;
    }

    const { error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .upsert(
        { email, source: 'footer_dispatch' },
        { onConflict: 'email', ignoreDuplicates: true },
      );

    if (error) {
      if (isMissingTableError(error)) {
        res
          .status(201)
          .json({ ok: true, persisted: false, reason: 'schema_pending' });
        return;
      }
      res.status(502).json({ ok: false, error: 'Subscription failed.' });
      return;
    }

    res.status(201).json({ ok: true, persisted: true });
  });

  // Secret Admin Panel Endpoints
  app.post('/api/admin/login', (req: Request, res: Response) => {
    const passcode = String((req.body as { passcode?: string })?.passcode || '').trim();
    if (!passcode || !verifyPasscode(passcode)) {
      res.status(401).json({ ok: false, error: 'Incorrect admin passcode.' });
      return;
    }
    const token = issueAdminToken();
    res.json({ ok: true, token });
  });

  app.get('/api/admin/orders', requireAdmin, async (_req: Request, res: Response) => {
    if (!supabaseAdmin) {
      res.status(503).json({ ok: false, error: 'Supabase is not configured.' });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) {
      if (isMissingTableError(error)) {
        res.json({ ok: true, orders: [], schemaPending: true });
        return;
      }
      res.status(502).json({ ok: false, error: error.message });
      return;
    }

    res.json({ ok: true, orders: data || [], schemaPending: false });
  });

  app.patch(
    '/api/admin/orders/:orderNumber',
    requireAdmin,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) {
        res.status(503).json({ ok: false, error: 'Supabase is not configured.' });
        return;
      }

      const orderNumber = String(req.params.orderNumber || '').trim();
      const nextStatus = String(
        (req.body as { status?: string })?.status || '',
      ).trim() as OrderStatus;

      if (!VALID_ORDER_STATUSES.includes(nextStatus)) {
        res.status(400).json({ ok: false, error: 'Invalid order status.' });
        return;
      }

      const { data, error } = await supabaseAdmin
        .from('orders')
        .update({ status: nextStatus })
        .eq('order_number', orderNumber)
        .select('*')
        .single();

      if (error) {
        res.status(502).json({ ok: false, error: error.message });
        return;
      }

      res.json({ ok: true, order: data });
    },
  );

  app.delete(
    '/api/admin/orders/:orderNumber',
    requireAdmin,
    async (req: Request, res: Response) => {
      if (!supabaseAdmin) {
        res.status(503).json({ ok: false, error: 'Supabase is not configured.' });
        return;
      }

      const orderNumber = String(req.params.orderNumber || '').trim();
      const { error } = await supabaseAdmin
        .from('orders')
        .delete()
        .eq('order_number', orderNumber);

      if (error) {
        res.status(502).json({ ok: false, error: error.message });
        return;
      }

      res.json({ ok: true });
    },
  );

  app.get(
    '/api/admin/subscribers',
    requireAdmin,
    async (_req: Request, res: Response) => {
      if (!supabaseAdmin) {
        res.status(503).json({ ok: false, error: 'Supabase is not configured.' });
        return;
      }

      const { data, error } = await supabaseAdmin
        .from('newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) {
        if (isMissingTableError(error)) {
          res.json({ ok: true, subscribers: [], schemaPending: true });
          return;
        }
        res.status(502).json({ ok: false, error: error.message });
        return;
      }

      res.json({ ok: true, subscribers: data || [], schemaPending: false });
    },
  );

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('/{*path}', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kage Figures server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
