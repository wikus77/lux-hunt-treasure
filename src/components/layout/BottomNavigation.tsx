
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Map, Zap, Bell, User } from 'lucide-react';

const BottomNavigation = () => {
  const navItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/map', icon: Map, label: 'Mappa' },
    { path: '/buzz', icon: Zap, label: 'Buzz' },
    { path: '/notifications', icon: Bell, label: 'Notifiche' },
    { path: '/profile', icon: User, label: 'Profilo' },
  ];

  return (
    <nav className="bottom-navigation-fix">
      <div className="flex justify-around items-center h-full px-2">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `
              bottom-nav-item tap-target ${isActive ? 'active' : ''}
            `}
          >
            <Icon size={20} />
            <span className="text-xs mt-1">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;
