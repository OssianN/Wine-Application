import { updateCurrentPriceInDb } from '@/mongoDB/updateCurrentPriceInDb';
import { getCurrentPriceOfWine } from '@/scraping/getCurrentPriceOfWine';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title');
  const year = searchParams.get('year');
  const link = searchParams.get('vivinoUrl');
  const wineId = searchParams.get('wineId');

  if (!title || !year) return Response.json({ error: 'Missing title or year' });

  const vivinoPrice = await getCurrentPriceOfWine({
    title,
    year: Number(year),
    link,
    wineId,
  });

  if (wineId && vivinoPrice) {
    updateCurrentPriceInDb(wineId, vivinoPrice);
  }

  return Response.json(vivinoPrice);
}
