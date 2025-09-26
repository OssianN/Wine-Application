import { updateCurrentPriceInDb } from '@/mongoDB/updateCurrentPriceInDb';
import { getCurrentPriceOfWine } from '@/scraping/dataExtractUtils';
import { startBrowser } from '@/scraping/getHtmlFromInput';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title');
  const year = searchParams.get('year');
  const link = searchParams.get('vivinoUrl');
  const wineId = searchParams.get('wineId');

  if (!title || !year) return Response.json({ error: 'Missing title or year' });

  const browser = await startBrowser();

  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
  );
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto(link ?? '');

  const vivinoPrice = await getCurrentPriceOfWine(page);

  if (wineId && vivinoPrice) {
    updateCurrentPriceInDb(wineId, 0);
  }

  await browser.close();

  return Response.json(vivinoPrice);
}
