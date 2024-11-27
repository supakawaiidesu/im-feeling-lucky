import { Position } from "../../../../hooks/use-positions";
import { TriggerOrder } from "../../../../hooks/use-orders";
import { useState } from "react";
import { ShareDialog } from "./ShareDialog";
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
  onOpenSLTP?: () => void;
  onOpenCollateral?: () => void;
}

export function PositionDialog({
  position,
  triggerOrder,
  isOpen,
  onClose,
  onClosePosition,
  isClosing,
  onOpenSLTP,
  onOpenCollateral,
}: PositionDialogProps) {
  const [isShareOpen, setIsShareOpen] = useState(false);
  
  if (!position) return null;

  return (
    <>
      <Dialog open={isOpen} modal={true}>
        <DialogContent className="sm:max-w-[425px] p-4 bg-[#0F0B29] border-zinc-800" onPointerDownOutside={() => onClose()}>
          <PositionDetails
            position={position}
            triggerOrder={triggerOrder}
            onClose={onClose}
            onClosePosition={onClosePosition}
            isClosing={isClosing}
            onOpenSLTP={onOpenSLTP}
            onOpenCollateral={onOpenCollateral}
            onShare={() => setIsShareOpen(true)}
          />
        </DialogContent>
      </Dialog>

      <ShareDialog 
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        position={position}
      />
    </>
  );
}
