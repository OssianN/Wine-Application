import { getCurrentValueOfWine } from '@/scraping/getCurrentValueOfWine';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title');
  const year = searchParams.get('year');
  const link = searchParams.get('vivinoUrl');
  const wineId = searchParams.get('wineId');

  if (!title || !year) return Response.json({ error: 'Missing title or year' });

  const vivinoPrice = await getCurrentValueOfWine({
    title,
    year: Number(year),
    link,
    wineId,
  });

  return Response.json(vivinoPrice);
}
