import { WineGrid } from '@/components/Dashboard/WineGrid';
import { getUserSession } from '@/lib/session';
import { getUserWine } from '@/mongoDB/getUserWine';

export default async function Dashboard() {
  const { user } = await getUserSession();
  if (!user) return null;

  const wineList = await getUserWine(user._id);

  return <WineGrid data={JSON.parse(JSON.stringify(wineList))} user={user} />;
}
