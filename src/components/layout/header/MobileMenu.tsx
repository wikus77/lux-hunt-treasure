
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void;
}

const MobileMenu = ({ isOpen, onClose, onSignOut }: MobileMenuProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  if (!isOpen) return null;

  return (
    <motion.div 
      className="md:hidden glass-card border-t border-white/5 shadow-lg"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="px-4 py-5 space-y-4"> {/* Increased spacing */}
        <Button 
          variant="ghost" 
          className="w-full justify-start text-white hover:bg-white/5 py-4 h-auto" // Increased height for better touch target
          onClick={() => { navigate('/home'); onClose(); }}
        >
          Home
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-white hover:bg-white/5 py-4 h-auto"
          onClick={() => { navigate('/profile'); onClose(); }}
        >
          Profilo
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-white hover:bg-white/5 py-4 h-auto"
          onClick={() => { navigate('/settings'); onClose(); }}
        >
          Impostazioni
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-white hover:bg-white/5 py-4 h-auto"
          onClick={() => { onSignOut(); onClose(); }}
        >
          Esci
        </Button>
      </div>
    </motion.div>
  );
};

export default MobileMenu;
