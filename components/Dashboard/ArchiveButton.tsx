import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Button, buttonVariants } from '@/components/ui/button';

type ArchiveButtonProps = {
  handleArchive: () => void;
};

const ArchiveButton = ({ handleArchive }: ArchiveButtonProps) => {
  return (
    <Popover>
      <PopoverTrigger
        className={`${buttonVariants({
          size: 'lg',
          variant: 'ghost',
        })} pl-1`}
      >
        Archive
      </PopoverTrigger>
      <PopoverContent>
        <p className="p-4 text-center">
          Are you sure you want to archive this wine?
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="outline" className="flex-1">
            No
          </Button>
          <Button
            onClick={handleArchive}
            variant="destructive"
            className="flex-1"
          >
            Yes
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ArchiveButton;
