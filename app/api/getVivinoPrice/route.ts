import { fetchWebsiteData } from '@/scraping/getVivinoData';
import { load } from 'cheerio';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('vivinoUrl');

  if (!url) return Response.json({ price: null, error: 'Missing URL' });

  const { content } = await fetchWebsiteData(url);
  const $ = load(content);
  const price = $('.purchaseAvailability__currentPrice--3mO4u').first().text();

  return Response.json({ price });
}
