const isProd = process.env.NODE_ENV === 'production';
const internalHost = process.env.TAURI_DEV_HOST || 'localhost';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    domains: ['mtpatobcpnpvwwanxyqy.supabase.co', 'localhost', '127.0.0.1'],
    unoptimized: true,
  },
  assetPrefix: isProd ? '' : `http://${internalHost}:3000`,
};

export default nextConfig;
