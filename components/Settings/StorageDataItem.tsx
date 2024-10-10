type StorageDataItemProps = {
  description: string;
  value: string;
};

export const StorageDataItem = ({
  description,
  value,
}: StorageDataItemProps) => {
  return (
    <p className="w-full flex justify-between">
      <span className="text-neutral-500 text-sm">{description}</span>
      <span className="text-xl pl-4">{value}</span>
    </p>
  );
};
