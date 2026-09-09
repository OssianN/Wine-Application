/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'images.vivino.com' },
      { hostname: 'web-common.vivino.com' },
      { hostname: 'product-cdn.systembolaget.se' },
    ],
  },
  reactStrictMode: false,
};

export default nextConfig;
