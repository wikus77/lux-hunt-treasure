// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// LipSync Event Bus - Pub/Sub for animation events

export interface VisemeData {
  mouthOpen: number;  // 0-1
  energy: number;     // 0-1
  vowels?: number[];
  viseme?: string;
}

type EventCallback = (data?: any) => void;

class LipSyncEventBus {
  private events: Map<string, Set<EventCallback>> = new Map();
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animationFrame: number | null = null;

  on(event: string, callback: EventCallback): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(callback);
  }

  off(event: string, callback: EventCallback): void {
    this.events.get(event)?.delete(callback);
  }

  emit(event: string, data?: any): void {
    this.events.get(event)?.forEach(callback => callback(data));
  }

  async start(audioUrl: string): Promise<void> {
    try {
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;

      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);

      source.onended = () => {
        this.ended();
      };

      source.start(0);
      this.emit('start');
      this.processAudio();
    } catch (error) {
      console.error('[LipSyncBus] Start error:', error);
      this.emit('error', error);
    }
  }

  private processAudio(): void {
    if (!this.analyser) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    
    const analyze = () => {
      if (!this.analyser) return;

      this.analyser.getByteFrequencyData(dataArray);

      // Calculate energy from frequency data
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const energy = sum / (dataArray.length * 255);

      // Simple mouth open based on energy
      const mouthOpen = Math.min(1, energy * 2);

      // Extract vowel frequencies (simplified)
      const lowFreq = dataArray.slice(0, 20).reduce((a, b) => a + b, 0) / (20 * 255);
      const midFreq = dataArray.slice(20, 60).reduce((a, b) => a + b, 0) / (40 * 255);
      const highFreq = dataArray.slice(60, 100).reduce((a, b) => a + b, 0) / (40 * 255);

      this.viseme({
        mouthOpen,
        energy,
        vowels: [lowFreq, midFreq, highFreq]
      });

      this.animationFrame = requestAnimationFrame(analyze);
    };

    analyze();
  }

  stop(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.analyser = null;
    this.emit('stop');
  }

  viseme(data: VisemeData): void {
    this.emit('viseme', data);
  }

  ended(): void {
    this.stop();
    this.emit('ended');
  }
}

export const LipSyncBus = new LipSyncEventBus();
export default LipSyncBus;




