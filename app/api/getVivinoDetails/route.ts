import { getUserSession } from '@/lib/session';
import { vivinoVintageIdFromUrl, vivinoWineIdFromUrl } from '@/lib/utils';
import { connectMongo } from '@/mongoDB';
import { updateVivinoDetailsInDb } from '@/mongoDB/updateVivinoDetailsInDb';
import UserDataBase from '@/mongoDB/user-schema';
import WineDataBase from '@/mongoDB/wine-schema';
import { getVivinoDetailsForWine } from '@/scraping/getVivinoDetails';

export const dynamic = 'force-dynamic';

const emptyDetails = {
  price: null,
  drinkingWindowStart: null,
  drinkingWindowEnd: null,
  drinkingWindowStatus: null,
};

const isPositiveInt = (value: number) => Number.isInteger(value) && value > 0;

export async function GET(req: Request) {
  const session = await getUserSession();
  if (!session.user) {
    return Response.json(
      { ...emptyDetails, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const queryWineId = Number(searchParams.get('wineId'));
  const queryYear = Number(searchParams.get('year'));
  const queryVintageId = Number(searchParams.get('vintageId'));
  if (!id) {
    return Response.json(
      { ...emptyDetails, error: 'Missing id' },
      { status: 400 }
    );
  }

  await connectMongo();
  const user = await UserDataBase.findById(session.user._id);
  const ownsWine = user?.wineList?.some(
    (ownedId: unknown) => String(ownedId) === id
  );
  if (!ownsWine) {
    return Response.json(
      { ...emptyDetails, error: 'Not found' },
      { status: 404 }
    );
  }

  const wine = await WineDataBase.findById(id).lean<{
    title?: string;
    year?: number;
    vintageId?: number | null;
    vivinoUrl?: string | null;
  }>();
  if (!wine) {
    return Response.json(
      { ...emptyDetails, error: 'Not found' },
      { status: 404 }
    );
  }

  const details = await getVivinoDetailsForWine({
    wineId: isPositiveInt(queryWineId)
      ? queryWineId
      : vivinoWineIdFromUrl(wine.vivinoUrl),
    year: Number.isInteger(queryYear) ? queryYear : wine.year,
    vintageId: isPositiveInt(queryVintageId)
      ? queryVintageId
      : wine.vintageId ?? vivinoVintageIdFromUrl(wine.vivinoUrl),
    title: wine.title,
  });

  await updateVivinoDetailsInDb(id, {
    currentPrice: details.price,
    vintageId: details.vintageId,
    drinkingWindowStart: details.drinkingWindowStart,
    drinkingWindowEnd: details.drinkingWindowEnd,
    drinkingWindowStatus: details.drinkingWindowStatus,
  });

  return Response.json({
    price: details.price,
    drinkingWindowStart: details.drinkingWindowStart,
    drinkingWindowEnd: details.drinkingWindowEnd,
    drinkingWindowStatus: details.drinkingWindowStatus,
  });
}
