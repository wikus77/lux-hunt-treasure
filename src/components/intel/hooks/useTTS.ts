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
      // NO fallback to browser - only use ElevenLabs
      options.onError?.(error as Error);
      options.onEnd?.(); // Signal end so UI doesn't hang
    }
  }, []);

  // Browser TTS (fallback)
  const speakWithBrowser = useCallback((text: string, options: TTSOptions = {}) => {
    if (!isSupported) {
      console.warn('[TTS] Speech synthesis not supported');
      return;
    }

    const {
      lang = 'it-IT',
      rate = 0.95,
      pitch = 1.0,
      volume = 1.0,
      onEnd,
      onStart,
      onError
    } = options;

    window.speechSynthesis.cancel();

    const normalizedText = normalizeForSpeech(text);
    const utterance = new SpeechSynthesisUtterance(normalizedText);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    // Get best Italian voice
    const voices = window.speechSynthesis.getVoices();
    const italianVoice = voices.find(v => v.lang.startsWith('it'));
    if (italianVoice) {
      utterance.voice = italianVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      onStart?.();
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      onEnd?.();
    };

    utterance.onerror = (event) => {
      setIsSpeaking(false);
      setIsPaused(false);
      onError?.(new Error(event.error));
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported]);

  // Main speak function
  const speak = useCallback((text: string, options: TTSOptions = {}) => {
    const { useCloud = true } = options;

    if (useCloud) {
      // Usa ElevenLabs TTS (voce naturale)
      speakWithElevenLabs(text, options);
    } else {
      speakWithBrowser(text, options);
    }
  }, [speakWithElevenLabs, speakWithBrowser]);

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
