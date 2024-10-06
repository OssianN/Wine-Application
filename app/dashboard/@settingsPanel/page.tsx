import { SettingsPanel } from '@/components/Settings';
import { getStorageData } from '@/lib/getStorageData';
import { getUserSession } from '@/lib/session';
import { getUserWine } from '@/mongoDB/getUserWine';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const { user } = await getUserSession();
  if (!user) {
    redirect('/login');
  }

  const wineList = await getUserWine(user._id);
  const storageData = getStorageData(wineList);

  return (
    <SettingsPanel
      user={user}
      wineList={JSON.parse(JSON.stringify(wineList))}
      storageData={storageData}
    />
  );
}
