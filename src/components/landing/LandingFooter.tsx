
import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter } from "lucide-react";
import M1ssionText from "../logo/M1ssionText";

const LandingFooter = () => {
  return (
    <footer className="py-16 px-4 bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="space-y-4">
            <M1ssionText />
            <p className="text-white/60 mt-4">
              L'esperienza di caccia al tesoro più esclusiva d'Italia. 
              Eventi mensili con auto di lusso in palio.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                <Instagram className="w-5 h-5 text-white/70" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                <Facebook className="w-5 h-5 text-white/70" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                <Twitter className="w-5 h-5 text-white/70" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold text-lg mb-4">Link Utili</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-white/60 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/about" className="text-white/60 hover:text-white transition-colors">Chi Siamo</Link></li>
              <li><Link to="/events" className="text-white/60 hover:text-white transition-colors">Eventi</Link></li>
              <li><Link to="/winners" className="text-white/60 hover:text-white transition-colors">Vincitori</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold text-lg mb-4">Supporto</h4>
            <ul className="space-y-2">
              <li><Link to="/faq" className="text-white/60 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link to="/contact" className="text-white/60 hover:text-white transition-colors">Contattaci</Link></li>
              <li><Link to="/terms" className="text-white/60 hover:text-white transition-colors">Termini e Condizioni</Link></li>
              <li><Link to="/privacy" className="text-white/60 hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold text-lg mb-4">Contatti</h4>
            <ul className="space-y-2">
              <li className="text-white/60">info@m1ssion.it</li>
              <li className="text-white/60">+39 02 1234567</li>
              <li className="text-white/60">Milano, Italia</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} M1SSION. Tutti i diritti riservati.
          </p>
          
          <div className="mt-4 md:mt-0">
            <div className="text-xs text-yellow-400/80 font-orbitron tracking-widest">
              IT IS POSSIBLE
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
