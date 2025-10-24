/**
 * The Pulse™ — Ritual Audio Playback
 * Synchronized audio for EMP interference effect
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

export async function playRitualAudio(volume = 0.6) {
  try {
    // Use a fallback interference sound effect
    // In production, replace with custom ritual-interference.mp3
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.volume = Math.min(Math.max(volume, 0), 1); // Clamp 0-1
    audio.loop = false;

    // Attempt autoplay
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.warn('[Ritual Audio] Autoplay blocked, waiting for user gesture:', error);
        // Retry on next user interaction
        const retryPlay = () => {
          audio.play().catch(console.error);
          document.removeEventListener('click', retryPlay);
          document.removeEventListener('touchstart', retryPlay);
        };
        document.addEventListener('click', retryPlay, { once: true });
        document.addEventListener('touchstart', retryPlay, { once: true });
      });
    }

    // Auto-stop after 10 seconds
    setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
    }, 10000);

    console.log('[Ritual Audio] Playback initiated');
  } catch (err) {
    console.error('[Ritual Audio] Playback error:', err);
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
