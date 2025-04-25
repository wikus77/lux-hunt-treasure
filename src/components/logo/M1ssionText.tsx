
import React from 'react';
import { useNavigate } from 'react-router-dom';

const M1ssionText = () => {
  const navigate = useNavigate();

  return (
    <button 
      onClick={() => navigate('/home')}
      className="flex items-center font-orbitron text-xl md:text-2xl font-bold transition-opacity hover:opacity-80"
      aria-label="Go to homepage"
    >
      <span className="text-cyan-400">M1</span>
      <span className="text-white">SSION</span>
    </button>
  );
};

export default M1ssionText;
