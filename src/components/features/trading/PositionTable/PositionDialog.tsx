import { Position } from "../../../../hooks/use-positions";
import { TriggerOrder } from "../../../../hooks/use-orders";
import {
  Dialog,
  DialogContent,
} from "../../../ui/dialog";
import { PositionDetails } from "./PositionDetails";

interface PositionDialogProps {
  position: Position | null;
  triggerOrder?: TriggerOrder;
  isOpen: boolean;
  onClose: () => void;
  onClosePosition: (position: Position) => void;
  isClosing: boolean;
}

export function PositionDialog({
  position,
  triggerOrder,
  isOpen,
  onClose,
  onClosePosition,
  isClosing,
}: PositionDialogProps) {
  if (!position) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]" style={{ 
  backgroundColor: '#17161d',
  borderColor: '#1f1e26'
}}>
        <PositionDetails
          position={position}
          triggerOrder={triggerOrder}
          onClose={onClose}
          onClosePosition={onClosePosition}
          isClosing={isClosing}
        />
      </DialogContent>
    </Dialog>
  );
}
