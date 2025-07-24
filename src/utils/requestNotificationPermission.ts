// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

let hasRequested = false

export function setupNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  const handler = () => {
    if (!hasRequested && Notification.permission !== 'granted') {
      Notification.requestPermission().then(() => {
        console.log('🔔 Permission requested')
      })
      hasRequested = true
      window.removeEventListener('click', handler)
    }
  }
  window.addEventListener('click', handler)
}
