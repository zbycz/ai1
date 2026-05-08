import type { NextApiRequest, NextApiResponse } from 'next';
import { getMediaWikiSession } from '../../src/server/upload/mediawiki/mediawiki';
import { serialize } from 'cookie';

const WIKI_SESSION_COOKIE = 'wikiSession';
const WIKI_USER_COOKIE = 'wikiUser';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = JSON.parse(req.body);
    if (!username || !password) {
      return res.status(400).json({ error: 'Missing username or password' });
    }

    const session = getMediaWikiSession();
    const loginResult = await session.login(username, password);

    if (loginResult.result !== 'Success') {
      return res.status(401).json({ error: loginResult.reason || 'Login failed' });
    }

    const sessionCookie = session.getSessionCookie();

    // Store wiki session in httpOnly cookie
    res.setHeader('Set-Cookie', [
      serialize(WIKI_SESSION_COOKIE, sessionCookie, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      }),
      serialize(WIKI_USER_COOKIE, username, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      }),
    ]);

    return res.status(200).json({ username });
  } catch (err) {
    console.error('wiki-login error:', err); // eslint-disable-line no-console
    return res.status(500).json({ error: String(err) });
  }
};
