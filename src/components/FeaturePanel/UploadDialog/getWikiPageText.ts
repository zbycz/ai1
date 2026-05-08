import { Feature } from '../../../services/types';
import {
  getLabel,
  getParentLabel,
  getTypeLabel,
} from '../../../helpers/featureLabel';
import { getOsmappLink } from '../../../services/helpers';
import { join } from '../../../utils';
import { intl } from '../../../services/intl';

export type UploadFileInfo = {
  file: File;
  location: [number, number] | null;
  date: Date;
};

export const getTitle = (feature: Feature, file: UploadFileInfo) => {
  const name = join(
    getParentLabel(feature),
    ', ',
    getLabel(feature),
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
  const extension = file.file.name.split('.').pop();
  const fixedExtension =
    extension?.toLowerCase() === 'heic' ? 'jpg' : extension;
  return `${title} - OsmAPP${suffix}.${fixedExtension}`;
};

const getOsmappUrls = (feature: Feature) => {
  const osmappUrl = `https://osmapp.org${getOsmappLink(feature)}`;
  const openclimbingUrl = `https://openclimbing.org${getOsmappLink(feature)}`;
  return feature.tags.climbing
    ? `${osmappUrl}<br>${openclimbingUrl}`
    : osmappUrl;
};

export const getWikiPageText = (
  username: string,
  feature: Feature,
  file: UploadFileInfo,
) => {
  const lang = intl.lang || 'en';
  const title = getTitle(feature, file);
  const osmUserUrl = `https://www.openstreetmap.org/search?query=${encodeURIComponent(username)}`;
  const date = file.date.toISOString().replace(/\.\d+Z$/, 'Z');
  const osmappUrls = getOsmappUrls(feature);

  const fop =
    feature.countryCode === 'cz'
      ? '{{FoP-Czech_Republic}}'
      : feature.countryCode === 'de'
        ? '{{FoP-Germany}}'
        : '';

  return `
=={{int:filedesc}}==
{{Information
  |description  = {{${lang}|1=${title}}}
  |date         = ${date}
  |source       = {{Own photo}}
  |author       = [${osmUserUrl} ${username}]
  |other_fields =
    {{OSMLink |type=${feature.osmMeta.type} |OSM_ID=${feature.osmMeta.id} }}
    {{Information field |name= OsmAPP |value= ${osmappUrls} }}
}}
{{Location}}
{{Object location}}

=={{int:license-header}}==
{{Self|cc-by-4.0|author=[${osmUserUrl} ${username}]}}
${fop}
`;
};
