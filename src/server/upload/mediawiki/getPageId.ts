import { FORMAT, WIKI_URL } from './utils';

export const getPageId = async (title: string): Promise<number | undefined> => {
  const params = { action: 'query', titles: title, ...FORMAT };
  const response = await fetch(`${WIKI_URL}?${new URLSearchParams(params)}`);
  const data = await response.json();
  return data.query.pages?.[0]?.pageid;
};
