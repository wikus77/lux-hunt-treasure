
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface InstagramStyleDrawerProps {
  open: boolean;
  onClose: () => void;
}

const InstagramStyleDrawer = ({ open, onClose }: InstagramStyleDrawerProps) => {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-64 bg-black text-white flex flex-col py-8"
      >
        <div className="text-xl font-bold text-center mb-8">Centro gestione account</div>
        <ul className="space-y-6 px-4">
          <li className="text-projectx-neon-blue font-semibold">Centro gestione account</li>
          {/* Qui puoi aggiungere altri elementi menu in futuro */}
        </ul>
      </SheetContent>
    </Sheet>
  );
};

export default InstagramStyleDrawer;
