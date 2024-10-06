import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Edit, MoreHorizontalIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { RemoveButton } from './RemoveButton';
import type { Dispatch, SetStateAction } from 'react';

type EditWineMenuProps = {
  handleArchive: () => void;
  handleDelete: () => void;
  setOpenWineForm: Dispatch<SetStateAction<boolean>>;
  isArchived?: boolean;
  className?: string;
};

export const EditWineMenu = ({
  handleArchive,
  handleDelete,
  setOpenWineForm,
  isArchived,
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
            <Edit />
            <span className="ml-2"> Edit</span>
          </Button>
        </DropdownMenuItem>

        {!isArchived && (
          <DropdownMenuItem>
            <RemoveButton handleRemove={handleArchive} />
          </DropdownMenuItem>
        )}

        <DropdownMenuItem>
          <RemoveButton handleRemove={handleDelete} isDelete={true} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
