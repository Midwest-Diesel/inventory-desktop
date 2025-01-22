'use client';

import Link from 'next/link';
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
      <body>
        <main style={{ padding: '1rem', margin: 'auto', borderRadius: '1rem', backgroundColor: '#424242' }}>
          <h2 style={{ color: '#AC3939' }}>{error?.name || `Error ${statusCode || 500}`}</h2>
          <p>{error?.message || 'An unexpected error has occurred.'}</p>
          <p>{error?.stack}</p>

          <button onClick={() => location.reload()}>Reload</button>
          <Link href="/">Home</Link>
        </main>
      </body>
    </html>
  );
}
