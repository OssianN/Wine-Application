'use client';
import { WineDialog } from '@/components/Dashboard/WineDialog';
import WineFormDialog from '@/components/WineForm/WineFormDialog';
import {
  createContext,
  useState,
  useCallback,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
} from 'react';
import type { Wine } from '@/types';

type WineProviderProps = {
  children: ReactNode;
};

export const WineContext = createContext<{
  selectedWine: Wine | null;
  openWineDialog: boolean;
  setOpenWineDialog: Dispatch<SetStateAction<boolean>>;
  setOpenWineFormDialog: Dispatch<SetStateAction<boolean>>;
  handleOpenWineFormDialog: (position: Position) => void;
  handleOpenWineDialog: (wine: Wine) => void;
  setWineList: Dispatch<SetStateAction<Wine[]>>;
  wineList: Wine[];
}>({
  selectedWine: null,
  openWineDialog: false,
  setOpenWineDialog: () => false,
  setOpenWineFormDialog: () => false,
  handleOpenWineFormDialog: () => {},
  handleOpenWineDialog: () => {},
  setWineList: () => {},
  wineList: [],
});

type Position = {
  column?: string;
  shelf?: string;
};

export const WineDetailsDialogProvider = ({ children }: WineProviderProps) => {
  const [selectedWine, setSelectedWine] = useState<Wine | null>(null);
  const [openWineDialog, setOpenWineDialog] = useState(false);
  const [openWineFormDialog, setOpenWineFormDialog] = useState(false);
  const [wineList, setWineList] = useState<Wine[]>([]);
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
    <WineContext.Provider
      value={{
        selectedWine,
        openWineDialog,
        setOpenWineDialog,
        handleOpenWineFormDialog,
        handleOpenWineDialog,
        setOpenWineFormDialog,
        setWineList,
        wineList,
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
    </WineContext.Provider>
  );
};

export default WineContext;
