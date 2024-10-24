import { Provider } from 'jotai';
import GlobalData from '@/components/GlobalData';
import '../styles/globals.scss';


export default function App({ Component, pageProps }: any) {
  return (
    <Provider>
      <GlobalData>
        <Component {...pageProps} />
      </GlobalData>
    </Provider>
  );
}
