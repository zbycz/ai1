import { useCallback, useEffect, useState } from 'react';

const CLIENT_ID = process.env.NEXT_PUBLIC_WIKIMEDIA_CLIENT_ID;
const WIKI_AUTH_URL = 'https://meta.wikimedia.org/w/rest.php/oauth2/authorize';
const WIKI_TOKEN_URL =
  'https://meta.wikimedia.org/w/rest.php/oauth2/access_token';
const WIKI_USER_URL = 'https://meta.wikimedia.org/w/rest.php/oauth2/resource/profile';
const STORAGE_KEY = 'wikimedia_access_token';
const STORAGE_USER_KEY = 'wikimedia_user';

export type WikimediaUser = {
  name: string;
};

// PKCE helpers
const generateRandomString = (length: number) => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => chars[byte % chars.length]).join('');
};

const base64urlEncode = (buffer: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

const generateCodeChallenge = async (verifier: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64urlEncode(digest);
};

const getCallbackUrl = () =>
  `${window.location.origin}/wikimedia-oauth-token.html`;

const exchangeCodeForToken = async (
  code: string,
  verifier: string,
): Promise<string> => {
  const response = await fetch(WIKI_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: CLIENT_ID,
      redirect_uri: getCallbackUrl(),
      code_verifier: verifier,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Token exchange failed: ${text}`);
  }

  const data = await response.json();
  return data.access_token;
};

const fetchWikimediaUser = async (token: string): Promise<WikimediaUser> => {
  const response = await fetch(WIKI_USER_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  return { name: data.username };
};

export const useWikimediaAuth = () => {
  const [user, setUser] = useState<WikimediaUser | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_USER_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        // ignore parse error
      }
    }
  }, []);

  const login = useCallback(async () => {
    setLoading(true);
    try {
      const verifier = generateRandomString(64);
      const challenge = await generateCodeChallenge(verifier);

      const authUrl = new URL(WIKI_AUTH_URL);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('client_id', CLIENT_ID);
      authUrl.searchParams.set('redirect_uri', getCallbackUrl());
      authUrl.searchParams.set('code_challenge', challenge);
      authUrl.searchParams.set('code_challenge_method', 'S256');

      const popup = window.open(
        authUrl.toString(),
        'wikimediaAuth',
        'width=600,height=700,left=200,top=100',
      );

      const code = await new Promise<string>((resolve, reject) => {
        (window as any).wikimediaAuthComplete = (callbackUrl: string) => {
          delete (window as any).wikimediaAuthComplete;
          const url = new URL(callbackUrl);
          const code = url.searchParams.get('code');
          const error = url.searchParams.get('error');
          if (error) {
            reject(new Error(error));
          } else if (code) {
            resolve(code);
          } else {
            reject(new Error('No code in callback'));
          }
        };

        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            if ((window as any).wikimediaAuthComplete) {
              delete (window as any).wikimediaAuthComplete;
              reject(new Error('Popup closed'));
            }
          }
        }, 500);
      });

      const token = await exchangeCodeForToken(code, verifier);
      localStorage.setItem(STORAGE_KEY, token);

      const wikimediaUser = await fetchWikimediaUser(token);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(wikimediaUser));
      setUser(wikimediaUser);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    setUser(null);
  }, []);

  const getToken = useCallback(() => {
    return localStorage.getItem(STORAGE_KEY);
  }, []);

  return { user, loading, login, logout, getToken };
};
