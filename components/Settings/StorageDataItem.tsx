type StorageDataItemProps = {
  description: string;
  value: string;
};

export const StorageDataItem = ({
  description,
  value,
}: StorageDataItemProps) => {
  return (
    <p>
      <span className="text-neutral-500">{description}</span>
      <span className="text-xl pl-4">{value}</span>
    </p>
  );
};
