
import { Link } from "react-router-dom";

const LandingFooter = () => {
  return (
    <footer className="py-12 px-4 bg-black w-full border-t border-white/10">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center w-full mb-8">
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#00E5FF] to-[#00BFFF] bg-clip-text text-transparent">M1SSION</h2>
          </div>
          <div className="flex space-x-6">
            <Link to="/privacy-policy" className="text-sm text-white/60 hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-sm text-white/60 hover:text-white transition-colors">Termini e Condizioni</Link>
            <Link to="/contacts" className="text-sm text-white/60 hover:text-white transition-colors">Contatti</Link>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 text-center md:text-left">
          <p className="text-sm text-white/50">
            © 2025 M1SSION. Tutti i diritti riservati.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
