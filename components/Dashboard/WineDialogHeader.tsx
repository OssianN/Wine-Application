import {
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from '@/components/ui/dialog';
import type { ReactNode } from 'react';

type WineDialogHeaderProps = {
  title: string | ReactNode;
  description: string | ReactNode;
  children?: ReactNode;
};

export const WineDialogHeader = ({
  title,
  description,
  children,
}: WineDialogHeaderProps) => {
  return (
    <DialogHeader className="flex flex-col items-center">
      {children}
      <DialogTitle className="pb-2">{title}</DialogTitle>
      <DialogDescription>{description}</DialogDescription>
    </DialogHeader>
  );
};
