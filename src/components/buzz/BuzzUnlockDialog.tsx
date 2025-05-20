import { Lock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface BuzzUnlockDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  handlePayment: () => void;
}

const BuzzUnlockDialog = ({ open, onOpenChange, handlePayment }: BuzzUnlockDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="bg-black border border-white/10 sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold text-white">Unlock Extra Clue</DialogTitle>
        <DialogDescription className="text-white/70">
          For €1.99, get an immediate additional clue to help you solve the mystery.
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4">
        <div className="bg-black/40 p-4 rounded-md border border-white/10">
          <h3 className="font-medium mb-2 text-white">What you'll get:</h3>
          <ul className="space-y-2">
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <span className="text-white/80">Instant access to an additional clue</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <span className="text-white/80">Push notification with your clue details</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <span className="text-white/80">Saved in your clues collection</span>
            </li>
          </ul>
        </div>
      </div>
      
      <DialogFooter className="flex flex-col sm:flex-row gap-2">
        <Button 
          variant="outline" 
          onClick={() => onOpenChange(false)}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button 
          onClick={handlePayment} 
          className="w-full sm:w-auto bg-gradient-to-r from-projectx-blue to-projectx-pink"
        >
          Proceed to Payment
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default BuzzUnlockDialog;
