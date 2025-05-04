
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X, ArrowRight } from "lucide-react";
import M1ssionText from "@/components/logo/M1ssionText";

interface NavbarProps {
  onRegisterClick: () => void;
}

const Navbar = ({ onRegisterClick }: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Gestisci lo scroll per cambiare lo sfondo della navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 py-4 px-4 md:px-8 transition-all duration-300 ${
        isScrolled ? "bg-black/80 backdrop-blur-md shadow-lg" : "bg-transparent"
      }`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <M1ssionText />
        </div>

        {/* Menu Desktop */}
        <div className="hidden md:flex items-center space-x-8">
          <div className="text-white/70 hover:text-white cursor-pointer transition-colors">Home</div>
          <div className="text-white/70 hover:text-white cursor-pointer transition-colors">Chi siamo</div>
          <div className="text-white/70 hover:text-white cursor-pointer transition-colors">Eventi</div>
          <div className="text-white/70 hover:text-white cursor-pointer transition-colors">Contatti</div>
          <div className="flex space-x-4">
            <Button 
              onClick={() => navigate("/login")}
              variant="ghost"
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Accedi
            </Button>
            <Button 
              onClick={onRegisterClick}
              className="bg-gradient-to-r from-cyan-400 to-blue-600 text-black hover:shadow-[0_0_15px_rgba(0,229,255,0.5)] hover:scale-[1.03]"
            >
              Registrati <ArrowRight className="ml-1 w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Menu mobile toggle */}
        <div className="md:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.div 
          className="absolute top-full left-0 right-0 bg-black/95 backdrop-blur-lg shadow-lg py-6 px-4 md:hidden"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col space-y-4">
            <div className="text-white py-2 px-4 hover:bg-white/10 rounded-lg transition-colors">Home</div>
            <div className="text-white py-2 px-4 hover:bg-white/10 rounded-lg transition-colors">Chi siamo</div>
            <div className="text-white py-2 px-4 hover:bg-white/10 rounded-lg transition-colors">Eventi</div>
            <div className="text-white py-2 px-4 hover:bg-white/10 rounded-lg transition-colors">Contatti</div>
            <div className="flex flex-col space-y-3 mt-3">
              <Button 
                onClick={() => navigate("/login")}
                variant="outline"
                className="w-full"
              >
                Accedi
              </Button>
              <Button 
                onClick={onRegisterClick}
                className="w-full neon-button-cyan"
              >
                Registrati
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
