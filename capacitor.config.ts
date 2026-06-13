import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.flashmarket.app',
  appName: 'FlashMarket',
  webDir: 'out',
  server: {
    url: 'https://flashmarket-five.vercel.app',
    androidScheme: 'https'
  }
};

export default config;
