// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Text-to-Speech Hook - ElevenLabs TTS with ROBUST iOS audio support

import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TTSOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: 'rachel' | 'domi' | 'bella' | 'antoni' | 'josh' | 'arnold' | 'adam' | 'sam' | 'callum';
  useCloud?: boolean;
  onEnd?: () => void;
  onStart?: () => void;
  onError?: (error: Error) => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🍎 iOS AUDIO UNLOCK SYSTEM - Singleton Pattern
// iOS Safari requires user gesture to play audio. We create a SINGLE persistent
// audio element that gets "unlocked" on first touch and reused for all playback.
// ═══════════════════════════════════════════════════════════════════════════════

// Global singleton audio element - shared across all hook instances
let globalAudioElement: HTMLAudioElement | null = null;
let isGlobalAudioUnlocked = false;
let audioContextUnlocked = false;

// Create the global audio element once
const getGlobalAudioElement = (): HTMLAudioElement => {
  if (!globalAudioElement) {
    globalAudioElement = document.createElement('audio');
    globalAudioElement.playsInline = true;
    (globalAudioElement as any).webkitPlaysinline = true;
    globalAudioElement.preload = 'auto';
    // Don't append to DOM - keep it hidden
    console.log('[TTS] 🔊 Global audio element created');
  }
  return globalAudioElement;
};

// Unlock audio on first user interaction
const setupiOSUnlock = () => {
  if (isGlobalAudioUnlocked) return;
  
  const audio = getGlobalAudioElement();
  
  // Silent MP3 (minimal valid MP3 file - ~1ms of silence)
  const silentMp3 = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYoRwmHAAAAAAD/+1DEAAAGAAGn9AAAIgAANP8AAABMQVNFKDM0ODM0NSlNAAAATkVXUwAAAABMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tQxBgAAADSAAAAAAAAANIAAAAA';
  
  const unlockHandler = async () => {
    if (isGlobalAudioUnlocked) return;
    
    try {
      // Set silent source
      audio.src = silentMp3;
      audio.volume = 0.01;
      
      // Play silent audio to unlock
      await audio.play();
      audio.pause();
      audio.currentTime = 0;
      
      isGlobalAudioUnlocked = true;
      console.log('[TTS] 🔓 iOS audio UNLOCKED via user gesture');
      
      // Remove listeners after successful unlock
      ['touchstart', 'touchend', 'click', 'keydown'].forEach(evt => {
        document.removeEventListener(evt, unlockHandler, true);
      });
      
    } catch (e) {
      console.log('[TTS] 🔒 Unlock attempt failed, will retry on next interaction');
    }
  };
  
  // Try to unlock immediately (works on desktop)
  unlockHandler();
  
  // Also listen for user interactions on mobile
  ['touchstart', 'touchend', 'click', 'keydown'].forEach(evt => {
    document.addEventListener(evt, unlockHandler, { capture: true, passive: true });
  });
};

// Initialize on module load
if (typeof window !== 'undefined') {
  setupiOSUnlock();
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOOK IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════════

export const useTTS = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const currentAudioUrlRef = useRef<string | null>(null);
  const isSupported = typeof window !== 'undefined';

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up blob URL if any
      if (currentAudioUrlRef.current) {
        URL.revokeObjectURL(currentAudioUrlRef.current);
        currentAudioUrlRef.current = null;
      }
    };
  }, []);

  // Play audio using the global element (already unlocked on iOS)
  const playAudioBlob = useCallback(async (
    audioBlob: Blob, 
    onStart?: () => void, 
    onEnd?: () => void,
    onError?: (error: Error) => void
  ): Promise<boolean> => {
    const audio = getGlobalAudioElement();
    
    // Clean up previous audio URL
    if (currentAudioUrlRef.current) {
      URL.revokeObjectURL(currentAudioUrlRef.current);
    }
    
    // Create new blob URL
    const audioUrl = URL.createObjectURL(audioBlob);
    currentAudioUrlRef.current = audioUrl;
    
    return new Promise((resolve) => {
      // Set up event handlers BEFORE setting src
      const handlePlay = () => {
        console.log('[TTS] 🔊 Audio playback STARTED');
        setIsSpeaking(true);
        setIsLoading(false);
        onStart?.();
      };
      
      const handleEnded = () => {
        console.log('[TTS] ✅ Audio playback ENDED');
        setIsSpeaking(false);
        cleanup();
        onEnd?.();
        resolve(true);
      };
      
      const handleError = (e: Event) => {
        console.error('[TTS] ❌ Audio playback ERROR:', e);
        setIsSpeaking(false);
        setIsLoading(false);
        cleanup();
        onError?.(new Error('Audio playback failed'));
        resolve(false);
      };
      
      const cleanup = () => {
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        if (currentAudioUrlRef.current) {
          URL.revokeObjectURL(currentAudioUrlRef.current);
          currentAudioUrlRef.current = null;
        }
      };
      
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);
      
      // Set source and play
      audio.src = audioUrl;
      audio.volume = 1.0;
      
      // Try to play
      audio.play()
        .then(() => {
          console.log('[TTS] ▶️ audio.play() promise resolved');
        })
        .catch((error) => {
          console.error('[TTS] ❌ audio.play() failed:', error?.name, error?.message);
          
          // If NotAllowedError, the audio isn't unlocked yet
          if (error?.name === 'NotAllowedError') {
            console.log('[TTS] 🔒 Audio blocked - waiting for user interaction...');
            
            // Set up one-time listener to retry on next interaction
            const retryOnInteraction = () => {
              console.log('[TTS] 🔄 Retrying play after user interaction...');
              audio.play()
                .then(() => console.log('[TTS] ✅ Retry successful'))
                .catch(e => {
                  console.error('[TTS] ❌ Retry failed:', e);
                  cleanup();
                  onEnd?.();
                  resolve(false);
                });
            };
            
            // Listen for next touch/click
            const events = ['touchstart', 'click'];
            events.forEach(evt => {
              document.addEventListener(evt, retryOnInteraction, { once: true, capture: true });
            });
            
            // Timeout after 8 seconds
            setTimeout(() => {
              events.forEach(evt => {
                document.removeEventListener(evt, retryOnInteraction, true);
              });
              if (!isSpeaking) {
                cleanup();
                onEnd?.();
                resolve(false);
              }
            }, 8000);
          } else {
            cleanup();
            onError?.(error);
            resolve(false);
          }
        });
    });
  }, [isSpeaking]);

  // ElevenLabs TTS
  const speakWithElevenLabs = useCallback(async (text: string, options: TTSOptions = {}) => {
    const { voice = 'callum', onEnd, onStart, onError } = options;

    setIsLoading(true);

    try {
      console.log('[TTS] 📡 Calling ElevenLabs API...');
      
      const { data, error } = await supabase.functions.invoke('tts-elevenlabs', {
        body: { text, voice }
      });

      if (error || !data?.audio) {
        throw new Error(error?.message || 'TTS API failed');
      }

      console.log('[TTS] ✅ ElevenLabs response received');

      // Convert base64 to blob
      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.audio), c => c.charCodeAt(0))],
        { type: 'audio/mp3' }
      );

      // Play using global audio element
      const success = await playAudioBlob(audioBlob, onStart, onEnd, onError);
      
      if (!success) {
        console.warn('[TTS] ⚠️ First play attempt failed, retrying API...');
        
        // Retry API call and play
        setTimeout(async () => {
          try {
            const { data: retryData, error: retryError } = await supabase.functions.invoke('tts-elevenlabs', {
              body: { text, voice }
            });
            
            if (!retryError && retryData?.audio) {
              const retryBlob = new Blob(
                [Uint8Array.from(atob(retryData.audio), c => c.charCodeAt(0))],
                { type: 'audio/mp3' }
              );
              await playAudioBlob(retryBlob, onStart, onEnd, onError);
            } else {
              onEnd?.();
            }
          } catch (e) {
            console.error('[TTS] ❌ Retry failed:', e);
            onEnd?.();
          }
        }, 500);
      }

    } catch (error) {
      console.error('[TTS] ❌ ElevenLabs error:', error);
      setIsLoading(false);
      setIsSpeaking(false);
      onError?.(error as Error);
      onEnd?.();
    }
  }, [playAudioBlob]);

  // Main speak function - ALWAYS uses ElevenLabs Callum voice
  const speak = useCallback((text: string, options: TTSOptions = {}) => {
    const forcedOptions = { ...options, voice: 'callum' as const };
    speakWithElevenLabs(text, forcedOptions);
  }, [speakWithElevenLabs]);

  const stop = useCallback(() => {
    const audio = getGlobalAudioElement();
    audio.pause();
    audio.currentTime = 0;
    
    if (currentAudioUrlRef.current) {
      URL.revokeObjectURL(currentAudioUrlRef.current);
      currentAudioUrlRef.current = null;
    }
    
    setIsSpeaking(false);
    setIsPaused(false);
    setIsLoading(false);
  }, []);

  const pause = useCallback(() => {
    const audio = getGlobalAudioElement();
    if (isSpeaking) {
      audio.pause();
      setIsPaused(true);
    }
  }, [isSpeaking]);

  const resume = useCallback(() => {
    const audio = getGlobalAudioElement();
    if (isPaused) {
      audio.play().catch(console.error);
      setIsPaused(false);
    }
  }, [isPaused]);

  // Manual unlock function (can be called on button click)
  const unlockAudio = useCallback(async (): Promise<boolean> => {
    if (isGlobalAudioUnlocked) return true;
    
    const audio = getGlobalAudioElement();
    const silentMp3 = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYoRwmHAAAAAAD/+1DEAAAGAAGn9AAAIgAANP8AAABMQVNFKDM0ODM0NSlNAAAATkVXUwAAAABMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tQxBgAAADSAAAAAAAAANIAAAAA';
    
    try {
      audio.src = silentMp3;
      audio.volume = 0.01;
      await audio.play();
      audio.pause();
      audio.currentTime = 0;
      isGlobalAudioUnlocked = true;
      console.log('[TTS] 🔓 Audio manually unlocked');
      return true;
    } catch (e) {
      console.error('[TTS] ❌ Manual unlock failed:', e);
      return false;
    }
  }, []);

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isPaused,
    isLoading,
    isSupported,
    unlockAudio,
    isAudioUnlocked: () => isGlobalAudioUnlocked
  };
};

export default useTTS;
