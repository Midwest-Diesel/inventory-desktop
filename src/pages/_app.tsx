import { Provider } from 'jotai';
import GlobalData from '@/components/GlobalData';
import { useEffect } from 'react';
import '../styles/globals.scss';


export default function App({ Component, pageProps }: any) {
  useEffect(() => {
    // const init = async () => {
    //   await initApp();
    // };
    // init();
  }, []);


  return (
    <Provider>
      <GlobalData>
        <Component {...pageProps} />
      </GlobalData>
    </Provider>
  );
}
