import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Archive, Trash2 } from 'lucide-react';

type RemoveButtonProps = {
  handleRemove: () => void;
  isDelete?: boolean;
};

export const RemoveButton = ({ handleRemove, isDelete }: RemoveButtonProps) => {
  const { toast, dismiss } = useToast();

  return (
    <Button
      className="pl-1"
      variant="ghost"
      onClick={() => {
        toast({
          itemID: 'remove-wine',
          title: isDelete ? 'Delete?' : 'Archive?',
          description: `Are you sure you want to ${
            isDelete ? 'delete' : 'archive'
          } this wine?`,
          action: (
            <div className="flex justify-center gap-4 w-full">
              <Button
                onClick={() => dismiss()}
                variant="outline"
                className="flex-1 max-w-32"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  handleRemove();
                  dismiss();
                }}
                variant="destructive"
                className="flex-1 max-w-32"
              >
                {isDelete ? 'Delete' : 'Archive'}
              </Button>
            </div>
          ),
        });
      }}
    >
      {isDelete ? <Trash2 /> : <Archive />}
      <span className="ml-2"> {isDelete ? 'Delete' : 'Archive'}</span>
    </Button>
  );
};
