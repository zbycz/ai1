import React, { createContext, useContext, useState } from 'react';
import Cookies from 'js-cookie';

const WIKI_USER_COOKIE = 'wikiUser';

type WikimediaAuthType = {
  wikiUser: string | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const WikimediaAuthContext = createContext<WikimediaAuthType>(undefined);

export const WikimediaAuthProvider = ({ children }) => {
  const [wikiUser, setWikiUser] = useState<string | null>(
    () => Cookies.get(WIKI_USER_COOKIE) || null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/wiki-login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }
      setWikiUser(data.username);
    } catch (e) {
      setError(e.message || String(e));
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await fetch('/api/wiki-logout', { method: 'POST' });
    Cookies.remove(WIKI_USER_COOKIE, { path: '/' });
    setWikiUser(null);
  };

  const value: WikimediaAuthType = {
    wikiUser,
    loading,
    error,
    login,
    logout,
  };

  return (
    <WikimediaAuthContext.Provider value={value}>
      {children}
    </WikimediaAuthContext.Provider>
  );
};

export const useWikimediaAuth = () => useContext(WikimediaAuthContext);
