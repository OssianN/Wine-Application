/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ hostname: 'images.vivino.com' }],
  },
  reactStrictMode: false,
  serverExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
};

export default nextConfig;
