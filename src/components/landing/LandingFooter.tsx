
import React from "react";
import { Link } from "wouter";
import StoreButtons from "./StoreButtons";

const LandingFooter = () => {
  return (
    <footer className="py-16 px-4 bg-black w-full border-t border-white/20 relative z-50">
      <div className="max-w-screen-xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-center w-full mb-8">
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl font-bold">
              <span className="text-[#00E5FF]">M1</span>
              <span className="text-white">SSION<span className="text-xs align-top">™</span></span>
            </h2>
          </div>
          <div className="flex flex-wrap gap-4 justify-center md:justify-end">
            <Link to="/privacy-policy" className="text-base text-white/80 hover:text-cyan-400 transition-colors font-medium px-2 py-1">Privacy Policy</Link>
            <Link to="/cookie-policy" className="text-base text-white/80 hover:text-cyan-400 transition-colors font-medium px-2 py-1">Cookie Policy</Link>
            <Link to="/terms" className="text-base text-white/80 hover:text-cyan-400 transition-colors font-medium px-2 py-1">Termini e Condizioni</Link>
            <Link to="/contact" className="text-base text-white/80 hover:text-cyan-400 transition-colors font-medium px-2 py-1">Contatti</Link>
          </div>
        </div>
        <div className="border-t border-white/20 pt-8 text-center md:text-left">
          <p className="text-base text-white/80 font-medium">
            © 2025 <span className="text-[#00E5FF]">M1</span><span className="text-white">SSION<span className="text-xs align-top">™</span></span>. Tutti i diritti riservati.
          </p>
        </div>
        
        {/* SafeCreative Registration Block */}
        <div className="mt-8 pt-8 border-t border-white/20">
          <p className="text-base text-white/70 text-center font-medium leading-relaxed">
            © 2024 – <span className="text-[#00E5FF]">M1</span><span className="text-white">SSION<span className="text-xs align-top">™</span></span> is a protected work registered on SafeCreative.<br />
            <span className="text-cyan-400">Registration Code: 2505261861325</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
