
import { useNavigate } from "react-router-dom";

const M1ssionText = () => {
  const navigate = useNavigate();

  return (
    <button 
      onClick={() => navigate('/home')}
      className="text-xl md:text-2xl font-orbitron font-semibold tracking-wide"
      aria-label="Homepage"
    >
      <span className="text-cyan-400">M1</span>
      <span className="text-white">SSION</span>
    </button>
  );
};

export default M1ssionText;
