import React from 'react';
import type { AppProps } from 'next/app';
import {
  AppCacheProvider,
  EmotionCacheProviderProps,
} from '@mui/material-nextjs/v13-pagesRouter';

type Props = AppProps & EmotionCacheProviderProps;

const MyApp = ({ Component, pageProps, emotionCache }: Props) => (
  <AppCacheProvider emotionCache={emotionCache}>
    {/* eslint-disable-next-line react/jsx-props-no-spreading */}
    <Component {...pageProps} />
  </AppCacheProvider>
);

export default MyApp;
