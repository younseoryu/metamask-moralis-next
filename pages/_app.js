import { MoralisProvider } from "react-moralis";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <MoralisProvider
      appId='m7bGDJLViQ7lh1vVeTy2U53Z6erXZdyvF7PauEKo'
      serverUrl='https://yz0kxybv43ot.usemoralis.com:2053/server'
    >
      <Component {...pageProps} />
    </MoralisProvider>
  );
}

export default MyApp;
