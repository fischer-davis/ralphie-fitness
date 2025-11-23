# Native Project Setup

The React Native project structure has been created, but the complete native projects (iOS and Android) need to be initialized using React Native CLI.

## Complete Native Setup

### Option 1: Initialize with React Native CLI (Recommended)

The easiest way to complete the setup is to use React Native CLI to initialize the native projects:

```bash
# From the mobile directory
cd apps/mobile

# Initialize the native projects (this will set up ios/ and android/ folders completely)
npx react-native init RalphieFitness --skip-install --directory .

# When prompted, choose:
# - Yes to overwrite files
# - Keep your existing package.json, App.tsx, and src/ directory

# After initialization, restore the custom files:
# - Restore package.json (keep your version with monorepo dependencies)
# - Restore App.tsx
# - Restore src/ directory
# - Keep the initialized ios/ and android/ folders
```

### Option 2: Manual Setup

If you prefer manual setup or are working with an existing app:

#### iOS Setup

1. Create a new iOS project or copy from a fresh React Native init
2. Update the Podfile (already created in `ios/Podfile`)
3. Run `pod install` in the `ios/` directory
4. Update `Info.plist` to allow HTTP connections for development:
   ```xml
   <key>NSAppTransportSecurity</key>
   <dict>
       <key>NSAllowsLocalNetworking</key>
       <true/>
   </dict>
   ```

#### Android Setup

1. The basic Gradle files have been created
2. Complete the `android/app/src/main` structure:
   ```
   android/app/src/main/
   ├── AndroidManifest.xml
   ├── java/com/ralphiefitness/
   │   ├── MainActivity.kt
   │   └── MainApplication.kt
   └── res/
       ├── values/
       │   ├── strings.xml
       │   └── styles.xml
       └── mipmap-*/
           └── (app icons)
   ```

3. Create a debug keystore:
   ```bash
   keytool -genkey -v -keystore android/app/debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000
   ```

## Quick Start Alternative

For the fastest setup, you can initialize a fresh React Native app in a temporary directory and copy the native folders:

```bash
# In a temporary location
npx react-native init TempApp
cd TempApp

# Copy the native folders to your mobile app
cp -r ios /path/to/ralphie-fitness/apps/mobile/
cp -r android /path/to/ralphie-fitness/apps/mobile/

# Then update the Podfile and build.gradle files with the versions provided
```

## Verification

After completing the native setup, verify everything works:

```bash
# Install dependencies
npm install

# iOS
cd ios && pod install && cd ..
npm run ios

# Android
npm run android
```

## Troubleshooting

### Missing Native Modules

If you get errors about missing native modules, ensure:
1. Dependencies are installed: `npm install`
2. iOS pods are installed: `cd ios && pod install`
3. Android is synced: Open in Android Studio and sync Gradle

### Metro Bundler Issues

Clear the cache if you encounter bundling issues:
```bash
npm start -- --reset-cache
```

## Next Steps

Once the native projects are set up:
1. Run the backend server on port 3001
2. Start the mobile app
3. Sign in or create an account
4. Explore the app features

For more details, see the main [README.md](./README.md).
