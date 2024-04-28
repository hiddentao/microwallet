import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { FC, useContext } from 'react';

export interface GlobalContextValue {
  apiEndpoint: string;
}

export interface GlobalContextProviderConfig {
  apiEndpoint: string;
}

export const GlobalContext = React.createContext({} as GlobalContextValue);

const queryClient = new QueryClient();

export const GlobalProvider: FC<
  React.PropsWithChildren<GlobalContextProviderConfig>
> = ({ children, apiEndpoint }) => {
  return (
    <GlobalContext.Provider
      value={{
        apiEndpoint,
      }}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </GlobalContext.Provider>
  );
};

export const GlobalConsumer = GlobalContext.Consumer;

export const useGlobalContext = () => {
  return useContext(GlobalContext);
};
