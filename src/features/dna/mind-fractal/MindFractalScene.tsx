/**
 * © 2025 Joseph MULÉ – M1SSION™ – Mind Fractal Scene
 */

import React, { useEffect, useRef, useState } from 'react';
import { initRenderer, renderFrame, cleanupRenderer, resizeRenderer, setDebugOptions } from './canvas/renderer';
import { useMindFractalGame } from './logic/useMindFractalGame';
import { AudioEngine } from './audio/AudioEngine';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

export const MindFractalScene: React.FC = () => {
  const { getCurrentUser } = useUnifiedAuth();
  const user = getCurrentUser();
  const userId = user?.id || '';
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioEngineRef = useRef<AudioEngine | null>(null);
  const animationFrameRef = useRef<number>();
  const [isWebGL2Available, setIsWebGL2Available] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [errorOverlay, setErrorOverlay] = useState<string | null>(null);
  const [failoverApplied, setFailoverApplied] = useState(false);
  const firstPresentedRef = useRef(false);
  const watchdogRef = useRef<number | null>(null);
  const failoverTimerRef = useRef<number | null>(null);

  const {
    gameState,
    handleTap,
    handleOrbit,
    handlePinch,
    reset
  } = useMindFractalGame(userId);

  // Use ref to avoid re-init loop
  const gameRef = useRef(gameState);
  
  // Sync gameRef with gameState without triggering re-init
  useEffect(() => {
    gameRef.current = gameState;
  }, [gameState]);

  // Initialize once on mount
  useEffect(() => {
    console.log('[MF] init');
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('[MF] Canvas ref not available');
      return;
    }

    // Check WebGL2 support
    const gl = canvas.getContext('webgl2');
    if (!gl) {
      console.error('[MF] WebGL2 not supported');
      setIsWebGL2Available(false);
      setIsLoading(false);
      window.dispatchEvent(new CustomEvent('mindfractal:error', { 
        detail: { reason: 'WebGL2 not supported' } 
      }));
      return;
    }

    // Log GL capabilities
    console.log('[MF] caps', {
      version: gl.getParameter(gl.VERSION),
      shadingLanguage: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxRenderbufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
      maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
      maxTextureImageUnits: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS)
    });

    console.log('[MF] canvas dimensions', {
      clientWidth: canvas.clientWidth,
      clientHeight: canvas.clientHeight,
      dpr: window.devicePixelRatio
    });

    // Initialize renderer
    const renderer = initRenderer(canvas);
    if (!renderer) {
      console.error('[MF] Failed to initialize renderer');
      setIsWebGL2Available(false);
      setIsLoading(false);
      window.dispatchEvent(new CustomEvent('mindfractal:error', { 
        detail: { reason: 'Renderer initialization failed' } 
      }));
      return;
    }

    // Initialize audio (non-blocking)
    audioEngineRef.current = new AudioEngine();
    audioEngineRef.current.init()
      .catch((err) => {
        console.warn('[MF] Audio init skipped (autoplay policy):', err.message);
      })
      .then(() => {
        if (audioEngineRef.current) {
          console.log('[MF] Audio engine ready');
        }
      });

    // Frame counter for stats
    let frameCount = 0;
    let lastStatsTime = performance.now();

    // Animation loop - reads gameRef.current without re-creating
    const animate = (time: number) => {
      const currentGame = gameRef.current;
      
      try {
        renderFrame(renderer, {
          time: time * 0.001,
          seed: currentGame.seed,
          connections: currentGame.connections,
          moves: currentGame.moves
        });

        frameCount++;

        // Hide loading and dispatch ready event after first successful frame
        if (frameCount === 1) {
          setIsLoading(false);
          window.dispatchEvent(new CustomEvent('mindfractal:ready'));
          console.log('[MF] First frame rendered, ready');
        }

        // Log stats every 60 frames
        if (frameCount % 60 === 0) {
          const now = performance.now();
          const elapsed = now - lastStatsTime;
          const fps = Math.round((60 * 1000) / elapsed);
          console.log('[MF] frame stats', {
            fps,
            frameCount,
            avgFrameMs: (elapsed / 60).toFixed(2)
          });
          lastStatsTime = now;
        }

      } catch (err) {
        console.error('[MF] Render error:', err);
        cancelAnimationFrame(animationFrameRef.current!);
        setIsLoading(false);
        window.dispatchEvent(new CustomEvent('mindfractal:error', { 
          detail: { reason: 'Render loop error', error: err } 
        }));
        return;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    console.log('[MF] raf start');
    animationFrameRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      console.log('[MF] cleanup');
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      cleanupRenderer();
      audioEngineRef.current?.destroy();
    };
  }, []); // Only run once on mount

  // Watchdog + failover + overlay/events
  useEffect(() => {
    const onReady = () => {
      firstPresentedRef.current = true;
      if (watchdogRef.current) window.clearTimeout(watchdogRef.current);
      if (failoverTimerRef.current) window.clearTimeout(failoverTimerRef.current);
      setIsLoading(false);
    };
    const onError = (e: Event) => {
      if (watchdogRef.current) window.clearTimeout(watchdogRef.current);
      if (failoverTimerRef.current) window.clearTimeout(failoverTimerRef.current);
      setIsLoading(false);
      setErrorOverlay('Mind Fractal: renderer non disponibile su questo dispositivo. Tap per tentare il fallback.');
    };
    const onFailover = () => {
      if (!failoverApplied) {
        setFailoverApplied(true);
        setDebugOptions({ bypassPost: true, reduceMesh: true });
        console.log('[MF] failover: bypassPost=true reduceMesh=true');
        failoverTimerRef.current = window.setTimeout(() => {
          if (!firstPresentedRef.current) {
            window.dispatchEvent(new CustomEvent('mindfractal:error', { detail: { reason: 'failover-timeout' } }));
          }
        }, 1000) as unknown as number;
      }
    };

    window.addEventListener('mindfractal:ready', onReady as any);
    window.addEventListener('mindfractal:error', onError as any);
    window.addEventListener('mindfractal:failover', onFailover as any);

    watchdogRef.current = window.setTimeout(() => {
      if (!firstPresentedRef.current) {
        window.dispatchEvent(new CustomEvent('mindfractal:failover'));
      }
    }, 2000) as unknown as number;

    return () => {
      if (watchdogRef.current) window.clearTimeout(watchdogRef.current);
      if (failoverTimerRef.current) window.clearTimeout(failoverTimerRef.current);
      window.removeEventListener('mindfractal:ready', onReady as any);
      window.removeEventListener('mindfractal:error', onError as any);
      window.removeEventListener('mindfractal:failover', onFailover as any);
    };
  }, [failoverApplied]);

  // Handle interactions
  const handleCanvasClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    handleTap({ x, y });
    audioEngineRef.current?.playPulse();
  };

  const handleOverlayRetry = () => {
    setErrorOverlay(null);
    setDebugOptions({ bypassPost: true, reduceMesh: true });
    failoverTimerRef.current = window.setTimeout(() => {
      if (!firstPresentedRef.current) {
        window.dispatchEvent(new CustomEvent('mindfractal:error', { detail: { reason: 'overlay-retry-timeout' } }));
      }
    }, 1000) as unknown as number;
  };

  if (!isWebGL2Available) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md p-8">
          <h2 className="text-2xl font-bold mb-4">WebGL2 Non Disponibile</h2>
          <p className="text-muted-foreground">
            Il tuo dispositivo non supporta WebGL2. Aggiorna il browser o usa un dispositivo più recente.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0b1021]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground text-lg">Inizializzazione Mind Fractal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0b1021]">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-pointer touch-none"
        onClick={handleCanvasClick}
        style={{ display: 'block' }}
      />

      {errorOverlay && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="text-center max-w-md p-6">
            <p className="text-white mb-4">{errorOverlay}</p>
            <button onClick={handleOverlayRetry} className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-semibold">
              Tenta il fallback
            </button>
          </div>
        </div>
      )}

      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
        <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
          <div className="text-xs text-gray-400 mb-1">SEED</div>
          <div className="text-lg font-mono text-cyan-400">{gameState.seed.toString(16).toUpperCase().slice(0, 8)}</div>
        </div>

        <div className="flex gap-4">
          <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg text-center">
            <div className="text-xs text-gray-400 mb-1">MOSSE</div>
            <div className="text-lg font-bold text-white">{gameState.moves}</div>
          </div>

          <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg text-center">
            <div className="text-xs text-gray-400 mb-1">TEMPO</div>
            <div className="text-lg font-mono text-white">{Math.floor(gameState.timeSpent / 1000)}s</div>
          </div>

          <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg text-center">
            <div className="text-xs text-gray-400 mb-1">COLLEGAMENTI</div>
            <div className="text-lg font-bold text-magenta-400">{gameState.connections}/6</div>
          </div>
        </div>
      </div>

      {/* Victory Banner */}
      {gameState.connections >= 6 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md pointer-events-auto">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-magenta-500 to-orange-400 mb-4 animate-pulse">
              STABILIZZATO!
            </h1>
            <p className="text-xl text-gray-300 mb-6">Flusso sinaptico in equilibrio perfetto</p>
            <div className="text-3xl font-mono text-cyan-400 mb-8">
              Score: {gameState.score}
            </div>
            <button
              onClick={reset}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-magenta-500 text-white font-bold rounded-lg hover:scale-105 transition-transform"
            >
              Nuovo Puzzle
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
