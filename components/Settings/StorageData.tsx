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
    <div className="flex flex-col">
      <div className="flex flex-col gap-4 pt-8">
        <p>
          <span className="text-neutral-500">Total cost of all wines:</span>
          <span className="text-xl pl-4">{totalCost} kr</span>
        </p>
        <p>
          <span className="text-neutral-500">
            Total number of wine bottles:
          </span>
          <span className="text-xl pl-4">{totalNumberOfBottles}</span>
        </p>
        <p>
          <span className="text-neutral-500">Average year of all wines:</span>
          <span className="text-xl pl-4">{Math.floor(averageYear)}</span>
        </p>

        <p>
          <span className="text-neutral-500">Average price of all wines:</span>
          <span className="text-xl pl-4">{Math.floor(averagePrice)}</span>
        </p>
      </div>
    </div>
  );
};
