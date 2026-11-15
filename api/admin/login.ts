import {
  issueAdminToken,
  readJsonBody,
  sendJson,
  verifyPasscode,
  type ApiRequest,
  type ApiResponse,
} from '../_lib/backend';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { ok: false, error: 'Method not allowed' });
    return;
  }

  const body = await readJsonBody<{ passcode?: string }>(req);
  const passcode = String(body.passcode || '').trim();

  if (!passcode || !verifyPasscode(passcode)) {
    sendJson(res, 401, { ok: false, error: 'Incorrect admin passcode.' });
    return;
  }

  const token = issueAdminToken();
  sendJson(res, 200, { ok: true, token });
}
