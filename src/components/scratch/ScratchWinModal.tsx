/**
 * M1SSION™ SCRATCH & WIN Modal
 * Gratta e Vinci virtuale con Canvas touch/mouse
 * 
 * Features:
 * - Real scratch interaction (touch/mouse)
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
  },
  30: {
    image: '/assets/scratch/scratch-win-30m1u.png',
    maxJackpot: 10000,
    color: '#00BFFF',
    gradient: 'from-cyan-500 to-blue-600',
  },
  50: {
    image: '/assets/scratch/scratch-win-50m1u.png',
    maxJackpot: 100000,
    color: '#FF1493',
    gradient: 'from-pink-500 to-purple-600',
  },
};

const SCRATCH_THRESHOLD = 60; // % required to reveal

export const ScratchWinModal: React.FC<ScratchWinModalProps> = ({
  isOpen,
  onClose,
  tier,
  purchaseId,
  clientNonce,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
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
  
  const { addNotification } = useNotifications();
  
  const config = TIER_CONFIG[tier];
  
  // Initialize canvas with scratch overlay
  useEffect(() => {
    if (!isOpen || !canvasRef.current || !containerRef.current) return;
    
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
    
    // Draw scratch overlay (silver metallic)
    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, '#C0C0C0');
    gradient.addColorStop(0.3, '#D8D8D8');
    gradient.addColorStop(0.5, '#E8E8E8');
    gradient.addColorStop(0.7, '#D8D8D8');
    gradient.addColorStop(1, '#A8A8A8');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);
    
    // Add "GRATTA QUI" text
    ctx.fillStyle = '#666666';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GRATTA QUI', rect.width / 2, rect.height / 2 - 20);
    ctx.font = '16px Arial';
    ctx.fillText('Usa il dito o il mouse', rect.width / 2, rect.height / 2 + 20);
    
    // Set composite mode for scratching
    ctx.globalCompositeOperation = 'destination-out';
    
  }, [isOpen]);
  
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
  const scratch = useCallback((x: number, y: number) => {
    if (!canvasRef.current || isRevealed) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const scratchX = (x - rect.left) * scaleX / (window.devicePixelRatio || 1);
    const scratchY = (y - rect.top) * scaleY / (window.devicePixelRatio || 1);
    
    // Draw scratch circle
    ctx.beginPath();
    ctx.arc(scratchX, scratchY, 25, 0, Math.PI * 2);
    ctx.fill();
    
    // Update progress periodically
    const progress = calculateProgress();
    setScratchProgress(progress);
    
    if (progress >= SCRATCH_THRESHOLD && !canReveal) {
      setCanReveal(true);
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
  }, []);
  
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
  }, []);
  
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
      
      // Clear canvas to show result
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
      
      setResult({
        rewardType: data.reward_type,
        rewardValue: data.reward_value,
        isJackpot: data.is_jackpot,
        clueText: data.clue_text,
      });
      setIsRevealed(true);
      
      // Trigger animations based on result
      if (data.reward_type === 'm1u' && data.reward_value > 0) {
        // Fire confetti for wins
        if (data.is_jackpot) {
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
          
        } else if (data.reward_value >= 100) {
          // Big win confetti
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
          });
        } else {
          // Small win confetti
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
          });
        }
        
        // Trigger M1U Pill slot machine animation
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('m1u-credited', { 
            detail: { amount: data.reward_value } 
          }));
        }, 1500);
        
      } else if (data.reward_type === 'clue' && data.clue_text) {
        // Add clue notification
        toast.success('🔍 Hai vinto un INDIZIO!', {
          description: data.clue_text,
          duration: 8000,
        });
        
        // Save to notifications
        if (addNotification) {
          addNotification({
            title: '🔍 Nuovo indizio sbloccato!',
            description: data.clue_text,
          });
        }
      }
      
    } catch (err: any) {
      console.error('Reveal error:', err);
      setError(err.message || 'Errore durante la rivelazione');
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
      }, 500);
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
        className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-md"
        onClick={(e) => {
          if (e.target === e.currentTarget && isRevealed) {
            onClose();
          }
        }}
      >
        {/* Close button */}
        <motion.button
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          onClick={onClose}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="w-6 h-6 text-white" />
        </motion.button>
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative w-[90vw] max-w-md mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-4">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Gift className={`w-12 h-12 mx-auto mb-2`} style={{ color: config.color }} />
            </motion.div>
            <h2 className="text-2xl font-bold text-white">SCRATCH & WIN</h2>
            <p className="text-white/70">Ticket {tier} M1U</p>
          </div>
          
          {/* Scratch area container */}
          <div 
            ref={containerRef}
            className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl"
            style={{ 
              boxShadow: `0 0 40px ${config.color}40`,
              border: `2px solid ${config.color}60`,
            }}
          >
            {/* Background image (prize reveal) */}
            <img
              ref={imageRef}
              src={config.image}
              alt={`Scratch ticket ${tier} M1U`}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                console.error('Failed to load scratch image');
                (e.target as HTMLImageElement).src = '/assets/m1ssion/placeholder.png';
              }}
            />
            
            {/* Result overlay when revealed */}
            {isRevealed && result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
              >
                {result.rewardType === 'm1u' ? (
                  <>
                    <motion.div
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-center"
                    >
                      {result.isJackpot && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                          className="text-4xl mb-2"
                        >
                          🎰 JACKPOT! 🎰
                        </motion.div>
                      )}
                      <div className={`text-6xl font-black bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>
                        +{result.rewardValue.toLocaleString()}
                      </div>
                      <div className="text-2xl text-white font-bold mt-2">M1U</div>
                      <Sparkles className="w-8 h-8 mx-auto mt-4" style={{ color: config.color }} />
                    </motion.div>
                  </>
                ) : (
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-center px-6"
                  >
                    <div className="text-4xl mb-4">🔍</div>
                    <div className="text-2xl font-bold text-white mb-2">INDIZIO SBLOCCATO!</div>
                    <p className="text-white/80 text-sm italic">"{result.clueText}"</p>
                  </motion.div>
                )}
              </motion.div>
            )}
            
            {/* Scratch canvas */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full touch-none cursor-crosshair"
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
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <Loader2 className="w-12 h-12 text-white animate-spin" />
              </div>
            )}
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-white/70 mb-1">
              <span>Grattato: {scratchProgress}%</span>
              <span>{scratchProgress >= SCRATCH_THRESHOLD ? '✅ Pronto!' : `Gratta ancora ${SCRATCH_THRESHOLD - scratchProgress}%`}</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
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
              className="mt-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg flex items-center gap-2"
            >
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-300 text-sm">{error}</span>
            </motion.div>
          )}
          
          {/* Close button when revealed */}
          {isRevealed && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onClick={onClose}
              className={`mt-6 w-full py-3 rounded-full font-bold text-white bg-gradient-to-r ${config.gradient} shadow-lg hover:shadow-xl transition-shadow`}
            >
              CHIUDI
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
  
  return createPortal(modalContent, document.body);
};

export default ScratchWinModal;

// © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

