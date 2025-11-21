// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import gsap from 'gsap';

interface M1ssionInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const M1ssionInfoModal: React.FC<M1ssionInfoModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Show modal with animation
      gsap.timeline()
        .set(modalRef.current, { display: 'flex' })
        .fromTo(overlayRef.current, 
          { opacity: 0 },
          { opacity: 1, duration: 0.3 }
        )
        .fromTo(contentRef.current,
          { scale: 0.8, opacity: 0, y: 50 },
          { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.7)" },
          "-=0.1"
        );
    } else if (!isOpen && modalRef.current) {
      // Hide modal with animation
      gsap.timeline()
        .to(contentRef.current, {
          scale: 0.8,
          opacity: 0,
          y: 50,
          duration: 0.3,
          ease: "power2.in"
        })
        .to(overlayRef.current, {
          opacity: 0,
          duration: 0.2
        }, "-=0.1")
        .set(modalRef.current, { display: 'none' });
    }
  }, [isOpen]);
  
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 hidden"
      style={{ display: 'none' }}
    >
      {/* Backdrop */}
      <div 
        ref={overlayRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleOverlayClick}
      />
      
      {/* Modal Content */}
      <div 
        ref={contentRef}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl"
        style={{
          background: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 255, 255, 0.3)',
          boxShadow: '0 0 50px rgba(0, 255, 255, 0.2)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cyan-500/20">
          <h2 className="text-3xl font-bold text-white">
            <span className="text-cyan-400">M1</span>SSION
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* App Description */}
          <section>
            <h3 className="text-xl font-semibold text-cyan-400 mb-3">Come Funziona l'App</h3>
            <p className="text-gray-300 leading-relaxed">
              M1SSION è un'app gamificata che trasforma la tua vita quotidiana in un'avventura epica. 
              Completa missioni personalizzate, guadagna punti esperienza e scala la classifica globale 
              mentre raggiungi i tuoi obiettivi personali e professionali.
            </p>
          </section>
          
          {/* Subscription Plans */}
          <section>
            <h3 className="text-xl font-semibold text-cyan-400 mb-4">Piani di Abbonamento</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg border border-gray-600/30">
                <h4 className="font-semibold text-gray-300 mb-2">🥈 Silver Plan</h4>
                <p className="text-sm text-gray-400">Accesso base con missioni standard e tracking personalizzato.</p>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 rounded-lg border border-yellow-600/30">
                <h4 className="font-semibold text-yellow-400 mb-2">🥇 Gold Plan</h4>
                <p className="text-sm text-gray-300">Missioni avanzate, analytics dettagliati e rewards esclusivi.</p>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-purple-900/30 to-black/50 rounded-lg border border-purple-500/30">
                <h4 className="font-semibold text-purple-400 mb-2">⚫ Black Plan</h4>
                <p className="text-sm text-gray-300">Piano premium con AI coaching, missioni illimitate e accesso VIP.</p>
              </div>
            </div>
          </section>
          
          {/* Game Description */}
          <section>
            <h3 className="text-xl font-semibold text-cyan-400 mb-3">Il Gioco</h3>
            <p className="text-gray-300 leading-relaxed">
              Ogni giorno è una nuova missione. Dalle sfide fitness agli obiettivi di produttività, 
              dalle missioni sociali ai traguardi di apprendimento. Ogni completamento ti avvicina 
              al prossimo livello e sblocca nuove funzionalità e ricompense esclusive.
            </p>
          </section>
          
          {/* CTA */}
          <div className="pt-4 border-t border-cyan-500/20">
            <button 
              onClick={onClose}
              className="w-full py-3 px-6 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all duration-300 transform hover:scale-[1.02]"
            >
              Inizia la Tua Missione
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default M1ssionInfoModal;