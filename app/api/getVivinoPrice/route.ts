export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('vivinoUrl');

  if (!url) return Response.json({ price: null, error: 'Missing URL' });

  return Response.json({ price: null });
}
