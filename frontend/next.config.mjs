/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  experimental: {
    // If you are testing standard incremental partial prefetching
    ppr: true, 
  },
};

export default nextConfig;
