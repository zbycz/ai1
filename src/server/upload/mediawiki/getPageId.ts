import { FORMAT, WIKI_URL } from './utils';

/*
[
  {
    "pageid": 151835618,
    "ns": 6,
    "title": "File:Patník N.73 (Boundary Stone) - OsmAPP.jpg"
  }
]
*/

export const getPageId = async (title: string): Promise<number | undefined> => {
  const origin =
    typeof window !== 'undefined' ? window.location.origin : '*';
  const params = { action: 'query', titles: title, ...FORMAT, origin };
  const response = await fetch(`${WIKI_URL}?${new URLSearchParams(params)}`);
  const data = await response.json();
  return data.query.pages?.[0]?.pageid;
};
