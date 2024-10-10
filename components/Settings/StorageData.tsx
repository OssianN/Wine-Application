import { StorageDataItem } from './StorageDataItem';
import type { StorageDataType } from '@/lib/getStorageData';

export const StorageData = ({
  totalNumberOfBottles,
  totalCost,
  averageYear,
  averagePrice,
  usedSpacePercentage,
}: StorageDataType) => {
  return (
    <div className="flex flex-col gap-4">
      <StorageDataItem description="Total cost:" value={`${totalCost} kr`} />

      <StorageDataItem
        description="Total number of bottles:"
        value={String(totalNumberOfBottles)}
      />

      <StorageDataItem
        description="Average year:"
        value={String(Math.floor(averageYear))}
      />

      <StorageDataItem
        description="Average price:"
        value={`${String(Math.floor(averagePrice))} kr`}
      />

      <div className="flex flex-col gap-4 pt-4">
        <p className="text-sm flex gap-2 justify-between text-neutral-500">
          <span>Wines {Math.round(usedSpacePercentage)}%</span>
          <span>Free {100 - Math.round(usedSpacePercentage)}%</span>
        </p>
        <p
          className="w-full rounded-full h-4 bg-no-repeat border"
          style={{
            backgroundImage:
              'linear-gradient(hsl(var(--secondary-foreground)), hsl(var(--secondary-foreground)))',
            backgroundSize: `${usedSpacePercentage}%`,
          }}
        />
      </div>
    </div>
  );
};
