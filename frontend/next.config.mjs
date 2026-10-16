/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true, // Silences the warning and optimizes your app prefetching
};

export default nextConfig;
