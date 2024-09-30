'use client';
import { WineDialog } from '@/components/WineDialog';
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
  handleOpenWineDialog: (wine: Wine) => void;
}>({
  selectedWine: null,
  openWineDialog: false,
  setOpenWineDialog: () => false,
  handleOpenWineDialog: () => {},
});

export const WineDetailsDialogProvider = ({
  children,
}: WineDetailsDialogProviderProps) => {
  const [selectedWine, setSelectedWine] = useState<Wine | null>(null);
  const [openWineDialog, setOpenWineDialog] = useState(false);

  const handleOpenWineDialog = useCallback((wine: Wine) => {
    setSelectedWine(wine);
    setOpenWineDialog(true);
  }, []);

  return (
    <WineDetailsDialogContext.Provider
      value={{
        selectedWine,
        openWineDialog,
        setOpenWineDialog,
        handleOpenWineDialog,
      }}
    >
      {children}

      <WineDialog
        wine={selectedWine}
        open={openWineDialog}
        onOpenChange={setOpenWineDialog}
      />
    </WineDetailsDialogContext.Provider>
  );
};

export default WineDetailsDialogContext;
