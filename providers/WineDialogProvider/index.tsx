'use client';
import { WineDialog } from '@/components/Dashboard/WineDialog';
import WineFormDialog from '@/components/WineForm/WineFormDialog';
import { Wine } from '@/types';
import {
  createContext,
  useState,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
  useCallback,
} from 'react';

type WineDetailsDialogProviderProps = {
  children: ReactNode;
};

export const WineDetailsDialogContext = createContext<{
  selectedWine: Wine | null;
  openWineDialog: boolean;
  setOpenWineDialog: Dispatch<SetStateAction<boolean>>;
  setOpenWineFormDialog: Dispatch<SetStateAction<boolean>>;
  handleOpenWineFormDialog: (position: Position) => void;
  handleOpenWineDialog: (wine: Wine) => void;
}>({
  selectedWine: null,
  openWineDialog: false,
  setOpenWineDialog: () => false,
  setOpenWineFormDialog: () => false,
  handleOpenWineFormDialog: () => {},
  handleOpenWineDialog: () => {},
});

type Position = {
  column?: string;
  shelf?: string;
};

export const WineDetailsDialogProvider = ({
  children,
}: WineDetailsDialogProviderProps) => {
  const [selectedWine, setSelectedWine] = useState<Wine | null>(null);
  const [openWineDialog, setOpenWineDialog] = useState(false);
  const [openWineFormDialog, setOpenWineFormDialog] = useState(false);
  const [position, setPosition] = useState<Position>({
    column: undefined,
    shelf: undefined,
  });

  const handleOpenWineDialog = useCallback((wine: Wine) => {
    setSelectedWine(wine);
    setOpenWineDialog(true);
  }, []);

  const handleOpenWineFormDialog = useCallback((position: Position) => {
    setPosition(position);
    setOpenWineFormDialog(true);
  }, []);

  return (
    <WineDetailsDialogContext.Provider
      value={{
        selectedWine,
        openWineDialog,
        setOpenWineDialog,
        handleOpenWineFormDialog,
        handleOpenWineDialog,
        setOpenWineFormDialog,
      }}
    >
      {children}

      <WineDialog
        wine={selectedWine}
        open={openWineDialog}
        onOpenChange={setOpenWineDialog}
      />
      <WineFormDialog
        open={openWineFormDialog}
        onOpenChange={setOpenWineFormDialog}
        {...position}
      />
    </WineDetailsDialogContext.Provider>
  );
};

export default WineDetailsDialogContext;
