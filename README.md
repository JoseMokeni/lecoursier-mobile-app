# LeCoursier Admin Mobile App 📱

This is a React Native mobile application built with [Expo](https://expo.dev) and [Expo Router](https://docs.expo.dev/router/introduction/). The app includes Firebase Cloud Messaging (FCM) for push notifications, Google Maps integration, and authentication features.

## Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- EAS CLI (`npm install -g eas-cli`)
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd lecoursier-mobile-app
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory and fill in the following variables:

```env
# API Configuration
EXPO_PUBLIC_API_URL=http://your-api-url:port

# Google Maps API Key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Pusher Configuration (for real-time features)
EXPO_PUBLIC_PUSHER_HOST=http://10.0.2.2
EXPO_PUBLIC_PUSHER_APP_KEY=your_pusher_app_key
EXPO_PUBLIC_PUSHER_APP_SECRET=your_pusher_app_secret
EXPO_PUBLIC_PUSHER_APP_ID=your_pusher_app_id
EXPO_PUBLIC_PUSHER_APP_CLUSTER=mt1
EXPO_PUBLIC_PUSHER_PORT=6001
```

> **Note**: You can copy `.env.example` to `.env` and update the values:
>
> ```bash
> cp .env.example .env
> ```

### 3. Firebase Setup for FCM (Firebase Cloud Messaging)

#### 3.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable Firebase Cloud Messaging in your project

#### 3.2 Android Configuration

1. In Firebase Console, add an Android app to your project
2. Use the package name from your `app.json` (usually something like `com.yourcompany.lecoursier`)
3. Download the `google-services.json` file
4. **Place `google-services.json` in the root directory of the project** (same level as `package.json`)

#### 3.3 iOS Configuration

1. In Firebase Console, add an iOS app to your project
2. Use the bundle identifier from your `app.json`
3. Download the `GoogleService-Info.plist` file
4. **Place `GoogleService-Info.plist` in the root directory of the project** (same level as `package.json`)

### 4. Generate Native Code and Get SHA-1 Certificate

Before building, you need to generate the native Android and iOS code:

```bash
# Clean and generate native code
npx expo prebuild --clean
```

After prebuild, get the SHA-1 certificate for Android:

```bash
# Navigate to android directory and run signing report
cd android
./gradlew signingReport
```

Copy the SHA-1 certificate from the output and add it to your Firebase project:

1. Go to Firebase Console → Project Settings → Your Apps → Android App
2. Add the SHA-1 certificate fingerprint
3. This authorizes your app to use Firebase services

## Running the Application

### Option 1: Development with Expo Go

```bash
# Start the development server
npx expo start
```

Scan the QR code with:

- **Android**: Expo Go app from Google Play Store
- **iOS**: Camera app or Expo Go app from App Store

### Option 2: Development Build

```bash
# For Android
npx expo run:android

# For iOS
npx expo run:ios
```

### Option 3: Production Build (Local)

#### Android Release Bundle

```bash
# Generate release bundle
cd android
./gradlew bundleRelease

# The bundle will be in: android/app/build/outputs/bundle/release/app-release.aab
```

#### Android APK

```bash
# Generate release APK
cd android
./gradlew assembleRelease

# The APK will be in: android/app/build/outputs/apk/release/app-release.apk
```

## Building with EAS (Expo Application Services)

### Setup EAS

```bash
# Login to your Expo account
eas login

# Configure the project for EAS
eas build:configure
```

### Development Builds

```bash
# Build for development (internal distribution)
eas build --profile development --platform android
eas build --profile development --platform ios
```

### Preview Builds

```bash
# Build for preview (internal testing)
eas build --profile preview --platform android
eas build --profile preview --platform ios
```

### Production Builds

```bash
# Build for production
eas build --profile production --platform android
eas build --profile production --platform ios

# Build for both platforms
eas build --profile production --platform all
```

### Submit to App Stores

```bash
# Submit to Google Play Store
eas submit --platform android

# Submit to Apple App Store
eas submit --platform ios
```

## Project Structure

```
├── app/                    # App screens (file-based routing)
├── components/            # Reusable React components
├── constants/            # App constants
├── context/              # React context providers
├── services/             # API and auth services
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
├── assets/               # Images, fonts, sounds
├── google-services.json  # Firebase config for Android
├── GoogleService-Info.plist # Firebase config for iOS
└── android/              # Native Android code
└── ios/                  # Native iOS code
```

## Important Notes

- **Firebase Configuration Files**: Make sure `google-services.json` and `GoogleService-Info.plist` are placed in the root directory (same level as `package.json`)
- **SHA-1 Certificate**: Always generate and add the SHA-1 certificate to Firebase after running `npx expo prebuild --clean`
- **Environment Variables**: Never commit sensitive environment variables to version control
- **EAS Builds**: EAS builds are recommended for production apps as they provide more control and better performance

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test
```

## Troubleshooting

### Common Issues

1. **FCM not working**: Ensure Firebase config files are in the root directory and SHA-1 is added to Firebase
2. **Google Maps not showing**: Check if `GOOGLE_MAPS_API_KEY` is set correctly and the API key has Maps SDK enabled
3. **Build failures**: Try `npx expo prebuild --clean` to regenerate native code

### Clean Build

If you encounter issues, try cleaning and rebuilding:

```bash
# Clean everything
npx expo prebuild --clean
rm -rf node_modules
npm install

# For Android
cd android
./gradlew clean
cd ..

# Start fresh
npx expo start --clear
```
