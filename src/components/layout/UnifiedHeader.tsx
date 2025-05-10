
import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/auth";
import { Link, useLocation } from "react-router-dom";
import UserMenu from "./header/UserMenu";
import MobileMenuButton from "./header/MobileMenuButton";
import { MobileMenu } from "./header/MobileMenu";
import HeaderCountdown from "./header/HeaderCountdown";
import AgentCodeDisplay from "./header/AgentCodeDisplay";

const UnifiedHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, hasRole } = useAuthContext();
  const location = useLocation();
  const isAdmin = hasRole("admin");
  
  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);
  
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur bg-opacity-80 bg-black border-b border-gray-800">
      <div className="container flex h-16 items-center px-4 sm:px-6">
        <div className="flex items-center space-x-4 lg:space-x-6">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-wider">
              <span className="text-cyan-500">M1</span>SSION
            </span>
          </Link>
          
          <HeaderCountdown />
        </div>
        
        <div className="hidden flex-1 md:flex justify-center">
          <AgentCodeDisplay />
        </div>

        <div className="flex flex-1 items-center justify-end space-x-3 md:space-x-4">
          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-4">
              <Link 
                to="/home" 
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Home
              </Link>
              <Link 
                to="/map" 
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Mappa
              </Link>
              <Link 
                to="/events" 
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Eventi
              </Link>
              <Link 
                to="/profile" 
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Profilo
              </Link>
              
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className="text-sm font-medium text-cyan-500 transition-colors hover:text-cyan-400"
                >
                  Admin
                </Link>
              )}
            </nav>
          )}

          <UserMenu />
          <MobileMenuButton 
            isOpen={isMobileMenuOpen} 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          />
        </div>
      </div>
      {isMobileMenuOpen && <MobileMenu isAdmin={isAdmin} />}
    </header>
  );
};

export default UnifiedHeader;
