import { getUserSession } from '@/lib/session';
import { connectMongo } from '@/mongoDB';
import { updateCurrentPriceInDb } from '@/mongoDB/updateCurrentPriceInDb';
import UserDataBase from '@/mongoDB/user-schema';
import {
  getVivinoCurrentPrice,
  parseVivinoUrl,
} from '@/scraping/getVivinoPrice';

export async function GET(req: Request) {
  const session = await getUserSession();
  if (!session.user) {
    return Response.json(
      { price: null, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const vivinoUrl = searchParams.get('vivinoUrl');
  const wineDocId = searchParams.get('wineId');
  const parsed = vivinoUrl ? parseVivinoUrl(vivinoUrl) : {};
  const vintageParam = searchParams.get('vintageId');
  const yearParam = searchParams.get('year');
  const vintageId = vintageParam ? Number(vintageParam) : parsed.vintageId;
  const year = yearParam ? Number(yearParam) : parsed.year;

  const price = await getVivinoCurrentPrice({
    vintageId: vintageId != null && Number.isFinite(vintageId) ? vintageId : undefined,
    wineId: parsed.wineId,
    year: year != null && Number.isFinite(year) ? year : undefined,
  });

  if (price != null && wineDocId) {
    await connectMongo();
    const user = await UserDataBase.findById(session.user._id);
    const ownsWine = user?.wineList?.some(
      (id: unknown) => String(id) === wineDocId
    );
    if (ownsWine) {
      await updateCurrentPriceInDb(wineDocId, price);
    }
  }

  return Response.json({ price });
}
