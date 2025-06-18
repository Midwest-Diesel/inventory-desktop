import { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import routes from '~react-pages';
import Loading from './Library/Loading';


export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      { useRoutes(routes) }
    </Suspense>
  );
}
