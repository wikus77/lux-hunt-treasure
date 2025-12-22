
import React from "react";
import { Link } from "wouter";
import { Shield } from "lucide-react";
import StoreButtons from "./StoreButtons";

const LandingFooter = () => {
  return (
    <footer className="py-12 px-4 bg-black w-full border-t border-white/10 relative z-50">
      <div className="max-w-screen-xl mx-auto">
        
        {/* Navigation Links */}
        <div className="flex flex-col md:flex-row justify-between items-center w-full mb-8">
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl font-bold">
              <span className="text-[#00E5FF]">M1</span>
              <span className="text-white">SSION<span className="text-xs align-top">™</span></span>
            </h2>
          </div>
          <div className="flex flex-wrap gap-4 justify-center md:justify-end">
            <Link to="/privacy-policy" className="text-sm text-white/60 hover:text-cyan-400 transition-colors px-2 py-1">Privacy Policy</Link>
            <Link to="/cookie-policy" className="text-sm text-white/60 hover:text-cyan-400 transition-colors px-2 py-1">Cookie Policy</Link>
            <Link to="/terms" className="text-sm text-white/60 hover:text-cyan-400 transition-colors px-2 py-1">Terms</Link>
            <Link to="/policies" className="text-sm text-white/60 hover:text-cyan-400 transition-colors px-2 py-1">Policies</Link>
            <Link to="/contact" className="text-sm text-white/60 hover:text-cyan-400 transition-colors px-2 py-1">Contact</Link>
          </div>
        </div>

        {/* IP Section - Apple Style Compact */}
        <div className="border-t border-white/10 pt-8 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-white/40">
            <Shield className="w-3 h-3" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Proprietà Intellettuale</span>
          </div>
          
          <p className="text-white/30 text-[11px] max-w-2xl mx-auto leading-relaxed">
            <span className="text-[#00D1FF]/60">M1SSION™</span> è un prodotto originale di <span className="text-white/50">NIYVORA KFT™</span>.
            Tutti i contenuti, logiche di gioco, architettura software e design sono protetti da diritti di proprietà intellettuale.
          </p>

          {/* Registrazioni & Certificazioni */}
          <div className="text-white/25 text-[10px] space-y-1 max-w-3xl mx-auto">
            <p className="text-white/35 text-[9px] uppercase tracking-wider mb-2">Registrazioni & Certificazioni</p>
            <p>
              SafeCreative — Software & DB: <a href="https://www.safecreative.org/certificate/2505261861325-2VXE4Q" target="_blank" rel="noopener noreferrer" className="text-[#00D1FF]/40 hover:text-[#00D1FF]/60">2505261861325-2VXE4Q</a> • 
              Core Source: <a href="https://www.safecreative.org/certificate/2512103987648-62HXMR" target="_blank" rel="noopener noreferrer" className="text-[#00D1FF]/40 hover:text-[#00D1FF]/60">2512103987648-62HXMR</a>
            </p>
            <p>
              Tech Proof: <a href="https://www.safecreative.org/certificate/2512103987648-7TRTSU" target="_blank" rel="noopener noreferrer" className="text-[#00D1FF]/40 hover:text-[#00D1FF]/60">2512103987648-7TRTSU</a> • 
              Logo v1: <a href="https://www.safecreative.org/certificate/2512103988744-9TFSDH" target="_blank" rel="noopener noreferrer" className="text-[#00D1FF]/40 hover:text-[#00D1FF]/60">2512103988744-9TFSDH</a> • 
              Logo Rights: <a href="https://www.safecreative.org/certificate/2512103988744-2KG9UC" target="_blank" rel="noopener noreferrer" className="text-[#00D1FF]/40 hover:text-[#00D1FF]/60">2512103988744-2KG9UC</a>
            </p>
            <p>
              EUIPO — Registered Trademark: <span className="text-white/40">M1SSION™</span> • 
              <span className="text-white/40">Geo-Pulse Engine™</span> — Proprietary System
            </p>
          </div>

          <p className="text-amber-400/30 text-[10px]">
            ⚠️ Riproduzione non autorizzata vietata ai sensi delle normative EU.
          </p>
        </div>
        
        {/* Copyright */}
        <div className="pt-6 text-center">
          <p className="text-xs text-white/40">
            © 2025 <span className="text-[#00E5FF]/60">M1</span>SSION™ — All rights reserved — NIYVORA KFT™
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
