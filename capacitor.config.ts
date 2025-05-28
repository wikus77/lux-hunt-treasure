
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.m1ssion.app',
  appName: 'lux-hunt-treasure',
  webDir: 'dist',
  server: {
    url: '',
    cleartext: true
  },
  bundledWebRuntime: false
};

export default config;
