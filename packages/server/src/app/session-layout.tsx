'use client';

import { SessionProvider } from 'next-auth/react';
import { CookieConsentBanner } from '@/frontend/components/CookieConsentBanner';
import { Header } from '@/frontend/components/Header';
import { CookieConsentProvider, GlobalProvider } from '@/frontend/contexts';
import { initDataDogAnalytics } from '@/frontend/utils/datadog';
import { FC, PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

initDataDogAnalytics();

const queryClient = new QueryClient();

export const SessionLayout: FC<PropsWithChildren<{}>> = ({ children }) => {
  return (
    <SessionProvider refetchInterval={0}>
      <QueryClientProvider client={queryClient}>
        <GlobalProvider>
          <CookieConsentProvider>
            <div className="flex flex-col w-full min-h-screen relative">
              <Header className="fixed h-header" />
              <main className="relative m-after_header">{children}</main>
              <footer>
                <p className="text-xs p-4">
                  Built with <a href="https://quickdapp.xyz">QuickDapp</a>
                </p>
              </footer>
              <CookieConsentBanner />
            </div>
          </CookieConsentProvider>
        </GlobalProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
};
