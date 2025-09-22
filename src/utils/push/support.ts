// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// Safe push notification feature detection

export const canUseNotifications = (): boolean => {
  try {
    return (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      typeof (window as any).Notification !== 'undefined' &&
      typeof (window as any).Notification.requestPermission === 'function'
    );
  } catch {
    return false;
  }
};

export const canUseServiceWorker = (): boolean => {
  try {
    return (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      typeof navigator.serviceWorker.ready !== 'undefined'
    );
  } catch {
    return false;
  }
};

export const isAppleWebPush = (): boolean => {
  try {
    return (
      typeof window !== 'undefined' &&
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      (window as any).navigator?.standalone === true // PWA mode
    );
  } catch {
    return false;
  }
};

export const isIOSDevice = (): boolean => {
  try {
    return (
      typeof window !== 'undefined' &&
      (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
       (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))
    );
  } catch {
    return false;
  }
};

export const isPWAMode = (): boolean => {
  try {
    return (
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
       (window as any).navigator?.standalone === true ||
       document.referrer.includes('android-app://'))
    );
  } catch {
    return false;
  }
};

export const getNotificationPermission = (): NotificationPermission | null => {
  try {
    return canUseNotifications() ? Notification.permission : null;
  } catch {
    return null;
  }
};

export const detectPushProvider = (endpoint: string): string => {
  try {
    const host = new URL(endpoint).host;
    if (host.includes('web.push.apple.com')) return 'apns';
    if (host.includes('fcm.googleapis.com')) return 'fcm';
    if (host.includes('push.services.mozilla.com')) return 'mozilla';
    return 'unknown';
  } catch {
    return 'unknown';
  }
};

export const getPlatformInfo = () => {
  const isIOS = isIOSDevice();
  const isPWA = isPWAMode();
  const isApple = isAppleWebPush();
  
  let platform = 'web';
  if (isIOS && isPWA) platform = 'ios-pwa';
  else if (isIOS) platform = 'ios-web';
  else if (window.innerWidth > 1024) platform = 'desktop';
  
  return {
    isIOS,
    isPWA,
    isApple,
    platform,
    canUseNotifications: canUseNotifications(),
    canUseServiceWorker: canUseServiceWorker(),
    permission: getNotificationPermission()
  };
};