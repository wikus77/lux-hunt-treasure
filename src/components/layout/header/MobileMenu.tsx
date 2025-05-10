
import { Link } from "react-router-dom";
import { useAuthContext } from "@/contexts/auth";
import { motion } from "framer-motion";

interface MobileMenuProps {
  isAdmin?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export const MobileMenu = ({ 
  isAdmin = false, 
  isOpen = true,
  onClose = () => {}
}: MobileMenuProps) => {
  const { isAuthenticated } = useAuthContext();

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="absolute top-16 left-0 right-0 bg-black border-b border-gray-800 shadow-lg md:hidden z-50"
    >
      <nav className="flex flex-col py-4">
        {isAuthenticated ? (
          <>
            <Link
              to="/home"
              className="px-6 py-2 text-sm font-medium hover:bg-gray-800"
              onClick={onClose}
            >
              Home
            </Link>
            <Link
              to="/map"
              className="px-6 py-2 text-sm font-medium hover:bg-gray-800"
              onClick={onClose}
            >
              Mappa
            </Link>
            <Link
              to="/events"
              className="px-6 py-2 text-sm font-medium hover:bg-gray-800"
              onClick={onClose}
            >
              Eventi
            </Link>
            <Link
              to="/buzz"
              className="px-6 py-2 text-sm font-medium hover:bg-gray-800"
              onClick={onClose}
            >
              Buzz
            </Link>
            <Link
              to="/profile"
              className="px-6 py-2 text-sm font-medium hover:bg-gray-800"
              onClick={onClose}
            >
              Profilo
            </Link>
            <Link
              to="/settings"
              className="px-6 py-2 text-sm font-medium hover:bg-gray-800"
              onClick={onClose}
            >
              Impostazioni
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="px-6 py-2 text-sm font-medium text-cyan-500 hover:bg-gray-800"
                onClick={onClose}
              >
                Admin Dashboard
              </Link>
            )}
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="px-6 py-2 text-sm font-medium hover:bg-gray-800"
              onClick={onClose}
            >
              Accedi
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 text-sm font-medium hover:bg-gray-800"
              onClick={onClose}
            >
              Registrati
            </Link>
            <Link
              to="/contact"
              className="px-6 py-2 text-sm font-medium hover:bg-gray-800"
              onClick={onClose}
            >
              Contatti
            </Link>
          </>
        )}
      </nav>
    </motion.div>
  );
};

export default MobileMenu;
