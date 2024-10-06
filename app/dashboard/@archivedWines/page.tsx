import { WineTable } from '@/components/Dashboard/WineTable';
import { getUserSession } from '@/lib/session';
import { getUserWine } from '@/mongoDB/getUserWine';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const session = await getUserSession();
  if (!session?.user) {
    redirect('/login');
  }

  const wineList = await getUserWine({
    _id: session.user._id,
    isArchived: true,
  });

  return <WineTable data={JSON.parse(JSON.stringify(wineList))} />;
}
