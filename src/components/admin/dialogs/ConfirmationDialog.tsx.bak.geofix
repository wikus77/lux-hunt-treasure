
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  email: string | null;
  onConfirm: () => void;
  isPending: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onOpenChange,
  email,
  onConfirm,
  isPending
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Conferma Email</DialogTitle>
          <DialogDescription>
            Sei sicuro di voler confermare questa email?
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input type="email" id="email" value={email || ""} className="col-span-3" disabled />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Annulla
          </Button>
          <Button type="submit" onClick={onConfirm} disabled={isPending}>
            {isPending ? "Confermando..." : "Conferma"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
