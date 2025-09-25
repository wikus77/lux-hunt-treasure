// © 2025 M1SSION™ - Global type declarations for PWA compatibility

declare module '@capacitor/*' {
  const plugin: any;
  export = plugin;
}

declare module '@capacitor/core' {
  export const Capacitor: any;
  export const Plugins: any;
}

declare module '@capacitor/push-notifications' {
  export const PushNotifications: any;
}

declare module '@capacitor/splash-screen' {
  export const SplashScreen: any;
}