
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.m1ssion.app',
  appName: 'M1SSION',
  webDir: 'dist',
  server: {
    url: 'http://192.168.178.115:8080',
    cleartext: true
  }
};

export default config;
