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
      setElementOpacity(event, '0');
      const loadingToast = toast({
        itemID: 'move-wine-loading',
        title: 'Updating wine...',
        action: <Loader2 className="animate-spin" />,
      });

      await moveWine(
        over.data.current.shelf,
        over.data.current.column,
        String(active.id)
      );
      setElementOpacity(event, '1');

      await new Promise<void>(resolve =>
        setTimeout(() => {
          loadingToast.dismiss();
          resolve();
        }, 1000)
      );

      toast({
        itemID: 'move-wine-success',
        title: 'Wine Moved',
        action: <CheckCircle2 />,
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
