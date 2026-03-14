import React from 'react';
import type { AppProps } from 'next/app';
import {
  AppCacheProvider,
  EmotionCacheProviderProps,
} from '@mui/material-nextjs/v13-pagesRouter';
import { UserThemeProvider } from '../src/helpers/theme';
import { UserSettingsProvider } from '../src/components/utils/userSettings/UserSettingsContext';
import { SnackbarProvider } from '../src/components/utils/SnackbarContext';
import { OsmAuthProvider } from '../src/components/utils/OsmAuthContext';
import { QueryClient, QueryClientProvider } from 'react-query';
import { TicksProvider } from '../src/components/utils/TicksContext';

const queryClient = new QueryClient();

type Props = AppProps & EmotionCacheProviderProps;

const MyApp = ({ Component, pageProps, emotionCache }: Props) => (
  <AppCacheProvider emotionCache={emotionCache}>
    <UserThemeProvider userThemeCookie={undefined}>
      <SnackbarProvider>
        <UserSettingsProvider>
          <OsmAuthProvider cookies={{}}>
            <QueryClientProvider client={queryClient}>
              <TicksProvider>
                {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                <Component {...pageProps} />
              </TicksProvider>
            </QueryClientProvider>
          </OsmAuthProvider>
        </UserSettingsProvider>
      </SnackbarProvider>
    </UserThemeProvider>
  </AppCacheProvider>
);

export default MyApp;
