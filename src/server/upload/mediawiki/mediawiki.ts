import {
  cookieJar,
  FORMAT,
  getUploadBody,
  UploadParams,
  WIKI_URL,
} from './utils';

type Params = Record<string, string>;

export const getMediaWikiSession = (initialCookie?: string) => {
  let sessionCookie: string | undefined = initialCookie;

  const GET = async (action: string, params: Params) => {
    const query = new URLSearchParams({ action, ...params, ...FORMAT });
    const response = await fetch(`${WIKI_URL}?${query}`, {
      headers: { Cookie: sessionCookie },
    });
    sessionCookie = cookieJar(sessionCookie, response);
    return response.json();
  };

  const POST = async (action: string, params: Params) => {
    const query = new URLSearchParams({ action, ...params, ...FORMAT });
    const response = await fetch(WIKI_URL, {
      method: 'POST',
      headers: { Cookie: sessionCookie },
      body: query,
    });
    sessionCookie = cookieJar(sessionCookie, response);
    return response.json();
  };

  const UPLOAD = async (action: string, params: UploadParams) => {
    const response = await fetch(WIKI_URL, {
      method: 'POST',
      headers: { Cookie: sessionCookie },
      body: getUploadBody({ action, ...params, ...FORMAT }),
    });
    sessionCookie = cookieJar(sessionCookie, response);
    return response.json();
  };

  const getLoginToken = async (): Promise<string> => {
    const data = await GET('query', { meta: 'tokens', type: 'login' });
    return data.query.tokens.logintoken;
  };

  const login = async (lgname: string, lgpassword: string) => {
    const lgtoken = await getLoginToken();
    const data = await POST('login', { lgname, lgpassword, lgtoken });
    return data.login;
  };

  const getCsrfToken = async () => {
    const data = await GET('query', { meta: 'tokens', type: 'csrf' });
    return data.query.tokens.csrftoken;
  };

  const getUserInfo = async () => {
    const data = await GET('query', { meta: 'userinfo' });
    return data.query.userinfo;
  };

  const upload = async (file: Blob, filename: string, text: string) => {
    const token = await getCsrfToken();

    const data = await UPLOAD('upload', {
      file,
      filename,
      text,
      comment: 'Initial upload from OsmAPP.org',
      token,
    });
    return data;
  };

  const editClaims = async (pageId: string, claims: unknown[]) => {
    const token = await getCsrfToken();
    const data = await POST('wbeditentity', {
      id: pageId,
      data: JSON.stringify({ claims }),
      token,
    });
    return data;
  };

  const getSessionCookie = () => sessionCookie;

  return {
    login,
    getCsrfToken,
    getUserInfo,
    upload,
    editClaims,
    getSessionCookie,
  };
};
