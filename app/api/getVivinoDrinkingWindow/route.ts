import { getUserSession } from '@/lib/session';
import { connectMongo } from '@/mongoDB';
import { updateDrinkingWindowInDb } from '@/mongoDB/updateDrinkingWindowInDb';
import UserDataBase from '@/mongoDB/user-schema';
import { getDrinkingWindowForVintage } from '@/scraping/getDrinkingWindow';

export const dynamic = 'force-dynamic';

const emptyWindow = {
  drinkingWindowStart: null,
  drinkingWindowEnd: null,
  drinkingWindowStatus: null,
};

export async function GET(req: Request) {
  const session = await getUserSession();
  if (!session.user) {
    return Response.json(
      { ...emptyWindow, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const vintageId = Number(searchParams.get('vintageId'));
  if (!id || !Number.isInteger(vintageId) || vintageId <= 0) {
    return Response.json(
      { ...emptyWindow, error: 'Missing id or vintageId' },
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
      { ...emptyWindow, error: 'Not found' },
      { status: 404 }
    );
  }

  const window = await getDrinkingWindowForVintage(vintageId);
  if (
    window &&
    (window.drinkingWindowStart != null ||
      window.drinkingWindowEnd != null ||
      window.drinkingWindowStatus != null)
  ) {
    await updateDrinkingWindowInDb(id, {
      drinkingWindowStart: window.drinkingWindowStart ?? null,
      drinkingWindowEnd: window.drinkingWindowEnd ?? null,
      drinkingWindowStatus: window.drinkingWindowStatus ?? null,
    });
  }

  return Response.json({
    drinkingWindowStart: window?.drinkingWindowStart ?? null,
    drinkingWindowEnd: window?.drinkingWindowEnd ?? null,
    drinkingWindowStatus: window?.drinkingWindowStatus ?? null,
  });
}
