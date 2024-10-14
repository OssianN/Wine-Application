import { cn } from '@/lib/utils';

type BlueBackgroundProps = {
  className?: string;
};

export const BlueBackground = ({ className }: BlueBackgroundProps) => (
  <div
    className={cn(
      'hidden dark:block blur-3xl absolute self-center bg-linear-gradient w-1/3 h-1/3 rounded-full -z-10',
      className
    )}
    style={{
      transform: 'translate3d(0, 0, 0)',
    }}
  />
);
