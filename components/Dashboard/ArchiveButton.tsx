import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

type ArchiveButtonProps = {
  handleArchive: () => void;
};

const ArchiveButton = ({ handleArchive }: ArchiveButtonProps) => {
  const { toast, dismiss } = useToast();

  return (
    <Button
      className="pl-1"
      variant="ghost"
      onClick={() => {
        toast({
          itemID: 'archive-wine',
          action: (
            <div>
              <p className="p-4 text-center">
                Are you sure you want to archive this wine?
              </p>
              <div className="flex justify-center gap-4">
                <Button
                  onClick={() => dismiss()}
                  variant="outline"
                  className="flex-1"
                >
                  No
                </Button>
                <Button
                  onClick={() => {
                    handleArchive();
                    dismiss();
                  }}
                  variant="destructive"
                  className="flex-1"
                >
                  Yes
                </Button>
              </div>
            </div>
          ),
        });
      }}
    >
      Archive
    </Button>
  );
};

export default ArchiveButton;
