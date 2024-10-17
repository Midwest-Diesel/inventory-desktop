/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    domains: ['mtpatobcpnpvwwanxyqy.supabase.co', 'http://127.0.0.1:54321', 'localhost', '127.0.0.1'],
    unoptimized: true,
  },
};

export default nextConfig;
