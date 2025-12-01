function detectPlatformSafe() {
  const ua = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua) || /macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  const isAndroid = /android/.test(ua);
  if (isIOS) return "ios";
  if (isAndroid) return "android";
  return "desktop";
}

export { detectPlatformSafe };
