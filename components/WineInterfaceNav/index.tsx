import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type WineInterfaceMenubarProps = {
  value: string;
  onValueChange: (value: string) => void;
};
export const WineInterfaceNav = ({
  value,
  onValueChange,
}: WineInterfaceMenubarProps) => {
  return (
    <Tabs
      defaultValue="grid"
      value={value}
      onValueChange={onValueChange}
      className="w-[400px]"
    >
      <TabsList>
        <TabsTrigger value="grid">Grid</TabsTrigger>
        <TabsTrigger value="table">Table</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
