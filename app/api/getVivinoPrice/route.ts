import { getUserSession } from '@/lib/session';
import { connectMongo } from '@/mongoDB';
import { updateCurrentPriceInDb } from '@/mongoDB/updateCurrentPriceInDb';
import UserDataBase from '@/mongoDB/user-schema';
import WineDataBase from '@/mongoDB/wine-schema';
import { getVivinoPriceForWineYear } from '@/scraping/getVivinoPrice';

export async function GET(req: Request) {
  const session = await getUserSession();
  if (!session.user) {
    return Response.json(
      { price: null, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const wineId = Number(searchParams.get('wineId'));
  const year = Number(searchParams.get('year'));
  if (!Number.isInteger(wineId) || wineId <= 0 || !Number.isInteger(year)) {
    return Response.json(
      { price: null, error: 'Missing wineId or year' },
      { status: 400 }
    );
  }

  const price = await getVivinoPriceForWineYear(wineId, year);

  if (price != null) {
    await connectMongo();
    const user = await UserDataBase.findById(session.user._id);
    const ownedIds = user?.wineList ?? [];
    const wines = await WineDataBase.find({ _id: { $in: ownedIds } });
    await Promise.all(
      wines
        .filter(
          wine =>
            Number(wine.year) === year &&
            String(wine.vivinoUrl ?? '').includes(`/w/${wineId}`)
        )
        .map(wine => updateCurrentPriceInDb(String(wine._id), price))
    );
  }

  return Response.json({ price });
}
