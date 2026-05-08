import type { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

const WIKI_SESSION_COOKIE = 'wikiSession';
const WIKI_USER_COOKIE = 'wikiUser';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Set-Cookie', [
    serialize(WIKI_SESSION_COOKIE, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    }),
    serialize(WIKI_USER_COOKIE, '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    }),
  ]);

  return res.status(200).json({ success: true });
};
