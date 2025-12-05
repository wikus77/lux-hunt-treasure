// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Global Glitch System - Real-time broadcast to ALL users

import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// TV Shutdown Effect - più realistico
function triggerTVShutdownEffect() {
  console.log('[Global Glitch] TV Shutdown Effect triggered');

  // Create overlay container
  const overlay = document.createElement('div');
  overlay.id = 'glitch-tv-shutdown';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 999999;
    pointer-events: none;
    background: transparent;
  `;
  document.body.appendChild(overlay);

  // Phase 1: Glitch/interference (0-2s)
  const glitchPhase = () => {
    document.body.style.animation = 'tvGlitch 0.1s steps(2) infinite';
    document.body.style.filter = 'contrast(1.2) brightness(0.9)';
    
    // Add scanlines
    const scanlines = document.createElement('div');
    scanlines.className = 'glitch-scanlines';
    scanlines.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: repeating-linear-gradient(
        0deg,
        rgba(0, 0, 0, 0.2) 0px,
        rgba(0, 0, 0, 0.2) 1px,
        transparent 1px,
        transparent 3px
      );
      animation: scanlineRoll 0.5s linear infinite;
    `;
    overlay.appendChild(scanlines);

    // Add random glitch bars
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const bar = document.createElement('div');
        bar.style.cssText = `
          position: absolute;
          left: 0;
          right: 0;
          height: ${Math.random() * 30 + 10}px;
          top: ${Math.random() * 100}%;
          background: rgba(255, 255, 255, ${Math.random() * 0.3});
          transform: translateX(${(Math.random() - 0.5) * 20}px);
        `;
        overlay.appendChild(bar);
        setTimeout(() => bar.remove(), 100);
      }, i * 200);
    }
  };

  // Phase 2: CRT Shutdown Effect (~1 second total)
  const crtShutdownPhase = () => {
    document.body.style.animation = 'none';
    document.body.style.filter = '';
    
    // Clear overlay and set black background
    overlay.innerHTML = '';
    overlay.style.background = 'black';
    
    // Create the screen content that will be "crushed"
    const crtScreen = document.createElement('div');
    crtScreen.style.cssText = `
      position: absolute;
      left: 0;
      width: 100%;
      top: 0;
      height: 100%;
      background: linear-gradient(180deg, rgba(0,209,255,0.1) 0%, rgba(255,255,255,0.9) 50%, rgba(0,209,255,0.1) 100%);
      transition: top 0.4s cubic-bezier(0.4, 0, 0.2, 1), height 0.4s cubic-bezier(0.4, 0, 0.2, 1), background 0.4s ease;
      box-shadow: 0 0 30px rgba(0,209,255,0.5);
    `;
    overlay.appendChild(crtScreen);

    // Step 1: Vertical crush → horizontal line at center (0-400ms)
    requestAnimationFrame(() => {
      crtScreen.style.top = 'calc(50% - 2px)';
      crtScreen.style.height = '4px';
      crtScreen.style.background = 'linear-gradient(90deg, rgba(0,209,255,0.5) 0%, white 50%, rgba(0,209,255,0.5) 100%)';
      crtScreen.style.boxShadow = '0 0 20px rgba(0,209,255,0.8), 0 0 40px rgba(0,209,255,0.4), 0 0 60px rgba(255,255,255,0.3)';
    });

    // Step 2: Horizontal crush from BOTH sides → center dot (400-750ms)
    setTimeout(() => {
      crtScreen.style.transition = 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)';
      crtScreen.style.left = 'calc(50% - 5px)';
      crtScreen.style.width = '10px';
      crtScreen.style.top = 'calc(50% - 5px)';
      crtScreen.style.height = '10px';
      crtScreen.style.borderRadius = '50%';
      crtScreen.style.background = 'white';
      crtScreen.style.boxShadow = '0 0 20px white, 0 0 40px rgba(0,209,255,1), 0 0 60px rgba(0,209,255,0.6)';
    }, 420);

    // Step 3: Spectacular glow pulse (750-950ms)
    setTimeout(() => {
      crtScreen.style.transition = 'all 0.2s ease-out';
      crtScreen.style.transform = 'scale(2)';
      crtScreen.style.boxShadow = '0 0 40px white, 0 0 80px rgba(0,209,255,1), 0 0 120px rgba(0,209,255,0.8), 0 0 160px rgba(255,255,255,0.4)';
    }, 780);

    // Step 4: Fade to nothing (950-1100ms)
    setTimeout(() => {
      crtScreen.style.transition = 'all 0.15s ease-in';
      crtScreen.style.transform = 'scale(0)';
      crtScreen.style.opacity = '0';
      crtScreen.style.boxShadow = '0 0 0 transparent';
    }, 950);
  };

  // Phase 3: Black screen hold
  const blackScreenPhase = () => {
    overlay.innerHTML = '';
    overlay.style.background = 'black';
  };

  // Phase 4: Fade back to app
  const fadeBackPhase = () => {
    overlay.style.transition = 'opacity 0.3s ease-out';
    overlay.style.opacity = '0';
  };

  // Phase 5: Cleanup
  const cleanupPhase = () => {
    document.body.style.animation = '';
    document.body.style.filter = '';
    overlay.remove();
    console.log('[Global Glitch] Effect completed');
  };

  // Add keyframes
  const style = document.createElement('style');
  style.id = 'glitch-keyframes';
  style.textContent = `
    @keyframes tvGlitch {
      0%, 100% { transform: translate(0, 0) skew(0deg); filter: hue-rotate(0deg); }
      20% { transform: translate(-2px, 1px) skew(0.5deg); filter: hue-rotate(90deg); }
      40% { transform: translate(2px, -1px) skew(-0.5deg); filter: hue-rotate(180deg); }
      60% { transform: translate(-1px, 2px) skew(0.3deg); filter: hue-rotate(270deg); }
      80% { transform: translate(1px, -2px) skew(-0.3deg); filter: hue-rotate(360deg); }
    }
    @keyframes scanlineRoll {
      0% { transform: translateY(0); }
      100% { transform: translateY(6px); }
    }
  `;
  document.head.appendChild(style);

  // Execute phases - CRT TV shutdown style
  glitchPhase();                           // 0-2s: Glitch interference (unchanged)
  setTimeout(crtShutdownPhase, 2000);      // 2-3s: CRT shutdown (~1s)
  setTimeout(blackScreenPhase, 3100);      // 3.1s: Black screen hold
  setTimeout(fadeBackPhase, 3400);         // 3.4s: Fade back to app
  setTimeout(cleanupPhase, 3700);          // 3.7s: Cleanup
  setTimeout(() => {
    const styleEl = document.getElementById('glitch-keyframes');
    if (styleEl) styleEl.remove();
  }, 3800);
}

// Hook per ascoltare i broadcast di glitch (TUTTI gli utenti)
export function useGlobalGlitchListener() {
  useEffect(() => {
    console.log('[Global Glitch] Listener initialized');

    // Subscribe to realtime broadcast channel
    const channel = supabase
      .channel('global-glitch')
      .on('broadcast', { event: 'glitch' }, (payload) => {
        console.log('[Global Glitch] Received broadcast:', payload);
        triggerTVShutdownEffect();
      })
      .subscribe((status) => {
        console.log('[Global Glitch] Channel status:', status);
      });

    return () => {
      console.log('[Global Glitch] Unsubscribing');
      supabase.removeChannel(channel);
    };
  }, []);
}

// Funzione per inviare il broadcast (SOLO ADMIN)
export async function broadcastGlobalGlitch(): Promise<boolean> {
  console.log('[Global Glitch] Broadcasting to all users...');
  
  try {
    const channel = supabase.channel('global-glitch');
    
    await channel.subscribe();
    
    await channel.send({
      type: 'broadcast',
      event: 'glitch',
      payload: { 
        timestamp: Date.now(),
        type: 'tv-shutdown'
      }
    });

    console.log('[Global Glitch] Broadcast sent successfully');
    
    // Also trigger locally for the admin
    triggerTVShutdownEffect();
    
    // Cleanup channel after sending
    setTimeout(() => {
      supabase.removeChannel(channel);
    }, 1000);

    return true;
  } catch (error) {
    console.error('[Global Glitch] Broadcast failed:', error);
    return false;
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

