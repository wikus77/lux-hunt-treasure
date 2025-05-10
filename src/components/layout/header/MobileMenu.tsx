
import { Link } from "react-router-dom";
import { useAuthContext } from "@/contexts/auth";
import { motion } from "framer-motion";

interface MobileMenuProps {
  isAdmin?: boolean;
}

export const MobileMenu = ({ isAdmin = false }: MobileMenuProps) => {
  const { isAuthenticated } = useAuthContext();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="absolute top-16 left-0 right-0 bg-black border-b border-gray-800 shadow-lg md:hidden"
    >
      <nav className="flex flex-col py-4">
        {isAuthenticated ? (
          <>
            <Link
              to="/home"
              className="px-6 py-2 text-sm font-medium hover:bg-gray-800"
            >
              Home
            </Link>
            <Link
              to="/map"
              className="px-6 py-2 text-sm font-medium hover:bg-gray-800"
            >
              Mappa
            </Link>
            <Link
              to="/events"
              className="px-6 py-2 text-sm font-medium hover:bg-gray-800"
            >
              Eventi
            </Link>
            <Link
              to="/buzz"
              className="px-6 py-2 text-sm font-medium hover:bg-gray-800"
            >
              Buzz
            </Link>
            <Link
              to="/profile"
              className="px-6 py-2 text-sm font-medium hover:bg-gray-800"
            >
              Profilo
            </Link>
            <Link
              to="/settings"
              className="px-6 py-2 text-sm font-medium hover:bg-gray-800"
            >
              Impostazioni
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="px-6 py-2 text-sm font-medium text-cyan-500 hover:bg-gray-800"
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
            >
              Accedi
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 text-sm font-medium hover:bg-gray-800"
            >
              Registrati
            </Link>
            <Link
              to="/contact"
              className="px-6 py-2 text-sm font-medium hover:bg-gray-800"
            >
              Contatti
            </Link>
          </>
        )}
      </nav>
    </motion.div>
  );
};
