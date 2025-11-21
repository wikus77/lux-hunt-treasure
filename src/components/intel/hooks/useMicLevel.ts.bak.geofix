// © 2025 Joseph MULÉ – M1SSION™ - Microphone Audio Level Hook
import { useState, useEffect, useRef } from 'react';

export const useMicLevel = (enabled: boolean = false) => {
  const [level, setLevel] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      cleanup();
      return;
    }

    const setupMic = async () => {
      try {
        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
        
        streamRef.current = stream;
        setHasPermission(true);
        setError(null);

        // Create audio context and analyser
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.8;
        analyserRef.current = analyser;

        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        // Start analyzing audio level
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateLevel = () => {
          if (!analyserRef.current) return;
          
          analyserRef.current.getByteFrequencyData(dataArray);
          
          // Calculate RMS (Root Mean Square) for more accurate level
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += (dataArray[i] / 255) ** 2;
          }
          const rms = Math.sqrt(sum / bufferLength);
          
          // Clamp and normalize to 0-1 range
          const normalizedLevel = Math.min(1, Math.max(0, rms * 2));
          setLevel(normalizedLevel);

          animationFrameRef.current = requestAnimationFrame(updateLevel);
        };

        updateLevel();
      } catch (err) {
        console.error('Microphone access error:', err);
        setHasPermission(false);
        setError(err instanceof Error ? err.message : 'Microphone access denied');
      }
    };

    setupMic();

    return () => cleanup();
  }, [enabled]);

  const cleanup = () => {
    // Stop animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Stop audio tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    setLevel(0);
  };

  return { level, hasPermission, error };
};
