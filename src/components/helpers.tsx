import { useMediaQuery } from '@mui/material';




export function isBrowser() {
  return typeof window !== 'undefined';
}

export function isServer() {
  return typeof window === 'undefined';
}









// (<= tablet size) MobileMode shows FeaturePanel in Drawer (instead of side)
const isMobileMode = '(max-width: 700px)';
export const useMobileMode = () => useMediaQuery(isMobileMode);

// (>= mobile size) SearchBox stops growing

// TODO refactor breakpoints later

// is mobile device - specific behaviour like longpress or geouri



// TODO import { NoSsr } from '@mui/base';
