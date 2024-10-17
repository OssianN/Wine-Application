import type { ReactNode } from 'react';

type StorageDataItemProps = {
  description: string;
  value: string | ReactNode;
};

export const StorageDataItem = ({
  description,
  value,
}: StorageDataItemProps) => {
  return (
    <p className="w-full flex justify-between">
      <span className="text-neutral-500 text-sm">{description}</span>
      <span className="text-xl pl-4 font-electrolize">{value}</span>
    </p>
  );
};
