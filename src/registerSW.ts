// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™  
export const registerPush = async () => {
  if (!('serviceWorker' in navigator)) return;

  const registration = await navigator.serviceWorker.register('/service-worker.js');
  const permission = await Notification.requestPermission();

  if (permission === 'granted') {
    console.log('✅ Notifiche Safari iOS attivate');
    // 🔒 Qui puoi inviare il `registration.pushManager.subscribe()` al tuo backend Supabase
  }
};
