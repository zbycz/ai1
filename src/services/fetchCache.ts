import { isBrowser } from '../components/helpers';
import { prod } from './helpers';

const cache = {};

const SESSION_STORAGE_CACHE = {
  get: (key: string) => sessionStorage.getItem(key),
  remove: (key: string) => sessionStorage.removeItem(key),
  put: (key: string, value: string) => sessionStorage.setItem(key, value),
  clear: () => sessionStorage.clear(), // this is little dirty, but we use sessionStorage only for this
};

const LOCAL_STORAGE_CACHE = {
  get: (key: string) => localStorage.getItem(key),
  remove: (key: string) => localStorage.removeItem(key),
  put: (key: string, value: string) => localStorage.setItem(key, value),
  clear: () =>
    Object.keys(localStorage)
      .filter((k) => k.startsWith('http') || k.startsWith('/'))
      .forEach((k) => localStorage.removeItem(k)),
};

const MEMORY_CACHE = {
  get: (key: string) => cache[key],
  remove: (key: string) => delete cache[key],
  put: (key: string, value: string) => {
    cache[key] = value;
  },
  clear: () => {
    Object.keys(cache).forEach((key) => delete cache[key]);
  },
};

const fetchCache =
  global.window?.localStorage.getItem('store_requests_to_local_storage') ===
  'true'
    ? LOCAL_STORAGE_CACHE
    : !prod && isBrowser() // lets leave the sessionStorage cache only for DEV mode
      ? SESSION_STORAGE_CACHE
      : MEMORY_CACHE;

if (fetchCache === LOCAL_STORAGE_CACHE) {
  console.warn('Using store_requests_to_local_storage !!'); // eslint-disable-line no-console
}





