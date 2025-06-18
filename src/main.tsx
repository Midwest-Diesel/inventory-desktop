import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import GlobalData from './components/GlobalData';
import { APIProvider } from '@vis.gl/react-google-maps';
import { Provider } from 'jotai';
import App from './components/App';
import './styles/globals.scss';


const app = createRoot(document.getElementById('root')!);

app.render(
  <BrowserRouter>
    <Provider>
      <APIProvider apiKey={import.meta.env.VITE_PUBLIC_MAPS_API ?? ''}>
        <GlobalData>
          <App />
        </GlobalData>
      </APIProvider>
    </Provider>
  </BrowserRouter>
);
