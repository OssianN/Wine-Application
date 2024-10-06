import { StorageDataItem } from './StorageDataItem';

type StorageDataProps = {
  totalNumberOfBottles: number;
  totalCost: number;
  averageYear: number;
  averagePrice: number;
};

export const StorageData = ({
  totalNumberOfBottles,
  totalCost,
  averageYear,
  averagePrice,
}: StorageDataProps) => {
  return (
    <div className="flex flex-col gap-4">
      <StorageDataItem
        description="Total cost of all wines:"
        value={`${totalCost} kr`}
      />

      <StorageDataItem
        description="Total number of wine bottles:"
        value={String(totalNumberOfBottles)}
      />

      <StorageDataItem
        description="Average year of all wines:"
        value={String(Math.floor(averageYear))}
      />

      <StorageDataItem
        description="Average price of all wines:"
        value={String(Math.floor(averagePrice))}
      />
    </div>
  );
};
