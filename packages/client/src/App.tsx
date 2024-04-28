import { GlobalProvider } from "./contexts/global";
import { Email } from "./ui/Email";

export const App = () => {
  return (
    <GlobalProvider apiEndpoint="http://localhost:3000/api/graphql">
      <div className="p-8">
        <Email />
      </div>
    </GlobalProvider>
  );
}
