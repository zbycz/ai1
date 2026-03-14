import { merge } from 'lodash';
import { fetchJson } from '../fetch';
import { Field } from './types/Fields';
import { intl } from '../intl';
import { publishDbgObject } from '../../utils';
import { FieldTranslation } from './types/Presets';
import { getOurTranslations } from './ourPresets';

// https://cdn.jsdelivr.net/npm/@openstreetmap/id-tagging-schema@6.1.0/dist/translations/en.min.json

// TODO download up-to-date or use node_module?
let translations = {};


export const getPresetTranslation = (key: string): string =>
  translations?.[intl.lang]?.presets?.presets?.[key]?.name ?? `[${key}]`;



export const getFieldTranslation = (field: Field): FieldTranslation => {
  if (!translations) return undefined;

  if (field.label?.match(/^{.*}$/)) {
    const resolved = field.label.substring(1, field.label.length - 1);
    return translations[intl.lang].presets.fields[resolved];
  }

  // The id 169522276 is different for each intl.language :(
  // https://www.transifex.com/openstreetmap/id-editor/translate/#cs/presets/169522276?q=key%3Apresets.fields.XXX
  return translations[intl.lang].presets.fields[field.fieldKey];
};
