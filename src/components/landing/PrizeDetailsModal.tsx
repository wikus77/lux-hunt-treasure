
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LazyImage } from "@/components/ui/lazy-image";

interface PrizeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrizeDetailsModal = ({ isOpen, onClose }: PrizeDetailsModalProps) => {
  // Always forcing isOpen to false - making sure it never shows
  const actualIsOpen = false; 

  return (
    <Dialog open={actualIsOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl bg-black/80 backdrop-blur-md border border-cyan-500/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-orbitron text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            {/* Empty title */}
          </DialogTitle>
          <DialogDescription className="text-center text-white/70">
            {/* Empty description */}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
          {/* No prizes content */}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500">
              Chiudi
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PrizeDetailsModal;
