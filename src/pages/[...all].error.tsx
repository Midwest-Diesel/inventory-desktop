import { useRouteError, isRouteErrorResponse } from 'react-router-dom';


export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  const errorMessage = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Unknown error';

  return (
    <main style={{
      padding: '1rem',
      margin: 'auto',
      borderRadius: '1rem',
      backgroundColor: '#424242',
      width: 'fit-content',
      height: 'fit-content'
    }}>
      <h2 style={{ color: '#f53535' }}>Error: Everything is on fire!!!</h2>
      <p>{ errorMessage }</p>
      { error instanceof Error && <pre>{ error.stack }</pre> }

      <button style={{ marginRight: '0.5rem' }} onClick={() => location.reload()}>Reload</button>
      <button onClick={() => location.replace('/')}>Home</button>
      <button onClick={() => localStorage.clear()}>Clear Local Storage</button>
    </main>
  );
}
