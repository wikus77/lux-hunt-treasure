
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileMenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

const MobileMenuButton = ({ isOpen, onClick }: MobileMenuButtonProps) => {
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="md:hidden text-white p-3 h-12 w-12 touch-manipulation" // Increased size for touch target
      onClick={onClick}
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      {isOpen ? (
        <X className="h-6 w-6" />
      ) : (
        <Menu className="h-6 w-6" />
      )}
    </Button>
  );
};

export default MobileMenuButton;
