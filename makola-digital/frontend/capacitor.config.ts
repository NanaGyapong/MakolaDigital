import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'online.makoladigital.app',
  appName: 'Makola Digital',
  // Use the live web URL - no static export needed
  server: {
    url: 'https://www.makoladigital.online',
    cleartext: false,
    androidScheme: 'https',
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#ffffff',
    scheme: 'makoladigital',
  },
  plugins: {
    SplashScreen: {
      backgroundColor: '#E8001A',
      launchShowDuration: 2000,
    },
    StatusBar: {
      backgroundColor: '#E8001A',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
