
import React from 'react';
import { useNavigate } from 'react-router-dom';

const M1ssionText = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Now this navigates to the home route, not the landing page
    navigate('/');
  };

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
      <span className="text-white">SSION™</span>
    </button>
  );
};

export default M1ssionText;
