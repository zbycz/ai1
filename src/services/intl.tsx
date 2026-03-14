import React from 'react';
import Cookies from 'js-cookie';
import Router from 'next/router';
import { MessagesType } from './types';
import { isBrowser } from '../components/helpers';
import { publishDbgObject } from '../utils';
import { LANGUAGES } from '../config.mjs';


interface Intl {
  lang: string;
  messages: MessagesType | {};
}

export const intl: Intl = {
  lang: '',
  messages: {},
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
