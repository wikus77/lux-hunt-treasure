// © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED

/**
 * PRIZE SHOWCASE - Display dei premi attivi con carousel automatico
 * Premium Apple-like design
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Gift, Sparkles, Crown } from 'lucide-react';
import { CAROUSEL_PRIZES, getRandomMiniPrizes, type Prize } from './prizes';
import M1ssionEntryModal, { ENABLE_CINEMATIC_ENTRY } from './M1ssionEntryModal';
import { useSound } from './useSound';

interface PrizeShowcaseProps {
  onContinue: () => void;
}

const CAROUSEL_INTERVAL = 3500; // 3.5 secondi per slide

const PrizeShowcase: React.FC<PrizeShowcaseProps> = ({ onContinue }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [carouselImageErrors, setCarouselImageErrors] = useState<Record<number, boolean>>({});
  const [miniImageErrors, setMiniImageErrors] = useState<Record<string, boolean>>({});
  
  // Cinematic entry modal state
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const { enableSound, playSound } = useSound();

  // Premi random per la sezione mini (generati una volta sola)
  const miniPrizes = useMemo(() => getRandomMiniPrizes(6), []);

  // Carousel automatico
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_PRIZES.length);
    }, CAROUSEL_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  const handleCarouselImageError = (index: number) => {
    setCarouselImageErrors(prev => ({ ...prev, [index]: true }));
  };

  const handleMiniImageError = (id: string) => {
    setMiniImageErrors(prev => ({ ...prev, [id]: true }));
  };

  const getRarityIcon = (rarity: Prize['rarity']) => {
    switch (rarity) {
      case 'legendary':
        return <Crown className="w-3 h-3 mr-1" />;
      case 'epic':
        return <Sparkles className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  const getRarityLabel = (rarity: Prize['rarity']) => {
    switch (rarity) {
      case 'legendary':
        return 'LEGGENDARIO';
      case 'epic':
        return 'EPICO';
      case 'rare':
        return 'RARO';
      default:
        return 'COMUNE';
    }
  };

  const currentPrize = CAROUSEL_PRIZES[currentSlide];

  // Handle CTA click - opens cinematic modal if enabled, otherwise direct action
  const handleCtaClick = useCallback(() => {
    if (ENABLE_CINEMATIC_ENTRY) {
      // Enable audio context on user gesture
      enableSound();
      setIsEntryModalOpen(true);
    } else {
      onContinue();
    }
  }, [enableSound, onContinue]);

  // Handle entry modal complete - called after cinematic exit transition
  const handleModalEnter = useCallback(() => {
    // Play epic entry sound
    playSound('entry');
    
    // Navigate directly - modal handles its own fade transition
    // Do NOT close modal here - the exit animation is still visible
    onContinue();
  }, [playSound, onContinue]);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setIsEntryModalOpen(false);
  }, []);

  return (
    <div className="qrwin-showcase">
      {/* Header */}
      <div className="qrwin-showcase-header">
        <div className="qrwin-showcase-badge">
          <div className="qrwin-showcase-badge-dot" />
          <span className="qrwin-showcase-badge-text">Accesso Confermato</span>
        </div>
        <h1 className="qrwin-showcase-title">Premi Attivi</h1>
        <p className="qrwin-showcase-subtitle">Questi premi sono attualmente in palio nella missione</p>
      </div>

      {/* Scrollable Content */}
      <div className="qrwin-showcase-content">
        {/* Carousel Prize Card */}
        <div className="qrwin-hero-card">
          <div className="qrwin-carousel">
            {CAROUSEL_PRIZES.map((prize, index) => (
              <div
                key={prize.id}
                className={`qrwin-carousel-slide ${index === currentSlide ? 'active' : ''}`}
              >
                <div className="qrwin-hero-image">
                  {!carouselImageErrors[index] ? (
                    <img 
                      src={prize.imageUrl} 
                      alt={prize.title}
                      onError={() => handleCarouselImageError(index)}
                    />
                  ) : (
                    <div className="qrwin-hero-image-fallback">
                      <Gift className="w-16 h-16" />
                    </div>
                  )}
                  <span className="qrwin-hero-tag">{prize.tag}</span>
                  <span className="qrwin-hero-rarity">
                    {getRarityIcon(prize.rarity)}
                    {getRarityLabel(prize.rarity)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Carousel Indicators */}
          <div className="qrwin-carousel-indicators">
            {CAROUSEL_PRIZES.map((_, index) => (
              <button
                key={index}
                className={`qrwin-carousel-dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>

          <div className="qrwin-hero-body">
            <h2 className="qrwin-hero-title">{currentPrize.title}</h2>
            <p className="qrwin-hero-subtitle">{currentPrize.subtitle}</p>
            {currentPrize.value && (
              <span className="qrwin-hero-value">{currentPrize.value}</span>
            )}
          </div>
        </div>

        {/* Mini Prizes Section */}
        <div className="qrwin-mini-section">
          <h3 className="qrwin-mini-title">Altri Premi Disponibili</h3>
          <div className="qrwin-mini-scroll">
            {miniPrizes.map((prize) => (
              <div key={prize.id} className="qrwin-mini-card">
                <div className="qrwin-mini-image">
                  {!miniImageErrors[prize.id] ? (
                    <img 
                      src={prize.imageUrl} 
                      alt={prize.title}
                      onError={() => handleMiniImageError(prize.id)}
                    />
                  ) : (
                    <Gift />
                  )}
                </div>
                <div className="qrwin-mini-body">
                  <h4 className="qrwin-mini-name">{prize.title}</h4>
                  {prize.value && (
                    <p className="qrwin-mini-value">{prize.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Footer */}
      <div className="qrwin-cta-footer">
        <button 
          className="qrwin-cta-button"
          onClick={handleCtaClick}
        >
          Entra in M1SSION
        </button>
        <p className="qrwin-legal">
          Non è un gioco d'azzardo. Nessun premio in denaro. 
          Accesso digitale gratuito e temporaneo.
        </p>
      </div>

      {/* Cinematic Entry Modal */}
      {ENABLE_CINEMATIC_ENTRY && (
        <M1ssionEntryModal
          isOpen={isEntryModalOpen}
          onClose={handleModalClose}
          onEnter={handleModalEnter}
        />
      )}
    </div>
  );
};

export default PrizeShowcase;
