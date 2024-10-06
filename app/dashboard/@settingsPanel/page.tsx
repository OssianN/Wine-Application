import { SettingsPanel } from '@/components/Settings';
import { getStorageData } from '@/lib/getStorageData';
import { getUserSession } from '@/lib/session';
import { getUserWine } from '@/mongoDB/getUserWine';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const session = await getUserSession();
  if (!session?.user) {
    redirect('/login');
  }

  const wineList = await getUserWine({ _id: session.user._id });
  const storageData = getStorageData(wineList);

  return <SettingsPanel user={session.user} storageData={storageData} />;
}
