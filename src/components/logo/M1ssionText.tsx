
import React from 'react';
import { useNavigate } from 'react-router-dom';

const M1ssionText = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    try {
      navigate('/home');
    } catch (error) {
      console.error('Errore di navigazione:', error);
    }
  };

  return (
    <button 
      onClick={handleClick}
      className="flex items-center font-orbitron text-xl md:text-2xl font-bold cursor-pointer"
      style={{
        display: "flex",
        alignItems: "center",
        fontWeight: "bold",
        fontSize: "1.5rem",
        cursor: "pointer",
        fontFamily: "'Orbitron', sans-serif",
      }}
    >
      <span style={{ color: "#00E5FF" }}>M1</span>
      <span style={{ color: "#FFFFFF" }}>SSION</span>
    </button>
  );
};

export default M1ssionText;
