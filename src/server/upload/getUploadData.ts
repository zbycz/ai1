import type { Feature } from '../../services/types';
import { UploadFileInfo } from './types';
import {
  getLabelWithoutFallback,
  getParentLabel,
  getTypeLabel,
} from '../../helpers/featureLabel';
import {
  getOsmappLink,
} from '../../services/helpers';
import { join } from '../../utils';

const PROJECT_URL = 'https://osmapp.org';

const getOsmappUrls = (feature: Feature) => {
  const osmappUrl = `${PROJECT_URL}${getOsmappLink(feature)}`;
  const openclimbingUrl = `https://openclimbing.org${getOsmappLink(feature)}`;

  if (feature.tags.climbing) {
    return `${osmappUrl}<br>${openclimbingUrl}`;
  } else {
    return `${osmappUrl}`;
  }
};

export const getTitle = (feature: Feature, file: UploadFileInfo) => {
  const name = join(
    getParentLabel(feature),
    ', ',
    getLabelWithoutFallback(feature),
  );
  const presetName = getTypeLabel(feature);
  const location = file.location ?? feature.center;
  return name
    ? `${name} (${presetName})`
    : `${presetName} at ${location.map((x) => x.toFixed(5))}`;
};

export const getFilename = (
  feature: Feature,
  file: UploadFileInfo,
  suffix: string,
) => {
  const title = getTitle(feature, file);
  const extension = file.filename.split('.').pop();
  const fixedExtension = extension.toLowerCase() === 'heic' ? 'jpg' : extension;
  return `${title} - OsmAPP${suffix}.${fixedExtension}`;
};

export const getUploadData = (
  username: string,
  feature: Feature,
  file: UploadFileInfo,
  lang: string,
  suffix: string,
) => {
  const title = getTitle(feature, file);
  const filename = getFilename(feature, file, suffix);
  const osmUserUrl = `https://www.openstreetmap.org/user/${username}`;
  const date = file.date.toISOString().replace(/\.\d+Z$/, 'Z');
  const osmappUrls = getOsmappUrls(feature);

  const fop =
    feature.countryCode === 'cz'
      ? '{{FoP-Czech_Republic}}'
      : feature.countryCode === 'de'
        ? '{{FoP-Germany}}'
        : '';

  const text = `
=={{int:filedesc}}==
{{Information
  |description  = {{${lang}|1=${title}}}
  |date         = ${date}
  |source       = {{Own photo}}
  |author       = OpenStreetMap user [${osmUserUrl} ${username}]
  |other_fields =
    {{OSMLink |type=${feature.osmMeta.type} |OSM_ID=${feature.osmMeta.id} }}
    {{Information field |name= OsmAPP |value= ${osmappUrls} }}
}}
{{Location}}
{{Object location}}

=={{int:license-header}}==
{{Self|cc-by-sa-4.0|author=OpenStreetMap user [${osmUserUrl} ${username}]}}
${fop}
`;

  return {
    filename,
    text,
    date,
    photoLocation: file.location,
    placeLocation: feature.center,
    username,
  };
};
