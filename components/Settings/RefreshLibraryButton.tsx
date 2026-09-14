'use client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  formatVivinoLibraryRefreshDate,
  isVivinoLibraryRefreshOnCooldown,
  nextVivinoLibraryRefreshAt,
} from '@/lib/vivinoLibraryRefresh';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type RefreshLibraryButtonProps = {
  vivinoLibraryRefreshedAt: string | null;
};

type RefreshResponse = {
  updated?: number;
  skipped?: number;
  failed?: number;
  nextAvailableAt?: string | null;
  error?: string;
};

export const RefreshLibraryButton = ({
  vivinoLibraryRefreshedAt,
}: RefreshLibraryButtonProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onCooldown = isVivinoLibraryRefreshOnCooldown(vivinoLibraryRefreshedAt);
  const nextAvailableAt = nextVivinoLibraryRefreshAt(vivinoLibraryRefreshedAt);
  const disabled = isRefreshing || onCooldown;

  const handleRefresh = async () => {
    if (disabled) return;
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/refreshVivinoDetails', {
        method: 'POST',
      });
      const data = (await response.json().catch(() => ({}))) as RefreshResponse;

      if (response.status === 429) {
        const nextAt = data.nextAvailableAt
          ? formatVivinoLibraryRefreshDate(data.nextAvailableAt)
          : null;
        toast({
          title: 'Update not available yet',
          description: nextAt
            ? `Next update available on ${nextAt}.`
            : 'You can update the library again in 30 days.',
          variant: 'destructive',
        });
        router.refresh();
        return;
      }

      if (!response.ok) {
        toast({
          title: 'Could not update library',
          description: data.error ?? 'Something went wrong, try again later.',
          variant: 'destructive',
        });
        return;
      }

      const updated = data.updated ?? 0;
      const skipped = data.skipped ?? 0;
      const failed = data.failed ?? 0;
      toast({
        title: 'Library updated',
        description: `Updated ${updated} wine${updated === 1 ? '' : 's'}. ${skipped} skipped, ${failed} failed.`,
      });
      router.refresh();
    } catch {
      toast({
        title: 'Could not update library',
        description: 'Something went wrong, try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <Button
        className="w-full"
        type="button"
        disabled={disabled}
        onClick={handleRefresh}
      >
        {isRefreshing ? <Loader2 className="animate-spin" /> : 'Update library'}
      </Button>
      {onCooldown && nextAvailableAt ? (
        <p className="text-sm text-neutral-500 text-center">
          Next update available on {formatVivinoLibraryRefreshDate(nextAvailableAt)}
        </p>
      ) : (
        <p className="text-sm text-neutral-500 text-center">
          Available once every 30 days.
        </p>
      )}
    </div>
  );
};
