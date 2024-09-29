/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ hostname: 'images.vivino.com' }],
  },
  reactStrictMode: false,
};

export default nextConfig;
