
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const M1ssionText = () => {
  const navigate = useNavigate();
  const [tapCount, setTapCount] = useState(0);
  const [tapTimer, setTapTimer] = useState<NodeJS.Timeout | null>(null);

  const handleClick = useCallback(() => {
    // Reset developer access on double tap
    setTapCount(prev => prev + 1);
    
    if (tapTimer) {
      clearTimeout(tapTimer);
    }
    
    const timer = setTimeout(() => {
      if (tapCount + 1 >= 2) {
        // Double tap detected - reset developer access
        localStorage.removeItem('developer_access');
        console.log('Developer access reset via double tap');
        window.location.reload();
      }
      setTapCount(0);
    }, 300);
    
    setTapTimer(timer);
    
    // Navigate to home after reset check
    if (tapCount < 1) {
      navigate('/');
    }
  }, [navigate, tapCount, tapTimer]);

  return (
    <button 
      onClick={handleClick}
      className="flex items-center font-orbitron text-xl md:text-2xl font-bold transition-opacity hover:opacity-80"
      aria-label="Go to homepage"
      style={{ cursor: 'pointer' }}
    >
      <span 
        className="text-[#00E5FF]" 
        style={{ 
          textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)" 
        }}
      >
        M1
      </span>
      <span className="text-white">SSION<span className="text-xs align-top">™</span></span>
    </button>
  );
};

export default M1ssionText;
