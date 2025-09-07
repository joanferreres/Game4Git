import type { VercelRequest, VercelResponse } from '@vercel/node';
// Edge Config is optional; if not configured, we use in-memory fallback
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { get } from '@vercel/edge-config';

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
      // Try Edge Config Management API if credentials present
      const EDGE_CONFIG_ID = process.env.EDGE_CONFIG_ID;
      const EDGE_CONFIG_TOKEN = process.env.EDGE_CONFIG_TOKEN;
      if (EDGE_CONFIG_ID && EDGE_CONFIG_TOKEN) {
        try {
          const apiUrl = `https://api.vercel.com/v1/edge-config/${EDGE_CONFIG_ID}/items`;
          const resp = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${EDGE_CONFIG_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              items: [
                {
                  operation: 'upsert',
                  key: KEY,
                  value: nextState
                }
              ]
            })
          });
          if (resp.ok) {
            persisted = true;
          }
        } catch (_) {
          // ignore
        }
      }
      if (!persisted) memoryState = nextState;
      return res.status(200).json({ ok: true, persisted });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (_) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}


