import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { readFile } from 'node:fs/promises';
import { getApiId } from '../../src/services/helpers';
import { fetchFeature } from '../../src/services/osm/osmApi';
import { Feature } from '../../src/services/types';
import { setProjectForSSR } from '../../src/services/project';
import { uploadToWikimediaCommons } from '../../src/server/upload/uploadToWikimediaCommons';
import { UploadFileInfo } from '../../src/server/upload/types';
import { LonLat } from '../../src/services/types';
import { setIntl } from '../../src/services/intl';

const WIKI_SESSION_COOKIE = 'wikiSession';
const WIKI_USER_COOKIE = 'wikiUser';

export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = (
  req: NextApiRequest,
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return new Promise((resolve, reject) => {
    const form = formidable({ maxFileSize: 50 * 1024 * 1024 }); // 50 MB
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    setProjectForSSR(req);

    const wikiSession = req.cookies[WIKI_SESSION_COOKIE];
    const wikiUser = req.cookies[WIKI_USER_COOKIE];

    if (!wikiSession || !wikiUser) {
      return res.status(401).json({ error: 'Not logged in to Wikimedia' });
    }

    const { fields, files } = await parseForm(req);

    const shortId = Array.isArray(fields.shortId)
      ? fields.shortId[0]
      : fields.shortId;
    const lang = Array.isArray(fields.lang) ? fields.lang[0] : fields.lang;
    const locationStr = Array.isArray(fields.location)
      ? fields.location[0]
      : fields.location;
    const dateStr = Array.isArray(fields.date) ? fields.date[0] : fields.date;
    const originalFilename = Array.isArray(fields.filename)
      ? fields.filename[0]
      : fields.filename;

    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!uploadedFile) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    setIntl({ lang, messages: [] });

    const apiId = getApiId(shortId);
    let feature: Feature;
    try {
      feature = await fetchFeature(apiId);
    } catch (e) {
      return res.status(400).json({ error: `Failed to fetch feature: ${e}` });
    }

    const buffer = await readFile(uploadedFile.filepath);
    const location: LonLat | null = locationStr
      ? (JSON.parse(locationStr) as LonLat)
      : null;
    const date = dateStr ? new Date(dateStr) : new Date();

    const file: UploadFileInfo = {
      buffer,
      filename: originalFilename || uploadedFile.originalFilename || 'photo.jpg',
      location,
      date,
    };

    const result = await uploadToWikimediaCommons(
      wikiSession,
      wikiUser,
      feature,
      file,
      lang || 'en',
    );

    return res.status(200).json(result);
  } catch (err) {
    console.error('wiki-upload error:', err); // eslint-disable-line no-console
    return res.status(500).json({ error: String(err) });
  }
};
