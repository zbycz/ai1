import { FORMAT, WIKI_URL, UploadParams, getUploadBody } from '../../../server/upload/mediawiki/utils';

type Params = Record<string, string>;

export const getWikimediaClient = (token: string) => {
  const origin = typeof window !== 'undefined' ? window.location.origin : '*';
  const authHeader = `Bearer ${token}`;

  const GET = async (action: string, params: Params) => {
    const query = new URLSearchParams({
      action,
      ...params,
      ...FORMAT,
      origin,
    });
    const response = await fetch(`${WIKI_URL}?${query}`, {
      headers: { Authorization: authHeader },
    });
    return response.json();
  };

  const POST = async (action: string, params: Params) => {
    const formData = new URLSearchParams({ action, ...params, ...FORMAT, origin });
    const response = await fetch(WIKI_URL, {
      method: 'POST',
      headers: { Authorization: authHeader },
      body: formData,
    });
    return response.json();
  };

  const UPLOAD = async (action: string, params: UploadParams) => {
    const body = getUploadBody({ action, ...params, ...FORMAT, origin });
    const response = await fetch(WIKI_URL, {
      method: 'POST',
      headers: { Authorization: authHeader },
      body,
    });
    return response.json();
  };

  const getCsrfToken = async () => {
    const data = await GET('query', { meta: 'tokens', type: 'csrf' });
    return data.query.tokens.csrftoken;
  };

  const upload = async (file: File, filename: string, text: string) => {
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

  return { upload, editClaims };
};
