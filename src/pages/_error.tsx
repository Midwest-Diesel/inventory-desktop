'use client';

import { useEffect } from 'react';

interface Props {
  statusCode?: number
  error?: Error
}


export default function Error({ statusCode, error }: Props) {
  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  return (
    <html>
      <body>
        <main>
          <h2>{error?.name || `Error ${statusCode || 500}`}</h2>
          <p>{error?.message || 'An unexpected error has occurred.'}</p>
          <p>{error?.stack}</p>

          <button onClick={() => location.reload()}>
            Reload
          </button>
        </main>
      </body>
    </html>
  );
}
