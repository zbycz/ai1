import type { Feature } from '../../services/types';
import { UploadFileInfo } from './types';
import { getMediaWikiSession } from './mediawiki/mediawiki';
import { getFilename, getUploadData } from './getUploadData';
import { getPageId } from './mediawiki/getPageId';
import { claimsHelpers } from './mediawiki/claimsHelpers';
import { isTitleAvailable } from './mediawiki/isTitleAvailable';

const MAX_SUFFIX_ATTEMPTS = 20;

const findFreeSuffix = async (
  feature: Feature,
  file: UploadFileInfo,
): Promise<string> => {
  for (let i = 1; i < MAX_SUFFIX_ATTEMPTS; i++) {
    const suffix = i === 1 ? '' : ` (${i})`;
    const filename = getFilename(feature, file, suffix);
    const isFree = await isTitleAvailable(`File:${filename}`);
    if (isFree) {
      return suffix;
    }
  }
  throw new Error(`Could not find ${MAX_SUFFIX_ATTEMPTS} free suffixes for ${file.filename}`);
};

export const uploadToWikimediaCommons = async (
  wikiSession: string,
  username: string,
  feature: Feature,
  file: UploadFileInfo,
  lang: string,
) => {
  const session = getMediaWikiSession(wikiSession);

  const suffix = await findFreeSuffix(feature, file);
  const data = getUploadData(username, feature, file, lang, suffix);

  const blob = new Blob([file.buffer], { type: 'application/octet-stream' });
  const uploadResult = await session.upload(blob, data.filename, data.text);

  if (uploadResult?.upload?.result !== 'Success') {
    throw new Error(`Upload failed: ${JSON.stringify(uploadResult)}`);
  }

  const title = `File:${uploadResult?.upload.filename}`;
  const pageId = await getPageId(title);
  if (!pageId) {
    throw new Error(
      `Page not found: ${title}, uploadResult: ${JSON.stringify(uploadResult)}`,
    );
  }

  const claims = [
    claimsHelpers.createCopyrightLicense(),
    claimsHelpers.createCopyrightStatus(),
    claimsHelpers.createDate(data.date),
    ...(data.placeLocation
      ? [claimsHelpers.createPlaceLocation(data.placeLocation)]
      : []),
    ...(data.photoLocation
      ? [claimsHelpers.createPhotoLocation(data.photoLocation)]
      : []),
  ];
  const claimsResult = await session.editClaims(`M${pageId}`, claims);
  if (claimsResult.success !== 1) {
    throw new Error(`Claims failed: ${JSON.stringify(claimsResult)}`);
  }

  return {
    title,
    filename: data.filename,
    username: data.username,
    date: data.date,
    location: data.placeLocation,
  };
};
