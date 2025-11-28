/// <reference types="vite/client" />
/// <reference types="node" />

declare module "*.svg" { const src: string; export default src; }
declare module "*.png" { const src: string; export default src; }
declare module "*.jpg" { const src: string; export default src; }
declare module "*.jpeg" { const src: string; export default src; }
declare module "*.webp" { const src: string; export default src; }
declare module "*.mp4" { const src: string; export default src; }

declare global {
  // Compat browser per timer usati come NodeJS.Timeout
  interface Window { }
  // Se qualche codice tipizza i timer come NodeJS.Timeout in frontend,
  // questa estensione evita i conflitti tipici con DOM:
  namespace NodeJS { interface Timeout extends Number {} }
  type BrowserTimeout = number;

  // Se esiste codice che fa guard su process.env (solo typing, non runtime):
  // eslint-disable-next-line no-var
  var process: { env: Record<string,string|undefined> };

  interface Navigator {
    standalone?: boolean;
  }

  interface Performance {
    memory?: {
      usedJSHeapSize: number;
      jsHeapSizeLimit: number;
      totalJSHeapSize: number;
    };
  }

  interface Window {
    gc?: () => void;
    ENV?: Record<string, string>;
    getStripe?: () => any;
    __STRIPE_PK__?: string;
    DEBUG_PAGES?: boolean;
    // OneSignal RIMOSSO - Solo FCM e VAPID Web Push
    plausible?: (event: string, options?: { props?: Record<string, any> }) => void;
  }
}
export {};