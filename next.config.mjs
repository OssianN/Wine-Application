/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ hostname: 'images.vivino.com' }],
  },
  reactStrictMode: false,
  experimental: {
    serverComponentsExternalPackages: ['@sparticuz/chromium'],
  },
};

export default nextConfig;
