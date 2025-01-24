'use client';

import { useEffect } from 'react';

interface Props {
  statusCode?: number
  error?: Error
}


export default function Error({ statusCode, error }: Props) {
  useEffect(() => {
    if (error) console.error(error);
  }, [error]);
  

  return (
    <html>
      <body style={{ alignContent: 'center' }}>
        <main style={{ padding: '1rem', margin: 'auto', borderRadius: '1rem', backgroundColor: '#424242', width: 'fit-content', height: 'fit-content' }}>
          <h2 style={{ color: '#f53535' }}>{ error?.name || `Error ${statusCode || 500}` }</h2>
          <p>{ error?.message || 'An unexpected error has occurred.' }</p>
          <p>{ error?.stack }</p>

          <button style={{ width: 'fit-content' }} onClick={() => location.reload()}>Reload</button>
        </main>
      </body>
    </html>
  );
}