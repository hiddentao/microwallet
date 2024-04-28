import { WalletConfig } from '../utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { FC, useCallback, useContext, useState } from 'react';

export interface GlobalContextValue {
  apiEndpoint: string
  serverKey: string
  setServerKey: (k: string) => void
  setUserKey: (k: string) => Promise<void>
  generatingWallet: boolean
  wallet?: WalletConfig
  logout: () => void
}

export interface GlobalContextProviderConfig {
  apiEndpoint: string  
}

export const GlobalContext = React.createContext({} as GlobalContextValue);

const queryClient = new QueryClient();

export const GlobalProvider: FC<
  React.PropsWithChildren<GlobalContextProviderConfig>
> = ({ children, apiEndpoint }) => {
  const [serverKey, setServerKey] = useState<string>('')
  const [generatingWallet, setGeneratingWallet] = useState<boolean>(false)
  const [wallet, setWallet] = useState<WalletConfig>()

  const logout = useCallback(() => {
    setServerKey('')
    setWallet(undefined)
  }, [])

  const setUserKey = useCallback(async (userKey: string) => {
    setGeneratingWallet(true)
    setWallet({ address: '', privateKey: userKey })
    setGeneratingWallet(false)
  }, [])

  return (
    <GlobalContext.Provider
      value={{
        apiEndpoint,
        serverKey,
        setServerKey,
        setUserKey,
        generatingWallet,
        wallet,
        logout,
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
