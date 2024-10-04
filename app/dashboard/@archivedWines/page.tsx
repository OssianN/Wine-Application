import { WineTable } from '@/components/Dashboard/WineTable';
import { getUserSession } from '@/lib/session';
import { getUserWine } from '@/mongoDB/getUserWine';

export default async function Dashboard() {
  const { user } = await getUserSession();
  if (!user) return null;

  const wineList = await getUserWine(user._id);

  return (
    <WineTable data={JSON.parse(JSON.stringify(wineList))} isArchived={true} />
  );
}
