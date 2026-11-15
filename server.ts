import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ApiRequest, ApiResponse } from './api/_lib/backend';
import healthHandler from './api/health';
import ordersHandler from './api/orders';
import newsletterHandler from './api/newsletter';
import adminLoginHandler from './api/admin/login';
import adminOrdersHandler from './api/admin/orders';
import adminOrderByNumberHandler from './api/admin/orders/[orderNumber]';
import adminSubscribersHandler from './api/admin/subscribers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);

function adaptHandler(
  handler: (req: ApiRequest, res: ApiResponse) => Promise<void> | void,
) {
  return async (req: Request, res: Response) => {
    const apiReq = req as unknown as ApiRequest;
    const apiRes = res as unknown as ApiResponse;
    if (req.params && Object.keys(req.params).length > 0) {
      apiReq.query = {
        ...(req.query as Record<string, string | string[] | undefined>),
        ...req.params,
      };
    }
    try {
      await handler(apiReq, apiRes);
    } catch (error) {
      if (!res.headersSent) {
        const message =
          error instanceof Error ? error.message : 'Internal server error.';
        res.status(500).json({ ok: false, error: message });
      }
    }
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.all('/api/health', adaptHandler(healthHandler));
  app.all('/api/orders', adaptHandler(ordersHandler));
  app.all('/api/newsletter', adaptHandler(newsletterHandler));
  app.all('/api/admin/login', adaptHandler(adminLoginHandler));
  app.all('/api/admin/orders', adaptHandler(adminOrdersHandler));
  app.all('/api/admin/orders/:orderNumber', adaptHandler(adminOrderByNumberHandler));
  app.all('/api/admin/subscribers', adaptHandler(adminSubscribersHandler));

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
