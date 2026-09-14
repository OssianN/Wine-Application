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

const parseDate = (value?: string | Date | null) => {
  if (value == null) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
};

export const RefreshLibraryButton = ({
  vivinoLibraryRefreshedAt,
}: RefreshLibraryButtonProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lockedUntil, setLockedUntil] = useState<Date | null>(null);

  const nextAvailableAt =
    lockedUntil ?? nextVivinoLibraryRefreshAt(vivinoLibraryRefreshedAt);
  const onCooldown =
    (lockedUntil != null && lockedUntil.getTime() > Date.now()) ||
    isVivinoLibraryRefreshOnCooldown(vivinoLibraryRefreshedAt);
  const disabled = isRefreshing || onCooldown;

  const handleRefresh = async () => {
    if (disabled) return;
    const nextAt = nextVivinoLibraryRefreshAt(new Date());
    if (nextAt) setLockedUntil(nextAt);
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/refreshVivinoDetails', {
        method: 'POST',
      });
      const data = (await response.json().catch(() => ({}))) as RefreshResponse;
      const serverNextAt = parseDate(data.nextAvailableAt);
      if (serverNextAt) setLockedUntil(serverNextAt);

      if (response.status === 429) {
        const nextLabel = (serverNextAt ?? nextAt)
          ? formatVivinoLibraryRefreshDate(serverNextAt ?? nextAt!)
          : null;
        toast({
          title: 'Update not available yet',
          description: nextLabel
            ? `Next update available on ${nextLabel}.`
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
        aria-label="Update library"
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
