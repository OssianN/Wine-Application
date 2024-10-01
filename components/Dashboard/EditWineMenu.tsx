import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontalIcon } from 'lucide-react';
import { Button } from '../ui/button';
import ArchiveButton from './ArchiveButton';
import type { Dispatch, SetStateAction } from 'react';

type EditWineMenuProps = {
  handleArchive: () => void;
  setOpenWineForm: Dispatch<SetStateAction<boolean>>;
  className?: string;
};

export const EditWineMenu = ({
  handleArchive,
  setOpenWineForm,
  className,
}: EditWineMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={className}>
        <MoreHorizontalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <Button
            className="pl-1"
            variant="ghost"
            size="lg"
            onClick={() => setOpenWineForm(true)}
          >
            Edit
          </Button>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <ArchiveButton handleArchive={handleArchive} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
