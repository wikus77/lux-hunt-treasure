
import React from "react";
import { Link } from "react-router-dom";
import MobileStoreButtons from "./MobileStoreButtons";

const LandingFooter = () => {
  return (
    <footer className="py-12 px-4 bg-black w-full border-t border-white/10">
      <div className="max-w-screen-xl mx-auto">
        {/* App Store Buttons Section */}
        <div className="mb-12 py-8 border-b border-white/10">
          <h3 className="text-xl font-bold text-center mb-6 gradient-text-cyan">Scarica l'app</h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
            <a href="https://apps.apple.com/app/id0000000000" target="_blank" rel="noopener noreferrer">
              <img src="/appstore-button.png" alt="Download on the App Store" className="h-14 w-auto block" />
            </a>
            <a href="https://play.google.com/store/apps/details?id=com.tuonome.app" target="_blank" rel="noopener noreferrer">
              <img src="/googleplay-button.png" alt="Get it on Google Play" className="h-14 w-auto block" />
            </a>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center w-full mb-8">
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl font-bold">
              <span className="text-[#00E5FF]">M1</span>
              <span className="text-white">SSION</span>
            </h2>
          </div>
          <div className="flex flex-wrap gap-4 justify-center md:justify-end">
            <Link to="/privacy" className="text-sm text-white/60 hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/cookie-policy" className="text-sm text-white/60 hover:text-white transition-colors">Cookie Policy</Link>
            <Link to="/terms" className="text-sm text-white/60 hover:text-white transition-colors">Termini e Condizioni</Link>
            <Link to="/contact" className="text-sm text-white/60 hover:text-white transition-colors">Contatti</Link>
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
