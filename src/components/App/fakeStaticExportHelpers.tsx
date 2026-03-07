import { View } from '../utils/MapStateContext';
import { isBrowser, isServer } from '../helpers';
import Cookies from 'js-cookie';
import Router from 'next/router';
import { OSM_USER_COOKIE } from '../../services/osm/consts';
import { getIdFromShortener } from '../../services/shortener';
import { getUrlOsmId } from '../../services/helpers';
import { isEqual } from 'lodash';
import { DEFAULT_VIEW } from './helpers';

const doLangRadirect = () => {
  if (window.location.pathname === '/') {
    if (Cookies.get('lang') && Cookies.get('lang') !== 'en') {
      window.location.href = `/${Cookies.get('lang')}`;
      return true;
    }
  }
};

const doShortenerRedirect = () => {
  const apiId = getIdFromShortener(window.location.pathname.substring(1));

  if (apiId !== null) {
    Router.replace(`/${getUrlOsmId(apiId)}`);
    return true;
  }
};

const doPWARedirect = () => {
  if (window.location.pathname === '/start') {
    const lastUrl = Cookies.get('last-url') || '/';
    Router.replace(lastUrl);
    return true;
  }
};

const forceReloadSameUrl = (cleanUrl: string) => {
  const suffix = cleanUrl.includes('?') ? '&' : '?';
  const hash = window.location.hash;
  Router.replace(`${cleanUrl}${suffix}${hash}`).then(() =>
    Router.replace(`${cleanUrl.replace(/[?&]$/, '')}${hash}`),
  );
};

let reloaded = false;

export const fakeStaticExportStartup = () => {
  if (!process.env.NEXT_PUBLIC_FAKE_STATIC_EXPORT) return;
  if (doLangRadirect()) return;
  if (doShortenerRedirect()) return;
  if (doPWARedirect()) return;

  if (!reloaded) {
    reloaded = true;
    console.log('FAKE_STATIC_EXPORT used, calling Router.replace()'); // eslint-disable-line no-console
    forceReloadSameUrl(`${window.location.pathname}${window.location.search}`);
  }
};

export const fakeStaticExportCookies = (cookies: Record<string, string>) => {
  if (!process.env.NEXT_PUBLIC_FAKE_STATIC_EXPORT || isServer()) {
    return cookies;
  }

  const localCookies = Cookies.get(); //we need first render to get browser cookies (formerly they were passed from SSR)
  return {
    ...localCookies,
    [OSM_USER_COOKIE]: JSON.parse(localCookies[OSM_USER_COOKIE] || 'null'),
  };
};

// Captured at module load time (app startup) so we can detect when the map is
// still showing the initially-restored view on a feature page (and skip persisting it
// until the map has actually moved to the feature's location).
const initialStoredView =
  isBrowser() && window.localStorage.getItem('mapView');

// we don't want to accidentally persist default view, when feature is loading
export const fakeStaticExportSkipDefaultMapView = (view: View): boolean => {
  if (!process.env.NEXT_PUBLIC_FAKE_STATIC_EXPORT) {
    return false;
  }

  if (
    window.location.pathname.match(/^\/(node|way|relation)\/\d+/) ||
    window.location.pathname.match(/^\/[-.0-9]+,[-.0-9]+$/)
  ) {
    if (isEqual(view, DEFAULT_VIEW)) {
      return true;
    }

    if (initialStoredView) {
      const storedView = initialStoredView.split('/');
      if (isEqual(storedView, view)) {
        return true;
      }
    }
  }

  return false;
};
