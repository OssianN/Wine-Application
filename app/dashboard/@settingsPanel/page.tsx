import { getUserSession } from '@/lib/session';
import { getStorageData } from '@/lib/getStorageData';
import { SettingsPanel } from '@/components/Settings';
import { getUserWine } from '@/mongoDB/getUserWine';
import { getVivinoLibraryRefreshedAt } from '@/mongoDB/stampVivinoLibraryRefresh';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await getUserSession();
  if (!session?.user) {
    redirect('/login');
  }

  const [wineList, vivinoLibraryRefreshedAt] = await Promise.all([
    getUserWine({ _id: session.user._id }),
    getVivinoLibraryRefreshedAt(session.user._id),
  ]);
  const storageData = getStorageData(
    wineList,
    session.user.shelves,
    session.user.columns
  );

  return (
    <SettingsPanel
      user={session.user}
      storageData={storageData}
      vivinoLibraryRefreshedAt={vivinoLibraryRefreshedAt}
    />
  );
}
