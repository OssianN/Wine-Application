import { getUserSession } from '@/lib/session';
import { connectMongo } from '@/mongoDB';
import { updateCurrentPriceInDb } from '@/mongoDB/updateCurrentPriceInDb';
import UserDataBase from '@/mongoDB/user-schema';
import { getVivinoPriceForWineYear } from '@/scraping/getVivinoPrice';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = await getUserSession();
  if (!session.user) {
    return Response.json(
      { price: null, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const wineId = Number(searchParams.get('wineId'));
  const year = Number(searchParams.get('year'));
  if (
    !id ||
    !Number.isInteger(wineId) ||
    wineId <= 0 ||
    !Number.isInteger(year)
  ) {
    return Response.json(
      { price: null, error: 'Missing id, wineId, or year' },
      { status: 400 }
    );
  }

  await connectMongo();
  const user = await UserDataBase.findById(session.user._id);
  const ownsWine = user?.wineList?.some((ownedId: unknown) => String(ownedId) === id);
  if (!ownsWine) {
    return Response.json({ price: null, error: 'Not found' }, { status: 404 });
  }

  const price = await getVivinoPriceForWineYear(wineId, year);
  if (price != null) {
    await updateCurrentPriceInDb(id, price);
  }

  return Response.json({ price });
}
