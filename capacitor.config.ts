import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.auramusic.app',
  appName: 'Aura Music',
  webDir: 'dist',
  backgroundColor: '#101010',
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    backgroundColor: '#101010'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      backgroundColor: '#101010',
      showSpinner: false,
      androidSplashResourceName: 'splash'
    }
  }
};

export default config;
