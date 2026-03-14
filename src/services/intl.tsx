import React from 'react';
import Cookies from 'js-cookie';
import Router from 'next/router';
import { MessagesType, TranslationId } from './types';
import { isBrowser, isServer } from '../components/helpers';
import { getServerIntl } from './intlServer';
import { publishDbgObject } from '../utils';
import { LANGUAGES } from '../config.mjs';

type Values = { [variable: string]: string | number };

export interface Intl {
  lang: string;
  messages: MessagesType | {};
}

export const intl: Intl = {
  lang: '',
  messages: {},
};

const VARIABLE_REGEX = /__([a-zA-Z_]+)__/g;

const replaceValues = (text: string, values: Values) =>
  text.replace(VARIABLE_REGEX, (_, variableName) => {
    const value = values && values[variableName];
    return value != null ? `${value}` : '?';
  });


export const t = (id: TranslationId, values?: Values) => {
  const translation = intl.messages[id] ?? id;
  return replaceValues(translation, values);
};




const setIntl = (initialIntl: Intl) => {
  if (initialIntl) {
    if (!LANGUAGES[initialIntl.lang]) {
      throw new Error(`Invalid language: ${initialIntl.lang}`);
    }
    intl.lang = initialIntl.lang;
    intl.messages = initialIntl.messages;
    publishDbgObject('intl', intl);
  }
};


if (isBrowser()) {
  // GLOBAL_INTL is set in _document.tsx
  setIntl((window as any).GLOBAL_INTL);
}


// We got rid of intl context for easier usage. See commit "Intl: remove intlContext"
// Only drawback is page refresh while changing language... we can live with that :-)
// In future consider https://github.com/vinissimus/next-translate
