import { Provider } from 'jotai';
import GlobalData from '@/components/GlobalData';
import { useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import '../styles/globals.scss';


export default function App({ Component, pageProps }: any) {
  useEffect(() => {
    document.addEventListener('mouseup', (e: MouseEvent) => {
      if (e.button === 1) {
        const target = e.target as HTMLElement;
        if (target) {
          const link = target.closest('a');
          if (!link) return;
          e.preventDefault();
          e.stopImmediatePropagation();
          const url = link.href;
          invoke('open_window', { windowArgs: { title: 'Inventory', url }});
        }
      }
    });
  }, []);


  return (
    <Provider>
      <GlobalData>
        <Component {...pageProps} />
      </GlobalData>
    </Provider>
  );
}
