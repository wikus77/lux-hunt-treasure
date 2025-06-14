
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'it.m1ssion.app',
  appName: 'M1SSION',
  webDir: 'dist',
  server: {
    // NOTA: Sostituire 192.168.1.100 con l'IP locale reale del PC
    // Su Mac: ipconfig getifaddr en0
    // Su Windows: ipconfig | findstr IPv4
    // Su Linux: hostname -I
    url: 'http://192.168.1.100:8080',
    cleartext: true,
    androidScheme: 'https'
  },
  plugins: {
    DynamicIsland: {
      class: 'M1SSIONLiveActivity'
    }
  },
  ios: {
    scheme: 'M1SSION'
  }
};

export default config;
