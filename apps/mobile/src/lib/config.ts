import { Platform } from 'react-native';

// Development API URLs
// iOS simulator uses localhost, Android emulator uses 10.0.2.2
const DEV_API_URLS = {
  ios: 'http://localhost:3001',
  android: 'http://10.0.2.2:3001',
  default: 'http://localhost:3001',
};

// You can set this via environment variable or change for production
export const API_URL = __DEV__
  ? (DEV_API_URLS[Platform.OS as keyof typeof DEV_API_URLS] || DEV_API_URLS.default)
  : 'https://your-production-api.com'; // Replace with your production URL
