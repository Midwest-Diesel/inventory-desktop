import { Provider } from 'jotai';
import GlobalData from '@/components/GlobalData';
import { useEffect } from 'react';
import { APIProvider } from "@vis.gl/react-google-maps";
import { addTab, getTabsByUser } from '@/scripts/controllers/tabsController';
import { useNavState } from '@/components/Navbar/useNavState';
import '../styles/globals.scss';


export default function App({ Component, pageProps }: any) {
  // const { push } = useNavState();

  useEffect(() => {
    const handleMiddleClick = async (e: MouseEvent) => {
      if (e.button === 1) {
        const target = e.target as HTMLElement;
        const link = target.closest('a');
        if (!link) return;
        e.preventDefault();
        e.stopImmediatePropagation();
  
        const url = link.getAttribute('data-href');
        // await push(link.textContent, url);
      }
    };
    document.addEventListener('auxclick', handleMiddleClick);

    const fetchData = async () => {
      const tabs = await getTabsByUser();
      if (tabs && tabs.length === 0) await addTab([{ name: 'Home', url: '' }]);
    };
    fetchData();

    return () => {
      document.removeEventListener('auxclick', handleMiddleClick);
    };
  }, []);


  return (
    <Provider>
      <APIProvider apiKey={process.env.NEXT_PUBLIC_MAPS_API}>
        <GlobalData>
          <Component {...pageProps} />
        </GlobalData>
      </APIProvider>
    </Provider>
  );
}
