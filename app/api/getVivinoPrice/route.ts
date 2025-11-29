import { fetchWebsiteData } from '@/scraping/getVivinoData';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title');

  if (!title) return Response.json({ error: 'Missing title or year' });

  const data = await fetchWebsiteData(title);

  return Response.json(data);
}
