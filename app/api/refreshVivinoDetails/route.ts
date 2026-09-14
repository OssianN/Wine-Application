import { getUserSession } from '@/lib/session';
import {
  isVivinoLibraryRefreshOnCooldown,
  nextVivinoLibraryRefreshAt,
} from '@/lib/vivinoLibraryRefresh';
import { getUserWine } from '@/mongoDB/getUserWine';
import { connectMongo } from '@/mongoDB';
import {
  getVivinoLibraryRefreshedAt,
  stampVivinoLibraryRefresh,
} from '@/mongoDB/stampVivinoLibraryRefresh';
import { bulkUpdateVivinoDetailsInDb } from '@/mongoDB/updateVivinoDetailsInDb';
import { refreshVivinoDetailsForWines } from '@/scraping/refreshVivinoDetailsForWines';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const emptyResult = {
  updated: 0,
  skipped: 0,
  failed: 0,
  nextAvailableAt: null as string | null,
};

export async function GET() {
  const session = await getUserSession();
  if (!session.user) {
    return Response.json(
      { onCooldown: false, nextAvailableAt: null, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  await connectMongo();
  const refreshedAt = await getVivinoLibraryRefreshedAt(session.user._id);
  const nextAvailableAt = nextVivinoLibraryRefreshAt(refreshedAt);
  return Response.json({
    onCooldown: isVivinoLibraryRefreshOnCooldown(refreshedAt),
    nextAvailableAt: nextAvailableAt?.toISOString() ?? null,
    refreshedAt,
  });
}

export async function POST() {
  const session = await getUserSession();
  if (!session.user) {
    return Response.json(
      { ...emptyResult, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  await connectMongo();
  const stamp = await stampVivinoLibraryRefresh(session.user._id);
  if (!stamp.ok && stamp.reason === 'not_found') {
    return Response.json(
      { ...emptyResult, error: 'Not found' },
      { status: 404 }
    );
  }
  if (!stamp.ok) {
    return Response.json(
      {
        ...emptyResult,
        error: 'Refresh not available yet',
        nextAvailableAt: stamp.nextAvailableAt.toISOString(),
      },
      { status: 429 }
    );
  }

  const wines = await getUserWine({ _id: session.user._id });
  const result = await refreshVivinoDetailsForWines(wines);
  await bulkUpdateVivinoDetailsInDb(result.updates);
  revalidatePath('/dashboard');

  return Response.json({
    updated: result.updated,
    skipped: result.skipped,
    failed: result.failed,
    nextAvailableAt: stamp.nextAvailableAt.toISOString(),
  });
}
