import type { VercelRequest, VercelResponse } from '@vercel/node';
// Edge Config is optional; if not configured, we use in-memory fallback
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { get, set } from '@vercel/edge-config';

const KEY = 'adminSettings';

let memoryState: { isGdbEnabled: boolean; isValgrindEnabled: boolean } = {
  isGdbEnabled: false,
  isValgrindEnabled: false,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      try {
        const data = await get<typeof memoryState>(KEY);
        if (data && typeof data === 'object') {
          return res.status(200).json(data);
        }
      } catch (_) {
        // Edge Config not available
      }
      return res.status(200).json(memoryState);
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const nextState = {
        isGdbEnabled: Boolean(body.isGdbEnabled),
        isValgrindEnabled: Boolean(body.isValgrindEnabled),
      };
      let persisted = false;
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await set(KEY, nextState);
        persisted = true;
      } catch (_) {}
      if (!persisted) memoryState = nextState;
      return res.status(200).json({ ok: true, persisted });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (_) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}


