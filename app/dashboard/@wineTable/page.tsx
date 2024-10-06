import { WineTable } from '@/components/Dashboard/WineTable';
import { getUserSession } from '@/lib/session';
import { getUserWine } from '@/mongoDB/getUserWine';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const { user } = await getUserSession();
  if (!user) {
    redirect('/login');
  }

  const wineList = await getUserWine(user._id);

  return <WineTable data={JSON.parse(JSON.stringify(wineList))} />;
}
