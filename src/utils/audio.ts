// Utility per gestire audio in ambiente Capacitor iOS
import { Capacitor } from '@capacitor/core';

interface AudioMap {
  [key: string]: string;
}

// Mappa dei suoni disponibili
const AUDIO_MAP: AudioMap = {
  success: '/assets/audio/success.mp3',
  error: '/assets/audio/error.mp3',
  chime: '/assets/audio/chime.mp3',
  beep: '/assets/audio/beep.mp3',
  start: '/assets/audio/start.mp3',
  level_complete: '/assets/audio/level_complete.mp3',
  victory: '/assets/audio/victory.mp3'
};

class AudioManager {
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private isEnabled: boolean = true;

  constructor() {
    // Su piattaforme native, precarica i suoni
    if (Capacitor.isNativePlatform()) {
      this.preloadAudio();
    }
  }

  private async preloadAudio() {
    try {
      for (const [key, path] of Object.entries(AUDIO_MAP)) {
        const audio = new Audio(path);
        audio.preload = 'auto';
        this.audioCache.set(key, audio);
      }
    } catch (error) {
      console.warn('Errore nel precaricamento audio:', error);
    }
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  public async playSound(soundKey: string): Promise<void> {
    if (!this.isEnabled) return;

    try {
      let audio = this.audioCache.get(soundKey);
      
      if (!audio && AUDIO_MAP[soundKey]) {
        audio = new Audio(AUDIO_MAP[soundKey]);
        this.audioCache.set(soundKey, audio);
      }

      if (audio) {
        audio.currentTime = 0;
        await audio.play();
      }
    } catch (error) {
      console.warn(`Impossibile riprodurre suono ${soundKey}:`, error);
    }
  }
}

export const audioManager = new AudioManager();
export const playSound = (soundKey: string) => audioManager.playSound(soundKey);
export const setAudioEnabled = (enabled: boolean) => audioManager.setEnabled(enabled);