import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.auramusic.app',
  appName: 'Aura Music',
  webDir: 'dist',
  backgroundColor: '#08090e',
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    backgroundColor: '#08090e'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      backgroundColor: '#08090e',
      showSpinner: false,
      androidSplashResourceName: 'splash'
    }
  }
};

export default config;
