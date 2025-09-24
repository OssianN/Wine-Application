import { updateCurrentPriceInDb } from '@/mongoDB/updateCurrentPriceInDb';
import { getCurrentPriceOfWine } from '@/scraping/dataExtractUtils';
import { startBrowserContext } from '@/scraping/getHtmlFromInput';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title');
  const year = searchParams.get('year');
  const link = searchParams.get('vivinoUrl');
  const wineId = searchParams.get('wineId');

  if (!title || !year) return Response.json({ error: 'Missing title or year' });

  const { browser, context } = await startBrowserContext();

  const page = await context.newPage();
  await page.goto(link ?? '');

  const vivinoPrice = await getCurrentPriceOfWine(page);

  if (wineId && vivinoPrice) {
    updateCurrentPriceInDb(wineId, 0);
  }

  browser.close();

  return Response.json(vivinoPrice);
}
