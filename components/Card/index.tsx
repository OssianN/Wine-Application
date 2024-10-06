import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import type { ReactNode } from 'react';

type CardProps = {
  title: string;
  description: string;
  footer?: string | ReactNode;
  children: ReactNode;
};

export const CardComponent = ({
  title,
  description,
  footer,
  children,
}: CardProps) => {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
      <CardFooter className="flex justify-center">{footer}</CardFooter>
    </Card>
  );
};
