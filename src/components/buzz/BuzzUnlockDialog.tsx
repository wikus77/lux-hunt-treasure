
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface BuzzUnlockDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  handlePayment: () => void;
}

const BuzzUnlockDialog = ({ open, onOpenChange, handlePayment }: BuzzUnlockDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Sblocca Indizio Extra</DialogTitle>
        <DialogDescription>
          Ottieni un indizio extra immediatamente per 1,99€
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="bg-black/20 p-4 rounded-lg">
          <div className="flex items-center">
            <Lock className="mr-2 h-4 w-4 text-projectx-pink" />
            <span>Indizio Esclusivo</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Questo indizio potrebbe essere la chiave per trovare l'auto!
          </p>
        </div>
        <Button
          onClick={handlePayment}
          className="w-full bg-gradient-to-r from-projectx-blue to-projectx-pink"
        >
          Sblocca indizio 1,99€
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);

export default BuzzUnlockDialog;
