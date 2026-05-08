import exifr from 'exifr';
import { Feature } from '../../../services/types';
import { getWikimediaClient } from './wikimediaClient';
import { getFilename, getWikiPageText, UploadFileInfo } from './getWikiPageText';
import { isTitleAvailable } from '../../../server/upload/mediawiki/isTitleAvailable';
import { getPageId } from '../../../server/upload/mediawiki/getPageId';
import { claimsHelpers } from '../../../server/upload/mediawiki/claimsHelpers';

const WIKIMEDIA_LIMIT = 100 * 1024 * 1024;

export const getExifData = async (
  file: File,
): Promise<{ location: [number, number] | null; date: Date }> => {
  try {
    const exif = await exifr.parse(file);
    const location =
      exif?.latitude && exif?.longitude
        ? ([exif.longitude, exif.latitude] as [number, number])
        : null;
    const date = exif?.DateTimeOriginal
      ? new Date(exif.DateTimeOriginal)
      : new Date();
    return { location, date };
  } catch {
    return { location: null, date: new Date() };
  }
};

const findFreeSuffix = async (
  feature: Feature,
  fileInfo: UploadFileInfo,
): Promise<string> => {
  for (let i = 1; i < 20; i++) {
    const suffix = i === 1 ? '' : ` (${i})`;
    const filename = getFilename(feature, fileInfo, suffix);
    const isFree = await isTitleAvailable(`File:${filename}`);
    if (isFree) {
      return suffix;
    }
  }
  throw new Error(`Could not find free suffix`);
};

export type UploadResult = {
  title: string;
  filename: string;
  location: [number, number] | null;
  date: Date;
  username: string;
};

export const uploadToWikimediaCommons = async (
  token: string,
  username: string,
  feature: Feature,
  file: File,
): Promise<UploadResult> => {
  if (file.size > WIKIMEDIA_LIMIT) {
    throw new Error('Maximum file size for Wikimedia Commons is 100 MB.');
  }

  const { location, date } = await getExifData(file);
  const fileInfo: UploadFileInfo = { file, location, date };

  const suffix = await findFreeSuffix(feature, fileInfo);
  const filename = getFilename(feature, fileInfo, suffix);
  const text = getWikiPageText(username, feature, fileInfo);

  const client = getWikimediaClient(token);
  const uploadResult = await client.upload(file, filename, text);

  if (uploadResult?.upload?.result !== 'Success') {
    throw new Error(`Upload failed: ${JSON.stringify(uploadResult)}`);
  }

  const title = `File:${uploadResult.upload.filename}`;
  const pageId = await getPageId(title);
  if (!pageId) {
    throw new Error(`Page not found after upload: ${title}`);
  }

  const photoLocation = location ?? (feature.center as [number, number]);
  const placeLocation = feature.center as [number, number];

  const claims = [
    claimsHelpers.createCopyrightLicense(),
    claimsHelpers.createCopyrightStatus(),
    claimsHelpers.createDate(date.toISOString()),
    ...(photoLocation ? [claimsHelpers.createPhotoLocation(photoLocation)] : []),
    ...(placeLocation ? [claimsHelpers.createPlaceLocation(placeLocation)] : []),
  ];

  const claimsResult = await client.editClaims(`M${pageId}`, claims);
  if (claimsResult.success !== 1) {
    throw new Error(`Claims failed: ${JSON.stringify(claimsResult)}`);
  }

  return { title, filename, location, date, username };
};
