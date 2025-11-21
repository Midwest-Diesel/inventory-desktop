import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import GlobalData from './components/GlobalData';
import { APIProvider } from '@vis.gl/react-google-maps';
import { Provider } from 'jotai';
import App from './components/App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ErrorBoundary from './components/ErrorBoundry';
import './styles/globals.scss';


const app = createRoot(document.getElementById('root')!);
const queryClient = new QueryClient();
const queryOptions = {
  refetchOnWindowFocus: false,
  keepPreviousData: true
};
queryClient.setDefaultOptions({ queries: queryOptions });

app.render(
  <BrowserRouter>
    <Provider>
      <QueryClientProvider client={queryClient}>
        <APIProvider apiKey={import.meta.env.VITE_PUBLIC_MAPS_API ?? ''}>
          <GlobalData>
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
          </GlobalData>
        </APIProvider>
      </QueryClientProvider>
    </Provider>
  </BrowserRouter>
);
