import { FORMAT, WIKI_URL } from './utils';

export const isTitleAvailable = async (title: string): Promise<boolean> => {
  const origin =
    typeof window !== 'undefined' ? window.location.origin : '*';
  const response = await fetch(WIKI_URL, {
    method: 'POST',
    body: new URLSearchParams({ action: 'query', titles: title, ...FORMAT, origin }),
  });
  const data = await response.json();
  return Boolean(data.query.pages[0].missing);
};
