
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void;
}

const MobileMenu = ({ isOpen, onClose, onSignOut }: MobileMenuProps) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <motion.div 
      className="md:hidden glass-card border-t border-white/5 shadow-lg"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="px-4 py-5 space-y-3">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-white hover:bg-white/5"
          onClick={() => { navigate('/home'); onClose(); }}
        >
          Home
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-white hover:bg-white/5"
          onClick={() => { navigate('/profile'); onClose(); }}
        >
          Profilo
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-white hover:bg-white/5"
          onClick={() => { navigate('/settings'); onClose(); }}
        >
          Impostazioni
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-white hover:bg-white/5"
          onClick={() => { onSignOut(); onClose(); }}
        >
          Esci
        </Button>
      </div>
    </motion.div>
  );
};

export default MobileMenu;
