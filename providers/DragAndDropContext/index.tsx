import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { moveWine } from '@/mongoDB/moveWine';
import { CheckCircle2, Loader2 } from 'lucide-react';
import {
  closestCenter,
  DndContext,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  type DragEndEvent,
} from '@dnd-kit/core';
import type { ReactNode } from 'react';

export const DragAndDropContext = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const setElementOpacity = (event: DragEndEvent, opacity: string) => {
    (
      event.activatorEvent.target as HTMLElement
    )?.parentElement?.style.setProperty('opacity', opacity);
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { over, active } = event;

    const activeData = active.data.current;
    if (!over?.data.current || !activeData) return;

    if (activeData.supports.includes(over?.data.current?.type)) {
      const wineId = String(active.id);
      const previousShelf = String(activeData.shelf);
      const previousColumn = String(activeData.column);

      setElementOpacity(event, '0');
      const loadingToast = toast({
        itemID: 'move-wine-loading',
        title: 'Updating wine...',
        action: <Loader2 className="animate-spin" />,
      });

      const result = await moveWine(
        over.data.current.shelf,
        over.data.current.column,
        wineId
      );
      setElementOpacity(event, '1');

      await new Promise<void>(resolve =>
        setTimeout(() => {
          loadingToast.dismiss();
          resolve();
        }, 1000)
      );

      if (!result.ok) {
        toast({
          itemID: 'move-wine-error',
          title: 'Could not move wine',
          variant: 'destructive',
        });
        return;
      }

      const undoMove = async () => {
        const undoLoadingToast = toast({
          itemID: 'undo-wine-loading',
          title: 'Undoing move...',
          action: <Loader2 className="animate-spin" />,
        });

        const undoResult = await moveWine(
          previousShelf,
          previousColumn,
          wineId
        );
        undoLoadingToast.dismiss();

        if (undoResult.ok) {
          toast({
            itemID: 'undo-wine-success',
            title: 'Move undone',
            action: <CheckCircle2 />,
          });
          return;
        }

        toast({
          itemID: 'undo-wine-error',
          title: 'Could not undo move',
          description:
            undoResult.reason === 'occupied'
              ? 'The original slot is no longer empty.'
              : undefined,
          variant: 'destructive',
        });
      };

      toast({
        itemID: 'move-wine-success',
        title: 'Wine Moved',
        duration: 8000,
        action: (
          <Button variant="outline" onClick={() => void undoMove()}>
            Undo
          </Button>
        ),
      });
    }
  };

  const mouseSensor = useSensor(MouseSensor);
  const touchSensor = useSensor(TouchSensor);
  const sensors = useSensors(mouseSensor, touchSensor);

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      sensors={sensors}
    >
      {children}
    </DndContext>
  );
};
