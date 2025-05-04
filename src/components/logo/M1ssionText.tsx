
import React from 'react';
import { useNavigate } from 'react-router-dom';

const M1ssionText = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/home');
  };

  return (
    <button 
      onClick={handleClick}
      className="flex items-center font-orbitron text-xl md:text-2xl font-bold transition-opacity hover:opacity-80"
      aria-label="Go to homepage"
      style={{ cursor: 'pointer' }}
    >
      <span style={{ color: '#00E5FF' }} className="text-[#00E5FF]">M1</span>
      <span style={{ color: '#FFFFFF' }} className="text-white">SSION</span>
    </button>
  );
};

export default M1ssionText;
