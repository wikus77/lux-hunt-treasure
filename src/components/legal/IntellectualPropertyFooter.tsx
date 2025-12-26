/**
 * M1SSION™ Intellectual Property Footer
 * Compact Apple-style footer for all pages
 * © 2025 NIYVORA KFT™ – All Rights Reserved
 */

import React from 'react';
import { Shield } from 'lucide-react';

interface IntellectualPropertyFooterProps {
  className?: string;
}

const IntellectualPropertyFooter: React.FC<IntellectualPropertyFooterProps> = ({ className = '' }) => {
  return (
    <div className={`pt-8 mt-8 border-t border-white/10 ${className}`}>
      {/* Compact IP Notice */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-white/50">
          <Shield className="w-4 h-4" />
          <span className="text-xs font-medium uppercase tracking-wider">Proprietà Intellettuale</span>
        </div>
        
        <p className="text-white/40 text-xs max-w-2xl mx-auto leading-relaxed">
          <span className="text-[#00D1FF]/70">M1SSION™</span> è un prodotto originale di <span className="text-white/60">NIYVORA KFT™</span>.
          Tutti i contenuti, logiche di gioco, architettura software e design sono protetti da diritti di proprietà intellettuale.
        </p>

        {/* Registrations - Compact */}
        <div className="text-white/30 text-[10px] space-y-1">
          <p>Codice sorgente registrato presso Safe Creative • Certificato n. <span className="text-white/50">2512103987648</span></p>
          <p>Marchio M1SSION™ registrato EUIPO (Unione Europea) • Geo-Pulse Engine™ motore proprietario</p>
        </div>

        {/* Legal Warning - Compact */}
        <p className="text-amber-400/40 text-[10px] max-w-xl mx-auto">
          ⚠️ Qualsiasi riproduzione non autorizzata costituisce violazione dei diritti di proprietà intellettuale.
        </p>

        {/* Copyright */}
        <div className="pt-4 border-t border-white/5">
          <p className="text-white/50 text-xs">
            © 2025 <span className="text-[#00D1FF]/70">M1</span>SSION™ — All rights reserved — NIYVORA KFT™
          </p>
        </div>
      </div>
    </div>
  );
};

export default IntellectualPropertyFooter;



