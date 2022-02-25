import { MoralisProvider } from "react-moralis";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <MoralisProvider
      appId='mdg1EwM6mQAqtpHuaSlxz6KPdg9WQNJTqflxcEAa'
      serverUrl='https://6vkya9bhclwf.usemoralis.com:2053/server'
    >
      <Component {...pageProps} />
    </MoralisProvider>
  );
}

export default MyApp;
