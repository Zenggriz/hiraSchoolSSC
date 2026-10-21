/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    if (process.env.NODE_ENV !== 'development') return [];
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    return [{
      source: '/api/:path*',
      destination: `${backendUrl.replace(/\/+$/, '')}/api/:path*`,
    }];
  },
};

export default nextConfig;
