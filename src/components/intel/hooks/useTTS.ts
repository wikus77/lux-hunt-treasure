// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Text-to-Speech Hook - OpenAI TTS with browser fallback

import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TTSOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  // Voci ElevenLabs (multilingual, supportano italiano)
  voice?: 'rachel' | 'domi' | 'bella' | 'antoni' | 'josh' | 'arnold' | 'adam' | 'sam' | 'callum';
  useCloud?: boolean;  // Usa ElevenLabs cloud TTS
  onEnd?: () => void;
  onStart?: () => void;
  onError?: (error: Error) => void;
}

// Normalizza il testo per una pronuncia corretta e naturale
function normalizeForSpeech(text: string): string {
  return text
    .replace(/M1SSION/gi, 'Mission')
    .replace(/m1ssion/gi, 'mission')
    // AION -> "Ayon" suona naturale in italiano
    .replace(/A\.I\.O\.N\./gi, 'Ayon')
    .replace(/\bAION\b/gi, 'Ayon')
    .replace(/\baion\b/gi, 'Ayon')
    .replace(/\bION\b/g, 'Ayon')
    // M1U
    .replace(/M1U/gi, 'emme uno u')
    .replace(/[™®©]/g, '')
    .trim();
}

export const useTTS = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  // ElevenLabs TTS (voce naturale, qualità eccellente)
  const speakWithElevenLabs = useCallback(async (text: string, options: TTSOptions = {}) => {
    const { voice = 'rachel', onEnd, onStart, onError } = options;

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('tts-elevenlabs', {
        body: { text, voice }
      });

      if (error || !data?.audio) {
        throw new Error(error?.message || 'TTS failed');
      }

      // Create audio from base64
      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.audio), c => c.charCodeAt(0))],
        { type: 'audio/mp3' }
      );
      const audioUrl = URL.createObjectURL(audioBlob);

      // Play audio
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsSpeaking(true);
        setIsLoading(false);
        onStart?.();
      };

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        onEnd?.();
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        setIsLoading(false);
        URL.revokeObjectURL(audioUrl);
        onError?.(new Error('Audio playback failed'));
      };

      await audio.play();

    } catch (error) {
      console.error('[TTS] ElevenLabs error:', error);
      setIsLoading(false);
      setIsSpeaking(false);
      
      // 🔄 RETRY once after 500ms if ElevenLabs fails
      console.log('[TTS] Retrying ElevenLabs in 500ms...');
      setTimeout(async () => {
        try {
          const { data: retryData, error: retryError } = await supabase.functions.invoke('tts-elevenlabs', {
            body: { text, voice }
          });
          
          if (retryError || !retryData?.audio) {
            console.error('[TTS] Retry also failed');
            options.onEnd?.();
            return;
          }
          
          const audioBlob = new Blob(
            [Uint8Array.from(atob(retryData.audio), c => c.charCodeAt(0))],
            { type: 'audio/mp3' }
          );
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          audioRef.current = audio;
          
          audio.onplay = () => { setIsSpeaking(true); onStart?.(); };
          audio.onended = () => { setIsSpeaking(false); URL.revokeObjectURL(audioUrl); onEnd?.(); };
          audio.onerror = () => { setIsSpeaking(false); URL.revokeObjectURL(audioUrl); onEnd?.(); };
          
          await audio.play();
        } catch (retryErr) {
          console.error('[TTS] Retry failed:', retryErr);
          options.onEnd?.();
        }
      }, 500);
    }
  }, []);

  // Main speak function - ALWAYS uses ElevenLabs Callum voice
  const speak = useCallback((text: string, options: TTSOptions = {}) => {
    // Force Callum voice always
    const forcedOptions = { ...options, voice: 'callum' as const };
    speakWithElevenLabs(text, forcedOptions);
  }, [speakWithElevenLabs]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (isSupported) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
    setIsLoading(false);
  }, [isSupported]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPaused(true);
    } else if (isSupported && isSpeaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isSupported, isSpeaking]);

  const resume = useCallback(() => {
    if (audioRef.current && isPaused) {
      audioRef.current.play();
      setIsPaused(false);
    } else if (isSupported && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isSupported, isPaused]);

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isPaused,
    isLoading,
    isSupported
  };
};

export default useTTS;
