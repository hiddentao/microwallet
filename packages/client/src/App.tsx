import { GlobalProvider, useGlobalContext } from './contexts/global';
import { Email } from './ui/Email';

export const App = () => {
  const { wallet, serverKey } = useGlobalContext();
  
  return (
    <GlobalProvider apiEndpoint="http://localhost:3000/api/graphql">
      <div className="p-8">
        {serverKey ? (
          wallet ? (
            <div>Wallet: {wallet.address}</div>
          ) : (
            <div>[show pattern picker here]</div>
          )
        ) : (
        <Email />
        )}
      </div>
    </GlobalProvider>
  );
};
