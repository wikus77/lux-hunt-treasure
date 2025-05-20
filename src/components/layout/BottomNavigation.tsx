import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Map, Zap, User, FileText } from 'lucide-react';

const BottomNavigation = () => {
  return (
    <div className="fixed bottom-0 w-full bg-black border-t border-white/10 z-50 px-2 py-2">
      <div className="flex items-center justify-between">
        <NavLink to="/" className={({ isActive }) => `flex flex-col items-center w-full ${isActive ? 'text-white' : 'text-white/50'}`}>
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </NavLink>
        
        <NavLink to="/map" className={({ isActive }) => `flex flex-col items-center w-full ${isActive ? 'text-white' : 'text-white/50'}`}>
          <Map className="h-5 w-5" />
          <span className="text-xs mt-1">Map</span>
        </NavLink>
        
        <NavLink to="/clues" className={({ isActive }) => `flex flex-col items-center w-full ${isActive ? 'text-white' : 'text-white/50'}`}>
          <FileText className="h-5 w-5" />
          <span className="text-xs mt-1">Clues</span>
        </NavLink>
        
        <NavLink to="/buzz" className={({ isActive }) => `flex flex-col items-center w-full ${isActive ? 'text-white' : 'text-white/50'}`}>
          <Zap className="h-5 w-5" />
          <span className="text-xs mt-1">Buzz</span>
        </NavLink>
        
        <NavLink to="/profile" className={({ isActive }) => `flex flex-col items-center w-full ${isActive ? 'text-white' : 'text-white/50'}`}>
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">Profile</span>
        </NavLink>
      </div>
    </div>
  );
};

export default BottomNavigation;
