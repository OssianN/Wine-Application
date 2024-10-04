import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ReactNode } from 'react';

export const LoginFormCard = ({ children }: { children: ReactNode }) => {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Log in</CardTitle>
        <CardDescription>Your wines are waiting for you.</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="link">Register</Button>
      </CardFooter>
    </Card>
  );
};
