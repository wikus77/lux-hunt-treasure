
// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

const MapDebugger: React.FC = () => {
  const [location, setLocation] = useLocation();
  const [mounted, setMounted] = useState(false);
  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    setRenderCount(prev => prev + 1);
    console.log('🔍 MapDebugger - Component mounted');
    console.log('🔍 Current location:', location);
    console.log('🔍 Render count:', renderCount + 1);
  }, [location]);

  // Log navigation attempts
  useEffect(() => {
    const handlePopState = () => {
      console.log('🔍 PopState event detected:', window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div 
      style={{
        position: 'fixed',
        top: '100px',
        right: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '8px',
        fontSize: '12px',
        zIndex: 9999,
        maxWidth: '300px'
      }}
    >
      <div>🔍 MAP DEBUG</div>
      <div>Mounted: {mounted ? '✅' : '❌'}</div>
      <div>Pathname: {location}</div>
      <div>Renders: {renderCount}</div>
      <div>Capacitor: {!!(window as any).Capacitor ? '✅' : '❌'}</div>
      <button 
        onClick={() => setLocation('/home')}
        style={{ marginTop: '5px', padding: '2px 5px', fontSize: '10px' }}
      >
        Go Home
      </button>
    </div>
  );
};

export default MapDebugger;
