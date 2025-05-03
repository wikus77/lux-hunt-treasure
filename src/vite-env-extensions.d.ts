
/// <reference types="vite/client" />

// Per il globo 3D
interface Window {
  Globe: () => any;
  __domLoaded?: boolean; // Aggiungiamo la dichiarazione della proprietà personalizzata
}
