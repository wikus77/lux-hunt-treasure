import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.m1ssion.app',
  appName: 'M1SSION',
  webDir: 'dist', // oppure 'build' o '.next' in base al framework
  server: {
    url: 'http://192.168.178.115:8080', // ✅ Il tuo IP locale corretto
    cleartext: true
  }
};

export default config;
