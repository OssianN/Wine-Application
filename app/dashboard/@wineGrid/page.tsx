import { WineGrid } from '@/components/Dashboard/WineGrid';
import { getUserSession } from '@/lib/session';
import { getUserWine } from '@/mongoDB/getUserWine';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const session = await getUserSession();
  if (!session?.user) {
    redirect('/login');
  }
  const wineList = await getUserWine(session.user._id);

  return (
    <WineGrid data={JSON.parse(JSON.stringify(wineList))} user={session.user} />
  );
}
