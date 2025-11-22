const CHROMIUM_PACK_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/chromium-pack.tar`
  : 'https://github.com/gabenunez/puppeteer-on-vercel/raw/refs/heads/main/example/chromium-dont-use-in-prod.tar';

let cachedExecutablePath: string | null = null;
let downloadPromise: Promise<string> | null = null;

export async function getChromiumPath(): Promise<string> {
  if (cachedExecutablePath) return cachedExecutablePath;

  if (!downloadPromise) {
    const chromium = (await import('@sparticuz/chromium-min')).default;
    downloadPromise = chromium
      .executablePath(CHROMIUM_PACK_URL)
      .then(path => {
        cachedExecutablePath = path;
        console.log('Chromium path resolved:', path);
        return path;
      })
      .catch(error => {
        console.error('Failed to get Chromium path:', error);
        downloadPromise = null; // Reset on error to allow retry
        throw error;
      });
  }

  return downloadPromise;
}
