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
    // Possibili premi REALI per questo tier (usati per riempire celle non vincenti)
    possiblePrizes: ['10 M1U', '20 M1U', '50 M1U', '100 M1U', 'INDIZIO'],
  },
  30: {
    image: '/assets/scratch/scratch-win-30m1u.png',
    maxJackpot: 10000,
    color: '#00BFFF',
    gradient: 'from-cyan-500 to-blue-600',
    possiblePrizes: ['30 M1U', '50 M1U', '100 M1U', '200 M1U', '500 M1U', 'INDIZIO'],
  },
  50: {
    image: '/assets/scratch/scratch-win-50m1u.png',
    maxJackpot: 100000,
    color: '#FF1493',
    gradient: 'from-pink-500 to-purple-600',
    possiblePrizes: ['50 M1U', '100 M1U', '500 M1U', '1000 M1U', '5000 M1U', 'INDIZIO'],
  },
};

const SCRATCH_THRESHOLD = 60; // % required to reveal
const GRID_COLS = 4;
const GRID_ROWS = 3;

// ═══════════════════════════════════════════════════════════════════════════
// COORDINATE DEI 12 RETTANGOLI - CALIBRAZIONE FINALE
// Tentativo 6: BOTTOM 78.5 copre footer text - riduco
// ═══════════════════════════════════════════════════════════════════════════
const GRID_TOP_PERCENT = 52.5;    // OK - non copre "I TUOI ACCESSI"
const GRID_BOTTOM_PERCENT = 76.0; // Ridotto per non coprire "Ricompense digitali"
const GRID_LEFT_PERCENT = 10.5;   // OK
const GRID_RIGHT_PERCENT = 89.5;  // OK

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
  
  // ═══════════════════════════════════════════════════════════════════════════
  // UX FIX: NO SYMBOLS PRE-REVEAL
  // Prima del reveal: griglia VUOTA (solo texture scura sotto overlay)
  // Dopo il reveal: simboli appaiono con animazione
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Initialize: griglia VUOTA prima del reveal (nessun simbolo fake)
  useEffect(() => {
    if (isOpen) {
      // PRE-REVEAL: nessun simbolo visibile (array vuoto)
      setGridSymbols([]);
      setImageLoaded(false);
      setScratchProgress(0);
      setCanReveal(false);
      setIsRevealed(false);
      setResult(null);
      setError(null);
    }
  }, [isOpen, tier]);
  
  // Genera griglia DOPO il reveal - mostra il VERO premio con 3 simboli uguali
  const generateRevealedGrid = useCallback((rewardType: 'm1u' | 'clue', rewardValue: number) => {
    const grid: string[] = [];
    
    // Simboli per celle non vincenti
    const FILLER_SYMBOLS = ['X', 'PERSO', '?', 'RIPROVA'];
    
    // TUTTI i ticket hanno un premio (M1U o INDIZIO), non esistono "perdenti" nel DB!
    // Questo caso NON dovrebbe mai accadere
    if (rewardType === 'm1u' && rewardValue === 0) {
      console.error('⚠️ Unexpected: ticket with 0 M1U reward');
      // Fallback: mostra simboli misti senza tris
      const mixedSymbols = [...FILLER_SYMBOLS, ...FILLER_SYMBOLS, ...FILLER_SYMBOLS];
      return mixedSymbols.slice(0, 12).sort(() => Math.random() - 0.5);
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // VINCENTE: 3 celle IDENTICHE con il premio ESATTO + 9 celle diverse
    // ═══════════════════════════════════════════════════════════════════════════
    let winningPrize: string;
    if (rewardType === 'clue') {
      winningPrize = 'INDIZIO';
    } else {
      // ESATTAMENTE il valore vinto, es. "50 M1U"
      winningPrize = `${rewardValue} M1U`;
    }
    
    console.log('🎰 Generating grid with winning prize:', winningPrize);
    
    // Posizioni random per i 3 premi vincenti
    const positions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const shuffled = positions.sort(() => Math.random() - 0.5);
    const winningPositions = new Set(shuffled.slice(0, 3));
    
    // Celle non vincenti: mix di simboli DIVERSI dal premio (no tris accidentali!)
    const fillerOptions = [...FILLER_SYMBOLS];
    // Aggiungi altri premi M1U possibili DIVERSI dal vincente
    config.possiblePrizes.forEach(p => {
      if (p !== winningPrize) {
        fillerOptions.push(p);
      }
    });
    
    // Riempi la griglia
    for (let i = 0; i < 12; i++) {
      if (winningPositions.has(i)) {
        // 🏆 Cella vincente - mostra il premio ESATTO
        grid.push(winningPrize);
      } else {
        // Simbolo casuale DIVERSO dal vincente
        const randomSymbol = fillerOptions[Math.floor(Math.random() * fillerOptions.length)];
        grid.push(randomSymbol);
      }
    }
    
    console.log('🎰 Final grid:', grid);
    return grid;
  }, [config.possiblePrizes]);
  
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
    
    // ═══════════════════════════════════════════════════════════════════════
    // OVERLAY DORATO REALISTICO - Simula vernice metallizzata da grattare
    // ═══════════════════════════════════════════════════════════════════════
    
    // Layer 1: Base dorata con gradiente metallico
    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, '#8B7500');    // Oro scuro
    gradient.addColorStop(0.2, '#B8860B');  // DarkGoldenrod
    gradient.addColorStop(0.4, '#DAA520');  // Goldenrod
    gradient.addColorStop(0.5, '#FFD700');  // Gold puro
    gradient.addColorStop(0.6, '#DAA520');
    gradient.addColorStop(0.8, '#B8860B');
    gradient.addColorStop(1, '#8B7500');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);
    
    // Layer 2: Texture granulosa (simula vernice grattabile)
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;
      const alpha = Math.random() * 0.15;
      ctx.fillStyle = Math.random() > 0.5 
        ? `rgba(255, 255, 255, ${alpha})` 
        : `rgba(0, 0, 0, ${alpha * 0.5})`;
      ctx.fillRect(x, y, 2, 2);
    }
    
    // Layer 3: Highlights metallici
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;
      const size = Math.random() * 2 + 0.5;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Layer 4: Bordo interno sottile
    ctx.strokeStyle = 'rgba(139, 69, 19, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, rect.width - 4, rect.height - 4);
    
    // Testo centrale
    ctx.fillStyle = 'rgba(101, 67, 33, 0.9)'; // Marrone scuro
    ctx.font = `bold ${Math.min(rect.width / 12, 16)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GRATTA', rect.width / 2, rect.height / 2 - 8);
    ctx.font = `${Math.min(rect.width / 16, 12)}px Arial`;
    ctx.fillText('con il dito', rect.width / 2, rect.height / 2 + 10);
    
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
  
  // Scratch handler - EFFETTO ULTRA REALISTICO (simula moneta vera)
  const scratch = useCallback((clientX: number, clientY: number) => {
    if (!canvasRef.current || !containerRef.current || isRevealed) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const canvasRect = canvas.getBoundingClientRect();
    
    const x = (clientX - canvasRect.left);
    const y = (clientY - canvasRect.top);
    
    // ═══════════════════════════════════════════════════════════════════════
    // EFFETTO ULTRA REALISTICO: Raggio MOLTO piccolo = molti passaggi necessari
    // Simula una vera moneta da grattare - ogni passata rimuove poco materiale
    // ═══════════════════════════════════════════════════════════════════════
    const baseRadius = 8; // MOLTO piccolo - come una vera moneta
    
    // Solo 1 cerchio per tocco - effetto più realistico
    // Con leggera variazione per sembrare naturale
    const radius = baseRadius + (Math.random() - 0.5) * 3;
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Update progress periodically (ogni ~8% dei movimenti)
    if (Math.random() < 0.08) {
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
      
      // Parse result - LEGGI CAMPI CORRETTI DAL SERVER
      const rewardType = data.reward_type || 'm1u';
      const rewardValue = data.reward_value || 0;
      const clueText = data.clue_text || null;
      
      console.log('🎰 Reveal result:', { rewardType, rewardValue, clueText, fullData: data });
      
      // GENERA LA GRIGLIA REALE con 3 premi vincenti uguali
      const revealedGrid = generateRevealedGrid(rewardType, rewardValue);
      setGridSymbols(revealedGrid);
      
      setResult({
        rewardType,
        rewardValue,
        isJackpot: data.is_jackpot || rewardValue >= config.maxJackpot,
        clueText: clueText,
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
      if (rewardType === 'm1u' && rewardValue > 0) {
        // Fire confetti for wins
        if (rewardValue >= config.maxJackpot) {
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
            description: `Hai vinto ${rewardValue.toLocaleString()} M1U!`,
            duration: 10000,
          });
          
        } else if (rewardValue >= 100) {
          // Big win confetti
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
          });
          toast.success('🎉 HAI VINTO!', {
            description: `+${rewardValue.toLocaleString()} M1U`,
          });
        } else {
          // Small win confetti
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
          });
          toast.success('💰 Hai vinto!', {
            description: `+${rewardValue.toLocaleString()} M1U`,
          });
        }
        
        // Trigger M1U Pill slot machine animation
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('m1u-credited', { 
            detail: { amount: rewardValue } 
          }));
        }, 1500);
        
      } else if (rewardType === 'clue') {
        // HAI VINTO UN INDIZIO! 
        confetti({
          particleCount: 30,
          spread: 50,
          colors: ['#00BFFF', '#1E90FF', '#4169E1'],
        });
        
        const clueMessage = clueText || 'Hai trovato un indizio! Controlla le notifiche.';
        
        toast.success('🔍 Hai vinto un INDIZIO!', {
          description: clueMessage,
          duration: 8000,
        });
        
        // Save to notifications
        if (addNotification && clueText) {
          addNotification({
            title: '🔍 Nuovo indizio sbloccato!',
            description: clueText,
          });
        }
      } else {
        // Questo NON dovrebbe MAI accadere - tutti i ticket hanno un premio!
        console.error('⚠️ Unexpected result - no reward type matched:', { rewardType, rewardValue, clueText, fullData: data });
        toast.info('Risultato in elaborazione...', {
          description: 'Controlla il tuo saldo M1U',
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
          {/* Ticket container - SIMPLE layout, image determines size */}
          <div 
            ref={ticketRef}
            className="relative"
            style={{ 
              maxWidth: '380px',
              maxHeight: 'calc(100vh - 200px)',
            }}
          >
            {/* Ticket image - determines container size */}
            <img
              src={config.image}
              alt={`Scratch ticket ${tier} M1U`}
              className="w-auto h-auto max-w-full rounded-lg shadow-2xl"
              style={{ 
                maxHeight: 'calc(100vh - 200px)',
                boxShadow: `0 0 60px ${config.color}50`,
              }}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                console.error('Failed to load scratch image');
                setImageLoaded(true);
              }}
            />
            
            {/* Scratch area overlay - positioned over 12 rectangles */}
            {imageLoaded && (
              <div
                ref={containerRef}
                className="absolute overflow-hidden rounded-sm"
                style={{
                  top: `${GRID_TOP_PERCENT}%`,
                  left: `${GRID_LEFT_PERCENT}%`,
                  width: `${GRID_RIGHT_PERCENT - GRID_LEFT_PERCENT}%`,
                  height: `${GRID_BOTTOM_PERCENT - GRID_TOP_PERCENT}%`,
                }}
              >
                {/* ═══════════════════════════════════════════════════════════════
                    UX FIX: PRE-REVEAL = TEXTURE SCURA, POST-REVEAL = SIMBOLI
                    ═══════════════════════════════════════════════════════════════ */}
                <div 
                  className="absolute inset-0 grid gap-0.5 p-0.5"
                  style={{ 
                    gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
                    gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
                  }}
                >
                  {/* PRE-REVEAL: Solo celle scure (nessun simbolo fake) */}
                  {gridSymbols.length === 0 && Array.from({ length: 12 }).map((_, index) => (
                    <div
                      key={`empty-${index}`}
                      className="flex items-center justify-center rounded"
                      style={{
                        background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
                      }}
                    />
                  ))}
                  
                  {/* POST-REVEAL: Simboli reali con animazione */}
                  {gridSymbols.length > 0 && gridSymbols.map((symbol, index) => {
                    const isPerso = symbol === 'PERSO' || symbol === 'X' || symbol === 'RIPROVA' || symbol === '?';
                    const isIndizio = symbol === 'INDIZIO';
                    const isM1U = symbol.includes('M1U');
                    
                    let bgColor = 'bg-gray-800/90';
                    let textColor = 'text-white';
                    let fontSize = '0.55rem';
                    let glow = 'none';
                    
                    if (isPerso) {
                      bgColor = 'bg-red-900/80';
                      textColor = 'text-red-300';
                      fontSize = '0.5rem';
                    } else if (isIndizio) {
                      bgColor = 'bg-cyan-700/90';
                      textColor = 'text-cyan-200';
                      fontSize = '0.45rem';
                      glow = '0 0 12px rgba(0,255,255,0.6)';
                    } else if (isM1U) {
                      bgColor = 'bg-yellow-700/90';
                      textColor = 'text-yellow-200';
                      fontSize = '0.45rem';
                      glow = '0 0 12px rgba(255,215,0,0.8)';
                    }
                    
                    return (
                      <motion.div
                        key={index}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ 
                          delay: index * 0.03, 
                          type: 'spring',
                          stiffness: 300,
                          damping: 20
                        }}
                        className={`flex items-center justify-center ${bgColor} rounded border border-white/20 ${textColor}`}
                        style={{
                          fontSize,
                          fontWeight: 'bold',
                          textShadow: glow,
                          lineHeight: 1.1,
                          textAlign: 'center',
                          padding: '2px',
                        }}
                      >
                        {symbol}
                      </motion.div>
                    );
                  })}
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
            
            {/* Result overlay - mostra i 3 SIMBOLI VINCENTI + premio */}
            {isRevealed && result && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-lg z-10">
                {result.rewardType === 'm1u' && result.rewardValue > 0 ? (
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center px-4"
                  >
                    {result.isJackpot && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        className="text-3xl mb-2"
                      >
                        🎰 JACKPOT! 🎰
                      </motion.div>
                    )}
                    
                    {/* 3 SIMBOLI VINCENTI */}
                    <div className="flex justify-center gap-2 mb-3">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.1 * i, type: 'spring' }}
                          className="w-16 h-12 flex items-center justify-center bg-yellow-700/90 rounded border-2 border-yellow-400 text-yellow-200 font-bold text-xs"
                          style={{ textShadow: '0 0 10px rgba(255,215,0,0.8)' }}
                        >
                          {result.rewardValue} M1U
                        </motion.div>
                      ))}
                    </div>
                    
                    <motion.div 
                      className={`text-5xl font-black bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      +{result.rewardValue.toLocaleString()}
                    </motion.div>
                    <div className="text-xl text-white font-bold mt-1">M1U</div>
                    <Sparkles className="w-6 h-6 mx-auto mt-2" style={{ color: config.color }} />
                  </motion.div>
                ) : result.rewardType === 'clue' ? (
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-center px-4"
                  >
                    {/* 3 SIMBOLI INDIZIO */}
                    <div className="flex justify-center gap-2 mb-3">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.1 * i, type: 'spring' }}
                          className="w-16 h-12 flex items-center justify-center bg-cyan-700/90 rounded border-2 border-cyan-400 text-cyan-200 font-bold text-xs"
                          style={{ textShadow: '0 0 8px rgba(0,255,255,0.6)' }}
                        >
                          INDIZIO
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="text-4xl mb-2">🔍</div>
                    <div className="text-xl font-bold text-white mb-2">HAI VINTO UN INDIZIO!</div>
                    {result.clueText && (
                      <p className="text-white/80 text-sm italic max-w-xs mx-auto">"{result.clueText}"</p>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-center px-6"
                  >
                    <div className="text-5xl mb-4">😔</div>
                    <div className="text-xl font-bold text-white/80">Nessuna vincita</div>
                    <p className="text-white/60 mt-2 text-sm">Ritenta!</p>
                  </motion.div>
                )}
              </div>
            )}
          </div> {/* End ticket container */}
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
