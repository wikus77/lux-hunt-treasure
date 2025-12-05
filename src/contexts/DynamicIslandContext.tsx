// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Dynamic Island Context - Shared state for all components

import React, { createContext, useContext, useState, useRef, useCallback, useMemo, ReactNode } from 'react';

// Page-specific content for Dynamic Island
export type DynamicIslandPage = 
  | 'home' 
  | 'buzz-map' 
  | 'buzz' 
  | 'intelligence' 
  | 'notifications' 
  | 'leaderboard'
  | 'profile'
  | 'default';

export interface PageData {
  cluesFound?: number;
  totalClues?: number;
  daysRemaining?: number;
  rewardsAvailable?: number;
  totalRewards?: number;
  buzzCost?: number;
  lastBuzzResult?: string;
  aionStatus?: 'active' | 'idle';
  unreadCount?: number;
  currentPosition?: number;
  positionChange?: number;
}

interface DynamicIslandContextType {
  isActive: boolean;
  activate: (initialData?: PageData) => Promise<void>;
  deactivate: () => void;
  setPage: (page: DynamicIslandPage, data?: Partial<PageData>) => void;
  updateData: (newData: Partial<PageData>) => void;
  updateStatus: (status: { cluesFound?: number; totalClues?: number; daysRemaining?: number; missionName?: string }) => void;
  showMessage: (title: string, subtitle?: string) => void;
}

const DynamicIslandContext = createContext<DynamicIslandContextType | null>(null);

// M1SSION Logo artwork (static)
const ARTWORK_URLS = [
  { src: '/icons/icon-m1-192x192.png', sizes: '192x192', type: 'image/png' },
  { src: '/icons/icon-m1-512x512.png', sizes: '512x512', type: 'image/png' },
  { src: '/icons/128.png', sizes: '128x128', type: 'image/png' },
  { src: '/icons/512.png', sizes: '512x512', type: 'image/png' },
];

// Generate silent WAV audio
const generateSilentAudio = (): string => {
  const sampleRate = 44100;
  const duration = 1;
  const numSamples = sampleRate * duration;
  const numChannels = 1;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const fileSize = 36 + dataSize;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, fileSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  for (let i = 0; i < numSamples; i++) {
    const sample = Math.sin(2 * Math.PI * 100 * i / sampleRate) * 1; // Quasi silenzioso
    view.setInt16(44 + i * bytesPerSample, sample, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return 'data:audio/wav;base64,' + btoa(binary);
};

// Generate content for each page
const generatePageContent = (page: DynamicIslandPage, data: PageData) => {
  switch (page) {
    case 'home':
      return {
        title: `🎯 Indizi: ${data.cluesFound ?? 0}/${data.totalClues ?? 200}`,
        subtitle: `⏱️ ${data.daysRemaining ?? 25} giorni rimanenti`
      };
    case 'buzz-map':
      return {
        title: `🗺️ BUZZ MAP - ${data.buzzCost ?? 0} M1U`,
        subtitle: `🎁 ${data.rewardsAvailable ?? 0}/${data.totalRewards ?? 99} Rewards`
      };
    case 'buzz':
      const buzzDisplay = data.buzzCost === 0 ? 'GRATIS' : `${data.buzzCost} M1U`;
      return {
        title: `⚡ BUZZ - ${buzzDisplay}`,
        subtitle: data.lastBuzzResult || `🔍 Rileva posizione!`
      };
    case 'intelligence':
      return {
        title: `🧠 AION ${data.aionStatus === 'active' ? 'ATTIVO' : 'PRONTO'}`,
        subtitle: `🔮 L'Oracolo M1SSION`
      };
    case 'notifications':
      return {
        title: `📨 ${data.unreadCount ?? 0} Notifiche`,
        subtitle: `📡 Messaggi da HQ`
      };
    case 'leaderboard':
      const change = data.positionChange 
        ? (data.positionChange > 0 ? `↑${data.positionChange}` : `↓${Math.abs(data.positionChange)}`)
        : '';
      return {
        title: `🏆 #${data.currentPosition ?? '?'} ${change}`,
        subtitle: `📊 Classifica`
      };
    case 'profile':
      return {
        title: `👤 Profilo Agente`,
        subtitle: `🎖️ M1SSION Agent`
      };
    default:
      return {
        title: `🎯 M1SSION ATTIVA`,
        subtitle: `🔥 Trova il tesoro!`
      };
  }
};

export const DynamicIslandProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  
  const currentPageRef = useRef<DynamicIslandPage>('default');
  const pageDataRef = useRef<PageData>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Update Media Session
  const updateMediaSession = useCallback((page: DynamicIslandPage, data: PageData) => {
    if (!('mediaSession' in navigator)) return;
    
    try {
      const content = generatePageContent(page, data);
      
      navigator.mediaSession.metadata = new MediaMetadata({
        title: content.title,
        artist: 'M1SSION',
        album: content.subtitle,
        artwork: ARTWORK_URLS
      });

      navigator.mediaSession.playbackState = 'playing';
      
      console.log('🎵 Dynamic Island: Updated →', content.title);
    } catch (error) {
      console.warn('🎵 Dynamic Island: Update failed', error);
    }
  }, []);

  // Create audio element
  const createAudioElement = useCallback(() => {
    if (audioRef.current) return;

    try {
      const audio = new Audio();
      audio.src = generateSilentAudio();
      audio.loop = true;
      audio.volume = 0.001; // Praticamente silenzioso
      audioRef.current = audio;
      
      // Set action handlers
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', () => {
          audioRef.current?.play();
        });
        navigator.mediaSession.setActionHandler('pause', () => {
          audioRef.current?.pause();
        });
      }
      
      console.log('🎵 Dynamic Island: Audio created');
    } catch (error) {
      console.warn('🎵 Dynamic Island: Audio creation failed', error);
    }
  }, []);

  // Activate
  const activate = useCallback(async (initialData?: PageData) => {
    try {
      createAudioElement();
      
      if (initialData) {
        pageDataRef.current = { ...pageDataRef.current, ...initialData };
      }
      
      if (audioRef.current) {
        await audioRef.current.play();
      }
      
      updateMediaSession(currentPageRef.current, pageDataRef.current);
      setIsActive(true);
      
      console.log('🎵 Dynamic Island: ACTIVATED');
    } catch (error) {
      console.warn('🎵 Dynamic Island: Activation failed', error);
    }
  }, [createAudioElement, updateMediaSession]);

  // Deactivate
  const deactivate = useCallback(() => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
      
      setIsActive(false);
      console.log('🎵 Dynamic Island: DEACTIVATED');
    } catch (error) {
      console.warn('🎵 Dynamic Island: Deactivation failed', error);
    }
  }, []);

  // Set page
  const setPage = useCallback((page: DynamicIslandPage, data?: Partial<PageData>) => {
    console.log('🎵 Dynamic Island: setPage →', page);
    currentPageRef.current = page;
    
    if (data) {
      pageDataRef.current = { ...pageDataRef.current, ...data };
    }
    
    // Always update if audio is playing
    if (audioRef.current && !audioRef.current.paused) {
      updateMediaSession(page, pageDataRef.current);
    }
  }, [updateMediaSession]);

  // Update data
  const updateData = useCallback((newData: Partial<PageData>) => {
    pageDataRef.current = { ...pageDataRef.current, ...newData };
    
    if (audioRef.current && !audioRef.current.paused) {
      updateMediaSession(currentPageRef.current, pageDataRef.current);
    }
  }, [updateMediaSession]);

  // Legacy: updateStatus
  const updateStatus = useCallback((status: { cluesFound?: number; totalClues?: number; daysRemaining?: number; missionName?: string }) => {
    updateData({
      cluesFound: status.cluesFound,
      totalClues: status.totalClues,
      daysRemaining: status.daysRemaining
    });
  }, [updateData]);

  // Show message
  const showMessage = useCallback((title: string, subtitle?: string) => {
    if (!('mediaSession' in navigator)) return;
    if (!audioRef.current || audioRef.current.paused) return;
    
    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist: 'M1SSION',
      album: subtitle || '',
      artwork: ARTWORK_URLS
    });
  }, []);

  const value = useMemo(() => ({
    isActive,
    activate,
    deactivate,
    setPage,
    updateData,
    updateStatus,
    showMessage
  }), [isActive, activate, deactivate, setPage, updateData, updateStatus, showMessage]);

  return (
    <DynamicIslandContext.Provider value={value}>
      {children}
    </DynamicIslandContext.Provider>
  );
};

// Hook to use the context
export const useDynamicIsland = () => {
  const context = useContext(DynamicIslandContext);
  
  if (!context) {
    // Fallback for components outside provider (shouldn't happen)
    console.warn('🎵 useDynamicIsland used outside provider!');
    return {
      isActive: false,
      activate: async () => {},
      deactivate: () => {},
      setPage: () => {},
      updateData: () => {},
      updateStatus: () => {},
      showMessage: () => {},
      // Legacy aliases
      isDynamicIslandActive: false,
      activateDynamicIsland: async () => {},
      deactivateDynamicIsland: () => {}
    };
  }
  
  return {
    ...context,
    // Legacy aliases
    isDynamicIslandActive: context.isActive,
    activateDynamicIsland: context.activate,
    deactivateDynamicIsland: context.deactivate
  };
};

export default DynamicIslandContext;

