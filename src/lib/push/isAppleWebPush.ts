// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* Apple Web Push Detection Utility */

export function isAppleWebPush(): boolean {
  const ua = navigator.userAgent || '';
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  // Safari 16.4+ supports Web Push on iOS/iPadOS/macOS
  return isSafari && (isIOS || /Macintosh/.test(ua));
}