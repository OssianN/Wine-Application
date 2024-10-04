import { DashboardSubRoutes } from '@/app/dashboard/layout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Archive, Grid, Table } from 'lucide-react';

type WineInterfaceMenubarProps = {
  value: DashboardSubRoutes;
  onValueChange: (value: DashboardSubRoutes) => void;
};
export const WineInterfaceNav = ({
  value,
  onValueChange,
}: WineInterfaceMenubarProps) => {
  return (
    <Tabs
      defaultValue="grid"
      value={value}
      onValueChange={v => onValueChange(v as DashboardSubRoutes)}
      className="w-[400px]"
    >
      <TabsList>
        <TabsTrigger value="grid">
          <Grid />
        </TabsTrigger>
        <TabsTrigger value="table">
          <Table />
        </TabsTrigger>
        <TabsTrigger value="archived">
          <Archive />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
