
import React from "react";
import { Link } from "react-router-dom";
import StoreButtons from "./StoreButtons";

const LandingFooter = () => {
  return (
    <footer className="py-12 px-4 bg-black w-full border-t border-white/10">
      <div className="max-w-screen-xl mx-auto">
        {/* App Store Buttons Section */}
        <div className="mb-12 py-8 border-b border-white/10">
          <h3 className="text-xl font-bold text-center mb-6 gradient-text-cyan">Scarica l'app</h3>
          <StoreButtons />
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center w-full mb-8">
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl font-bold">
              <span className="text-[#00E5FF]">M1</span>
              <span className="text-white">SSION<span className="text-xs align-top">™</span></span>
            </h2>
          </div>
          <div className="flex flex-wrap gap-4 justify-center md:justify-end">
            <Link to="/privacy-policy" className="text-sm text-white/60 hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/cookie-policy" className="text-sm text-white/60 hover:text-white transition-colors">Cookie Policy</Link>
            <Link to="/termini-e-condizioni" className="text-sm text-white/60 hover:text-white transition-colors">Termini e Condizioni</Link>
            <Link to="/contatti" className="text-sm text-white/60 hover:text-white transition-colors">Contatti</Link>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 text-center md:text-left">
          <p className="text-sm text-white/50">
            © 2025 <span className="text-[#00E5FF]">M1</span><span className="text-white">SSION<span className="text-xs align-top">™</span></span>. Tutti i diritti riservati.
          </p>
        </div>
        
        {/* SafeCreative Registration Block */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-sm text-gray-500 text-center">
            © 2024 – <span className="text-[#00E5FF]">M1</span><span className="text-white">SSION<span className="text-xs align-top">™</span></span> is a protected work registered on SafeCreative.<br />
            Registration Code: 2505261861325
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
