
import React from 'react';
import BottomNavigation from './BottomNavigation';
import AgentBadge from '../AgentBadge';
import { useLocation } from 'react-router-dom';

interface GlobalLayoutProps {
  children: React.ReactNode;
}

const GlobalLayout: React.FC<GlobalLayoutProps> = ({ children }) => {
  const location = useLocation();
  
  // Define routes where bottom navigation should be hidden
  const hideBottomNavRoutes = ['/', '/login', '/register'];
  const showBottomNav = !hideBottomNavRoutes.includes(location.pathname);
  
  // Define routes where agent badge should be hidden
  const hideAgentBadgeRoutes = ['/', '/login', '/register'];
  const showAgentBadge = !hideAgentBadgeRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Agent Badge */}
      {showAgentBadge && <AgentBadge />}
      
      {/* Main Content */}
      <main className={`${showBottomNav ? 'pb-20' : ''}`}>
        {children}
      </main>
      
      {/* Bottom Navigation */}
      {showBottomNav && <BottomNavigation />}
    </div>
  );
};

export default GlobalLayout;
