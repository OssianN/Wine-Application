'use client';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getUserSession } from '@/lib/session';
import { getUserWine } from '@/mongoDB/getUserWine';
import { unarchiveWine } from '@/mongoDB/unarchiveWine';
import type { Wine } from '@/types';
import { WineDialogHeader } from './WineDialogHeader';

type UnarchiveWineDialogProps = {
  wine: Wine;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRestored: () => void;
};

type CellarSlot = {
  key: string;
  label: string;
  shelf: number;
  column: number;
};

export const UnarchiveWineDialog = ({
  wine,
  open,
  onOpenChange,
  onRestored,
}: UnarchiveWineDialogProps) => {
  const [slots, setSlots] = useState<CellarSlot[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;

    setComment('');
    setError('');
    setSelected(null);
    setSlots([]);

    let cancelled = false;

    const loadOpenSlots = async () => {
      setLoading(true);
      try {
        const session = await getUserSession();
        if (!session.user || cancelled) return;

        const activeWines = await getUserWine({
          _id: session.user._id,
          isArchived: false,
        });
        if (cancelled) return;

        const taken = new Set(
          activeWines.map(active => `${active.shelf}:${active.column}`)
        );
        const nextSlots: CellarSlot[] = [];

        for (let shelf = 0; shelf < session.user.shelves; shelf += 1) {
          for (let column = 0; column < session.user.columns; column += 1) {
            const key = `${shelf}:${column}`;
            if (taken.has(key)) continue;
            nextSlots.push({
              key,
              shelf,
              column,
              label: `${shelf + 1}:${column + 1}`,
            });
          }
        }

        const lastKey = `${wine.shelf}:${wine.column}`;
        setSlots(nextSlots);
        setSelected(
          nextSlots.some(slot => slot.key === lastKey) ? lastKey : null
        );
      } catch (loadError) {
        console.error(loadError);
        if (!cancelled) {
          setError('Could not load empty slots.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadOpenSlots();

    return () => {
      cancelled = true;
    };
  }, [open, wine._id, wine.column, wine.shelf]);

  const handleConfirm = async () => {
    const slot = slots.find(item => item.key === selected);
    if (!slot || pending) return;

    setPending(true);
    setError('');
    const result = await unarchiveWine(
      wine._id,
      slot.shelf,
      slot.column,
      comment
    );
    setPending(false);

    if (!result.ok) {
      setError(
        result.reason === 'occupied'
          ? 'That slot already has one of your bottles.'
          : 'Could not unarchive this wine.'
      );
      return;
    }

    onOpenChange(false);
    onRestored();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="px-8 py-16 overflow-auto">
        <WineDialogHeader
          title="Unarchive"
          description="Choose an empty slot in this cellar."
        />

        <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto">
          {slots.map(slot => (
            <Button
              key={slot.key}
              type="button"
              size="sm"
              variant={selected === slot.key ? 'default' : 'outline'}
              aria-pressed={selected === slot.key}
              onClick={() => setSelected(slot.key)}
            >
              {slot.label}
            </Button>
          ))}
        </div>

        {loading && (
          <p className="text-sm text-neutral-500">Loading empty slots…</p>
        )}
        {!loading && slots.length === 0 && (
          <p className="text-sm text-neutral-500">
            Every slot in your cellar is in use.
          </p>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="unarchive-comment">Comment</Label>
          <Input
            id="unarchive-comment"
            name="comment"
            value={comment}
            onChange={event => setComment(event.target.value)}
          />
        </div>

        {wine.comment ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-neutral-500">{wine.comment}</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => setComment(wine.comment ?? '')}
            >
              Use last comment
            </Button>
          </div>
        ) : null}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={!selected || pending || loading}
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
