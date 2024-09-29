import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { WineTable } from '@/components/WineTable';
import { getUserSession } from '@/lib/session';
import { getUserWine } from '@/mongoDB/getUserWine';

export default async function Dashboard() {
  const { user } = await getUserSession();
  if (!user) return null;

  const wineList = await getUserWine(user.wineList);

  return (
    <div className="py-6">
      <WineTable data={JSON.parse(JSON.stringify(wineList))} />
    </div>
  );
}
