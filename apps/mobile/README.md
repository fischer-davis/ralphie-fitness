# Ralphie Fitness Mobile App

React Native mobile application for Ralphie Fitness.

## Features

- **Authentication**: Sign in/up with better-auth
- **Home Dashboard**: View workout stats and recent activity
- **Workouts**: Browse workout templates and history
- **Profile**: Manage your account settings
- **Type-Safe API**: Full tRPC integration with the backend

## Prerequisites

- Node.js 18+ (Node 22 recommended)
- npm or yarn
- iOS: Xcode 14+ and CocoaPods
- Android: Android Studio and JDK 11+

## Setup

### 1. Install Dependencies

From the root of the monorepo:

```bash
npm install
```

### 2. Install iOS Dependencies (iOS only)

```bash
cd apps/mobile/ios
pod install
cd ..
```

### 3. Configure Backend URL

The app will automatically use the correct localhost URL based on your platform:
- **iOS Simulator**: `http://localhost:3001`
- **Android Emulator**: `http://10.0.2.2:3001`

For production or custom URLs, edit `src/lib/config.ts`.

### 4. Start Metro Bundler

From the root:

```bash
npm run dev --filter mobile
```

Or from the mobile directory:

```bash
npm start
```

### 5. Run the App

**iOS:**
```bash
npm run ios
```

Or open `ios/RalphieFitness.xcworkspace` in Xcode and run.

**Android:**
```bash
npm run android
```

Or open the `android` folder in Android Studio and run.

## Project Structure

```
apps/mobile/
├── src/
│   ├── components/      # Reusable components
│   ├── lib/            # Utilities and configurations
│   │   ├── auth.ts     # better-auth client
│   │   ├── config.ts   # App configuration
│   │   ├── trpc.ts     # tRPC context
│   │   └── trpc-provider.tsx  # tRPC provider component
│   ├── navigation/     # React Navigation setup
│   │   └── AppNavigator.tsx
│   └── screens/        # App screens
│       ├── HomeScreen.tsx
│       ├── WorkoutsScreen.tsx
│       ├── ProfileScreen.tsx
│       ├── LoginScreen.tsx
│       └── LoadingScreen.tsx
├── android/            # Android native code
├── ios/                # iOS native code
├── App.tsx            # Root component
├── index.js           # App entry point
└── package.json
```

## Development

### Running on Device

**iOS:**
1. Open Xcode and select your device
2. Update signing team in Xcode
3. Run `npm run ios -- --device "Your Device Name"`

**Android:**
1. Enable USB debugging on your device
2. Connect via USB
3. Run `npm run android --deviceId=<device-id>`

### Debugging

- **React Native Debugger**: Install and open React Native Debugger
- **Flipper**: Built-in debugging tool (requires setup)
- **Chrome DevTools**: Shake device and select "Debug"

### tRPC Usage

The mobile app follows the same tRPC pattern as the web app:

```typescript
import { useTRPC } from '@/lib/trpc';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function MyComponent() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // Queries
  const statsQuery = trpc.stats.overview.queryOptions();
  const { data } = useQuery(statsQuery);

  // Mutations
  const createMutation = trpc.workouts.create.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.workouts.list.queryKey(),
      });
    },
  });
  const mutation = useMutation(createMutation);

  return (
    <View>
      {/* Your component */}
    </View>
  );
}
```

## Building for Production

### iOS

```bash
npm run build:ios
```

Or use Xcode to archive and export.

### Android

```bash
npm run build:android
```

APK will be at `android/app/build/outputs/apk/release/app-release.apk`.

## Troubleshooting

### Metro Bundler Issues

```bash
npm start -- --reset-cache
```

### iOS Build Errors

```bash
cd ios
pod deintegrate
pod install
cd ..
```

### Android Build Errors

```bash
cd android
./gradlew clean
cd ..
```

### Connection Issues

- **iOS**: Ensure backend is running on `http://localhost:3001`
- **Android**: Ensure backend is accessible at `http://10.0.2.2:3001`
- **Physical Device**: Update `src/lib/config.ts` with your computer's local IP

## Additional Resources

- [React Native Documentation](https://reactnative.dev)
- [React Navigation Documentation](https://reactnavigation.org)
- [tRPC Documentation](https://trpc.io)
- [better-auth Documentation](https://www.better-auth.com)
