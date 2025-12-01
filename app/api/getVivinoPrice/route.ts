// import { fetchWebsiteData } from '@/scraping/getVivinoData';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('vivinoUrl');

  if (!url) return Response.json({ price: null, error: 'Missing URL' });

  // const { value } = await fetchWebsiteData(url);
  // const price = $('.purchaseAvailability__currentPrice--3mO4u').first().text();

  return Response.json({ price: null });
}
