import { Provider } from 'jotai';
import GlobalData from '@/components/GlobalData';
import { useEffect } from 'react';
import { checkUpdate } from '@tauri-apps/api/updater';
import { invoke } from "@tauri-apps/api/tauri";
import '../styles/globals.scss';


export default function App({ Component, pageProps }: any) {
  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    const update = await checkUpdate();
    if (update.shouldUpdate) {
      invoke('install_update');
    }
  };


  return (
    <Provider>
      <GlobalData>
        <Component {...pageProps} />
      </GlobalData>
    </Provider>
  );
}
