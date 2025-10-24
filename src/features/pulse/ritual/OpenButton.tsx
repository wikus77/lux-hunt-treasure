/**
 * The Pulse™ — OPEN Button (Deep 2.5D with Haptics)
 * Appears at ritual reveal phase; provides haptic feedback and claim action
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

interface OpenButtonProps {
  ritualId: number | null;
  onClaimed: (reward: any) => void;
  mode?: 'prod' | 'test';
}

export function OpenButton({ ritualId, onClaimed, mode = 'prod' }: OpenButtonProps) {
  const { user } = useAuth();
  const [isPressed, setIsPressed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const triggerHaptics = (style: 'heavy' | 'light') => {
    try {
      // Web Vibration API (PWA-compatible)
      if ('vibrate' in navigator) {
        const pattern = style === 'heavy' ? [12] : [6];
        navigator.vibrate(pattern);
      }
      
      // Capacitor Haptics (if available, for native builds)
      // @ts-ignore - Capacitor might not be available in types
      if (typeof window !== 'undefined' && window.Capacitor?.Plugins?.Haptics) {
        // @ts-ignore
        window.Capacitor.Plugins.Haptics.impact({ style: style === 'heavy' ? 'Heavy' : 'Light' });
      }
    } catch (err) {
      console.debug('[Haptics] Not available:', err);
    }
  };

  const handlePress = () => {
    setIsPressed(true);
    triggerHaptics('heavy');
  };

  const handleRelease = () => {
    setIsPressed(false);
    triggerHaptics('light');
  };

  const handleOpen = async () => {
    if (!ritualId || isLoading) return;
    
    setIsLoading(true);
    try {
      if (mode === 'test') {
        // Test mode: fake claim, no DB write
        console.log('[OpenButton Test] Simulating claim...');
        await new Promise(resolve => setTimeout(resolve, 500));
        onClaimed({
          type: 'test_essence',
          message: '🧪 Test Ritual Essence (Sandbox)',
          ritual_id: ritualId
        });
      } else {
        // Production mode: real claim
        if (!user?.id) {
          console.error('[OpenButton] No user ID');
          return;
        }

        const { data, error } = await supabase.rpc('rpc_pulse_ritual_claim', {
          p_user: user.id
        });

        if (error) throw error;

        // Cast to expected response type
        const response = data as { success: boolean; reward_package?: any; error?: string; already_claimed?: boolean };

        if (response?.success) {
          onClaimed(response.reward_package);
        } else {
          console.error('[Ritual] Claim failed:', response?.error);
        }
      }
    } catch (err) {
      console.error('[Ritual] Claim error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        className="relative select-none outline-none group"
        onPointerDown={handlePress}
        onPointerUp={handleRelease}
        onPointerCancel={handleRelease}
        onClick={handleOpen}
        disabled={isLoading}
        aria-label="Open ritual reward"
      >
        {/* Base puck (2.5D disc with depth) */}
        <div
          className={`w-[200px] h-[200px] rounded-full 
                      bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,.18),rgba(0,0,0,.3)_60%)]
                      shadow-[inset_0_12px_24px_rgba(0,0,0,.45)]
                      ring-1 ring-white/10
                      transition-transform duration-150 ease-out will-change-transform
                      ${isPressed ? 'scale-95' : 'scale-100'}
                      ${isLoading ? 'opacity-70 pointer-events-none' : ''}`}
        >
          {/* Energy aura (rotating gradient with breath) */}
          <div className="absolute inset-[-16%] rounded-full pointer-events-none aura-spin" />
          
          {/* Highlight overlay */}
          <div
            className={`absolute inset-0 rounded-full pointer-events-none
                        bg-[radial-gradient(circle_at_40%_30%,rgba(255,255,255,.15),transparent_50%)]
                        transition-opacity duration-150
                        ${isPressed ? 'opacity-50' : 'opacity-100'}`}
          />

          {/* Text */}
          <span
            className="absolute inset-0 grid place-items-center 
                       text-white font-technovier tracking-wide text-xl
                       drop-shadow-[0_0_12px_rgba(0,231,255,.85)]
                       antialiased [text-rendering:optimizeLegibility]"
          >
            {isLoading ? 'OPENING...' : 'OPEN'}
          </span>
        </div>
      </button>

      {/* Micro-copy */}
      <p className="text-white/60 text-sm font-technovier tracking-wide antialiased">
        The world is listening.
      </p>
    </div>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
