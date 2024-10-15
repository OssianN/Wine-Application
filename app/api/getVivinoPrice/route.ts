import { getAverageWinePrice } from '@/scraping/getAveragePrice';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title');
  const year = searchParams.get('year');
  const link = searchParams.get('vivinoUrl');

  if (!title || !year) return Response.json({ error: 'Missing title or year' });

  const vivinoPrice = await getAverageWinePrice({
    title,
    year: Number(year),
    link,
  });

  return Response.json(vivinoPrice);
}
