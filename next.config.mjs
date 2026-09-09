/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'images.vivino.com' },
      { hostname: 'web-common.vivino.com' },
    ],
  },
  reactStrictMode: false,
};

export default nextConfig;
