/**
 * M1SSION™ SCRATCH & WIN Modal - FULLSCREEN VERSION
 * Gratta e Vinci virtuale con area scratch sui 12 rettangoli
 * 
 * Features:
 * - FULLSCREEN modal (100vw x 100vh)
 * - Real scratch interaction on the 12 prize cells
 * - Server-side outcome (anti-cheat)
 * - Jackpot animations
 * - M1U Pill slot machine integration
 * - Clue notification integration
 * 
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Gift, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { useNotifications } from '@/hooks/useNotifications';

interface ScratchWinModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: 10 | 30 | 50;
  purchaseId: string;
  clientNonce: string;
}

// Tier configurations
const TIER_CONFIG = {
  10: {
    image: '/assets/scratch/scratch-win-10m1u.png',
    maxJackpot: 1000,
    color: '#FFD700',
    gradient: 'from-yellow-500 to-amber-600',
    possibleSymbols: [
      { symbol: '💰', label: '10 M1U' },
      { symbol: '💎', label: '50 M1U' },
      { symbol: '🔍', label: 'INDIZIO' },
      { symbol: '⭐', label: '100 M1U' },
      { symbol: '🎯', label: '1000 M1U' },
      { symbol: '❌', label: 'NULLA' },
    ],
  },
  30: {
    image: '/assets/scratch/scratch-win-30m1u.png',
    maxJackpot: 10000,
    color: '#00BFFF',
    gradient: 'from-cyan-500 to-blue-600',
    possibleSymbols: [
      { symbol: '💰', label: '30 M1U' },
      { symbol: '💎', label: '150 M1U' },
      { symbol: '🔍', label: 'INDIZIO' },
      { symbol: '⭐', label: '500 M1U' },
      { symbol: '🎯', label: '10000 M1U' },
      { symbol: '❌', label: 'NULLA' },
    ],
  },
  50: {
    image: '/assets/scratch/scratch-win-50m1u.png',
    maxJackpot: 100000,
    color: '#FF1493',
    gradient: 'from-pink-500 to-purple-600',
    possibleSymbols: [
      { symbol: '💰', label: '50 M1U' },
      { symbol: '💎', label: '250 M1U' },
      { symbol: '🔍', label: 'INDIZIO' },
      { symbol: '⭐', label: '1000 M1U' },
      { symbol: '🎯', label: '100000 M1U' },
      { symbol: '❌', label: 'NULLA' },
    ],
  },
};

const SCRATCH_THRESHOLD = 60; // % required to reveal
const GRID_COLS = 4;
const GRID_ROWS = 3;

// Posizioni relative dei rettangoli nell'immagine (rispetto all'immagine 1024x1536)
// I 12 rettangoli da grattare sono nella sezione "I TUOI ACCESSI" 
// Iniziano SOTTO la scritta "I TUOI ACCESSI" e finiscono PRIMA di "Scratch&Win!"
// NOTA: Calibrato visivamente - questi sono solo i 12 rettangoli
const GRID_TOP_PERCENT = 54;  // Appena sotto "I TUOI ACCESSI"
const GRID_BOTTOM_PERCENT = 73; // Prima di "Scratch&Win!"
const GRID_LEFT_PERCENT = 6;
const GRID_RIGHT_PERCENT = 94;

export const ScratchWinModal: React.FC<ScratchWinModalProps> = ({
  isOpen,
  onClose,
  tier,
  purchaseId,
  clientNonce,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const ticketRef = useRef<HTMLDivElement>(null);
  
  const [isRevealing, setIsRevealing] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const [canReveal, setCanReveal] = useState(false);
  const [result, setResult] = useState<{
    rewardType: 'm1u' | 'clue';
    rewardValue: number;
    isJackpot: boolean;
    clueText?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [gridSymbols, setGridSymbols] = useState<string[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const { addNotification } = useNotifications();
  
  const config = TIER_CONFIG[tier];
  
  // Generate random grid symbols (client-side visual only, server decides outcome)
  useEffect(() => {
    if (isOpen) {
      const symbols: string[] = [];
      for (let i = 0; i < 12; i++) {
        const randomSymbol = config.possibleSymbols[Math.floor(Math.random() * config.possibleSymbols.length)];
        symbols.push(randomSymbol.symbol);
      }
      setGridSymbols(symbols);
      setImageLoaded(false);
      setScratchProgress(0);
      setCanReveal(false);
      setIsRevealed(false);
      setResult(null);
      setError(null);
    }
  }, [isOpen, tier]);
  
  // Initialize canvas with scratch overlay
  useEffect(() => {
    if (!isOpen || !canvasRef.current || !containerRef.current || !imageLoaded) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size to match container
    const rect = containerRef.current.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.scale(dpr, dpr);
    
    // Draw golden metallic scratch overlay
    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, '#B8860B'); // Dark gold
    gradient.addColorStop(0.25, '#DAA520'); // Goldenrod
    gradient.addColorStop(0.5, '#FFD700'); // Gold
    gradient.addColorStop(0.75, '#DAA520');
    gradient.addColorStop(1, '#B8860B');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);
    
    // Add sparkle texture
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;
      const size = Math.random() * 3 + 1;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Add "GRATTA QUI" text
    ctx.fillStyle = '#8B4513'; // SaddleBrown
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✨ GRATTA QUI ✨', rect.width / 2, rect.height / 2 - 10);
    ctx.font = '12px Arial';
    ctx.fillText('Usa il dito o il mouse', rect.width / 2, rect.height / 2 + 15);
    
    // Set composite mode for scratching
    ctx.globalCompositeOperation = 'destination-out';
    
  }, [isOpen, imageLoaded]);
  
  // Calculate scratch progress
  const calculateProgress = useCallback(() => {
    if (!canvasRef.current) return 0;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparent = 0;
    
    // Check alpha channel (every 4th value)
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparent++;
    }
    
    const total = pixels.length / 4;
    return Math.round((transparent / total) * 100);
  }, []);
  
  // Scratch handler
  const scratch = useCallback((clientX: number, clientY: number) => {
    if (!canvasRef.current || !containerRef.current || isRevealed) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const canvasRect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    const x = (clientX - canvasRect.left);
    const y = (clientY - canvasRect.top);
    
    // Draw scratch circle
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fill();
    
    // Update progress periodically (every few scratches to save performance)
    if (Math.random() < 0.2) {
      const progress = calculateProgress();
      setScratchProgress(progress);
      
      if (progress >= SCRATCH_THRESHOLD && !canReveal) {
        setCanReveal(true);
      }
    }
  }, [isRevealed, calculateProgress, canReveal]);
  
  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsScratching(true);
    const touch = e.touches[0];
    scratch(touch.clientX, touch.clientY);
  }, [scratch]);
  
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isScratching) return;
    e.preventDefault();
    const touch = e.touches[0];
    scratch(touch.clientX, touch.clientY);
  }, [isScratching, scratch]);
  
  const handleTouchEnd = useCallback(() => {
    setIsScratching(false);
    // Final progress calculation
    const progress = calculateProgress();
    setScratchProgress(progress);
    if (progress >= SCRATCH_THRESHOLD && !canReveal) {
      setCanReveal(true);
    }
  }, [calculateProgress, canReveal]);
  
  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsScratching(true);
    scratch(e.clientX, e.clientY);
  }, [scratch]);
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isScratching) return;
    scratch(e.clientX, e.clientY);
  }, [isScratching, scratch]);
  
  const handleMouseUp = useCallback(() => {
    setIsScratching(false);
    // Final progress calculation
    const progress = calculateProgress();
    setScratchProgress(progress);
    if (progress >= SCRATCH_THRESHOLD && !canReveal) {
      setCanReveal(true);
    }
  }, [calculateProgress, canReveal]);
  
  // Reveal the prize
  const handleReveal = async () => {
    if (isRevealing || isRevealed) return;
    
    setIsRevealing(true);
    setError(null);
    
    try {
      const { data, error: rpcError } = await supabase.rpc('reveal_scratch_ticket', {
        p_purchase_id: purchaseId,
        p_client_nonce: clientNonce,
      });
      
      if (rpcError) throw rpcError;
      
      if (data.status === 'error') {
        throw new Error(data.message);
      }
      
      // Parse result
      const rewardDetails = data.reward_details || {};
      
      setResult({
        rewardType: rewardDetails.type || 'm1u',
        rewardValue: rewardDetails.value || 0,
        isJackpot: rewardDetails.value >= config.maxJackpot,
        clueText: rewardDetails.text,
      });
      setIsRevealed(true);
      setScratchProgress(100);
      
      // Clear canvas to show full grid
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
      
      // Trigger animations based on result
      if (rewardDetails.type === 'm1u' && rewardDetails.value > 0) {
        // Fire confetti for wins
        if (rewardDetails.value >= config.maxJackpot) {
          // MEGA JACKPOT confetti
          const duration = 5000;
          const end = Date.now() + duration;
          
          const jackpotConfetti = () => {
            confetti({
              particleCount: 100,
              spread: 180,
              startVelocity: 60,
              origin: { y: 0.6 },
              colors: ['#FFD700', '#FFA500', '#FF6347', '#FF1493', '#00FF00'],
            });
            
            if (Date.now() < end) {
              requestAnimationFrame(jackpotConfetti);
            }
          };
          jackpotConfetti();
          
          toast.success('🎰 JACKPOT! 🎰', {
            description: `Hai vinto ${rewardDetails.value.toLocaleString()} M1U!`,
            duration: 10000,
          });
          
        } else if (rewardDetails.value >= 100) {
          // Big win confetti
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
          });
          toast.success('🎉 HAI VINTO!', {
            description: `+${rewardDetails.value.toLocaleString()} M1U`,
          });
        } else {
          // Small win confetti
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
          });
          toast.success('💰 Hai vinto!', {
            description: `+${rewardDetails.value.toLocaleString()} M1U`,
          });
        }
        
        // Trigger M1U Pill slot machine animation
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('m1u-credited', { 
            detail: { amount: rewardDetails.value } 
          }));
        }, 1500);
        
      } else if (rewardDetails.type === 'clue' && rewardDetails.text) {
        // Add clue notification
        confetti({
          particleCount: 30,
          spread: 50,
          colors: ['#00BFFF', '#1E90FF', '#4169E1'],
        });
        
        toast.success('🔍 Hai vinto un INDIZIO!', {
          description: rewardDetails.text,
          duration: 8000,
        });
        
        // Save to notifications
        if (addNotification) {
          addNotification({
            title: '🔍 Nuovo indizio sbloccato!',
            description: rewardDetails.text,
          });
        }
      } else {
        // No win
        toast.info('Nessuna vincita', {
          description: 'Ritenta la fortuna!',
        });
      }
      
    } catch (err: any) {
      console.error('Reveal error:', err);
      setError(err.message || 'Errore durante la rivelazione');
      toast.error('Errore', { description: err.message });
    } finally {
      setIsRevealing(false);
    }
  };
  
  // Auto-reveal when threshold reached
  useEffect(() => {
    if (canReveal && !isRevealed && !isRevealing) {
      // Small delay to let user see they reached threshold
      const timer = setTimeout(() => {
        handleReveal();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [canReveal, isRevealed, isRevealing]);
  
  if (!isOpen) return null;
  
  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999999] flex flex-col bg-black"
        style={{ 
          width: '100vw', 
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        {/* Header bar */}
        <div 
          className="flex items-center justify-between px-4 py-3"
          style={{ 
            background: `linear-gradient(135deg, ${config.color}40, transparent)`,
            borderBottom: `1px solid ${config.color}30`,
          }}
        >
          <div className="flex items-center gap-2">
            <Gift className="w-6 h-6" style={{ color: config.color }} />
            <span className="text-white font-bold text-lg">SCRATCH & WIN</span>
            <span className="text-white/70 text-sm">• {tier} M1U</span>
          </div>
          <motion.button
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-5 h-5 text-white" />
          </motion.button>
        </div>
        
        {/* Main content - Ticket */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden">
          {/* Ticket container */}
          <div 
            ref={ticketRef}
            className="relative w-full max-w-md mx-auto"
            style={{ maxHeight: 'calc(100vh - 200px)' }}
          >
            {/* Ticket image background */}
            <img
              src={config.image}
              alt={`Scratch ticket ${tier} M1U`}
              className="w-full h-auto rounded-lg shadow-2xl"
              style={{ 
                boxShadow: `0 0 60px ${config.color}50`,
              }}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                console.error('Failed to load scratch image');
                setImageLoaded(true); // Continue anyway
              }}
            />
            
            {/* Scratch area overlay - positioned over the 12 rectangles */}
            {imageLoaded && (
              <div
                ref={containerRef}
                className="absolute"
                style={{
                  top: `${GRID_TOP_PERCENT}%`,
                  left: `${GRID_LEFT_PERCENT}%`,
                  width: `${GRID_RIGHT_PERCENT - GRID_LEFT_PERCENT}%`,
                  height: `${GRID_BOTTOM_PERCENT - GRID_TOP_PERCENT}%`,
                }}
              >
                {/* Symbol grid underneath scratch layer */}
                <div 
                  className="absolute inset-0 grid gap-1 p-1"
                  style={{ 
                    gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
                    gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
                  }}
                >
                  {gridSymbols.map((symbol, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-center bg-black/80 rounded text-2xl"
                      style={{
                        textShadow: '0 0 10px rgba(255,215,0,0.8)',
                      }}
                    >
                      {symbol}
                    </div>
                  ))}
                </div>
                
                {/* Scratch canvas */}
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full touch-none cursor-crosshair rounded"
                  style={{ touchAction: 'none' }}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                />
                
                {/* Revealing loader */}
                {isRevealing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded">
                    <Loader2 className="w-10 h-10 text-white animate-spin" />
                  </div>
                )}
              </div>
            )}
            
            {/* Result overlay */}
            {isRevealed && result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 rounded-lg backdrop-blur-sm"
              >
                {result.rewardType === 'm1u' && result.rewardValue > 0 ? (
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center px-6"
                  >
                    {result.isJackpot && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        className="text-5xl mb-4"
                      >
                        🎰 JACKPOT! 🎰
                      </motion.div>
                    )}
                    <motion.div 
                      className={`text-7xl font-black bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      +{result.rewardValue.toLocaleString()}
                    </motion.div>
                    <div className="text-3xl text-white font-bold mt-2">M1U</div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <Sparkles className="w-10 h-10 mx-auto mt-6" style={{ color: config.color }} />
                    </motion.div>
                  </motion.div>
                ) : result.rewardType === 'clue' && result.clueText ? (
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-center px-6"
                  >
                    <div className="text-6xl mb-4">🔍</div>
                    <div className="text-3xl font-bold text-white mb-4">INDIZIO SBLOCCATO!</div>
                    <p className="text-white/80 text-lg italic max-w-xs mx-auto">"{result.clueText}"</p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-center px-6"
                  >
                    <div className="text-6xl mb-4">😔</div>
                    <div className="text-2xl font-bold text-white/80">Nessuna vincita</div>
                    <p className="text-white/60 mt-2">Ritenta la fortuna!</p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        </div>
        
        {/* Bottom bar with progress */}
        <div 
          className="px-4 py-4"
          style={{ 
            background: `linear-gradient(to top, ${config.color}20, transparent)`,
            borderTop: `1px solid ${config.color}20`,
          }}
        >
          {/* Progress bar */}
          <div className="max-w-md mx-auto mb-3">
            <div className="flex justify-between text-sm text-white/70 mb-1">
              <span>Grattato: {scratchProgress}%</span>
              <span>
                {isRevealed ? '✅ Completato!' : 
                 scratchProgress >= SCRATCH_THRESHOLD ? '✅ Pronto per rivelare!' : 
                 `Gratta ancora ${SCRATCH_THRESHOLD - scratchProgress}%`}
              </span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r ${config.gradient}`}
                initial={{ width: 0 }}
                animate={{ width: `${scratchProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
          
          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto mb-3 p-3 bg-red-500/20 border border-red-500/40 rounded-lg flex items-center gap-2"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-red-300 text-sm">{error}</span>
            </motion.div>
          )}
          
          {/* Action button */}
          <div className="max-w-md mx-auto">
            {isRevealed ? (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={onClose}
                className={`w-full py-4 rounded-full font-bold text-white text-lg bg-gradient-to-r ${config.gradient} shadow-lg hover:shadow-xl transition-all active:scale-95`}
              >
                CHIUDI
              </motion.button>
            ) : canReveal ? (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleReveal}
                disabled={isRevealing}
                className={`w-full py-4 rounded-full font-bold text-white text-lg bg-gradient-to-r ${config.gradient} shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50`}
              >
                {isRevealing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    RIVELANDO...
                  </span>
                ) : (
                  '🎁 RIVELA IL PREMIO!'
                )}
              </motion.button>
            ) : (
              <div className="text-center text-white/60">
                <span className="animate-pulse">👆 Gratta l'area dorata per rivelare i simboli</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
  
  return createPortal(modalContent, document.body);
};

export default ScratchWinModal;

// © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
