# 📱 Capacitor Conversie Guide

Complete gids voor het omzetten van de Gazon App PWA naar native iOS en Android apps met Capacitor.

## Wat is Capacitor?

Capacitor is een cross-platform native runtime die web apps omzet naar native iOS en Android apps, met toegang tot native device features.

**Voordelen:**
- ✅ Gebruik bestaande web code (HTML/CSS/JS)
- ✅ Toegang tot native APIs (camera, push notifications, etc.)
- ✅ Deploy naar App Store en Google Play
- ✅ Behoud PWA functionaliteit
- ✅ Native performance

## Prerequisites

### Systeem Vereisten

**Voor iOS Development:**
- macOS (Catalina of hoger)
- Xcode 13+ (gratis via App Store)
- CocoaPods: `sudo gem install cocoapods`
- Apple Developer Account ($99/jaar voor distribution)

**Voor Android Development:**
- Windows, macOS, of Linux
- Android Studio (gratis)
- Java JDK 11+
- Android SDK (via Android Studio)

**Voor beide:**
- Node.js 16+ en npm
- Git

## Installatie

### 1. Installeer Capacitor

```bash
# Navigeer naar project directory
cd De-Gazon-App

# Installeer Capacitor
npm init -y  # Als je nog geen package.json hebt
npm install @capacitor/core @capacitor/cli
```

### 2. Initialiseer Capacitor

```bash
npx cap init
```

**Vragen:**
- App name: `de Gazon App`
- Package ID: `nl.graszodenexpert.gazonapp` (reverse domain, uniek)
- Web asset directory: `.` (huidige directory)

Dit maakt `capacitor.config.json` aan:

```json
{
  "appId": "nl.graszodenexpert.gazonapp",
  "appName": "de Gazon App",
  "webDir": ".",
  "bundledWebRuntime": false,
  "server": {
    "androidScheme": "https"
  }
}
```

### 3. Voeg Platforms Toe

```bash
# iOS (alleen op macOS)
npm install @capacitor/ios
npx cap add ios

# Android
npm install @capacitor/android
npx cap add android
```

Dit maakt `ios/` en `android/` directories aan.

## Project Structuur na Capacitor

```
De-Gazon-App/
├── ios/                      # iOS native project
│   └── App/
│       ├── App.xcodeproj
│       └── App.xcworkspace   # Open dit in Xcode
│
├── android/                  # Android native project
│   ├── app/
│   └── build.gradle
│
├── capacitor.config.json     # Capacitor configuratie
├── package.json              # Dependencies
└── [bestaande PWA files]
```

## Configuratie

### capacitor.config.json

Uitgebreide configuratie:

```json
{
  "appId": "nl.graszodenexpert.gazonapp",
  "appName": "de Gazon App",
  "webDir": ".",
  "bundledWebRuntime": false,
  "server": {
    "androidScheme": "https",
    "hostname": "gazonapp.nl",
    "iosScheme": "capacitor"
  },
  "ios": {
    "contentInset": "always",
    "limitsNavigationsToAppBoundDomains": true
  },
  "android": {
    "allowMixedContent": false,
    "captureInput": true,
    "webContentsDebuggingEnabled": false
  },
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 2000,
      "backgroundColor": "#2E7D32",
      "showSpinner": false,
      "androidSpinnerStyle": "small",
      "iosSpinnerStyle": "small",
      "spinnerColor": "#FFFFFF"
    },
    "StatusBar": {
      "style": "light",
      "backgroundColor": "#2E7D32"
    }
  }
}
```

## Native Plugins Toevoegen

### Camera Plugin

```bash
npm install @capacitor/camera
npx cap sync
```

**Gebruik in code:**

```javascript
import { Camera, CameraResultType } from '@capacitor/camera';

async function takePicture() {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: true,
    resultType: CameraResultType.Uri
  });

  const imageUrl = image.webPath;
  // Gebruik imageUrl in photoAnalysis
}
```

### Push Notifications

```bash
npm install @capacitor/push-notifications
npx cap sync
```

**Setup:**

```javascript
import { PushNotifications } from '@capacitor/push-notifications';

// Register
await PushNotifications.requestPermissions();
await PushNotifications.register();

// Listen for tokens
PushNotifications.addListener('registration', (token) => {
  console.log('Push token:', token.value);
});

// Listen for notifications
PushNotifications.addListener('pushNotificationReceived', (notification) => {
  console.log('Push received:', notification);
});
```

### Andere Nuttige Plugins

```bash
# Geolocation
npm install @capacitor/geolocation

# Local Notifications
npm install @capacitor/local-notifications

# Share
npm install @capacitor/share

# Haptics
npm install @capacitor/haptics

# App
npm install @capacitor/app

# Network
npm install @capacitor/network
```

## iOS Development

### 1. Open Project in Xcode

```bash
npx cap open ios
```

### 2. Configureer App in Xcode

**Signing & Capabilities:**
- Select project in navigator
- Select "App" target
- Signing & Capabilities tab
- Team: Selecteer je Apple Developer account
- Bundle Identifier: `nl.graszodenexpert.gazonapp`

**Capabilities toevoegen:**
- Click "+ Capability"
- Voeg toe wat nodig is:
  - Push Notifications
  - Background Modes (voor background updates)

### 3. Info.plist Configuratie

Voeg camera permission toe in `ios/App/App/Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>Deze app heeft camera toegang nodig voor gazon foto analyse</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>Deze app heeft toegang tot je foto's nodig om gazon foto's te analyseren</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>Deze app heeft je locatie nodig voor locatie-specifiek gazon advies</string>
```

### 4. App Icons

**Automatisch genereren:**

```bash
# Installeer asset generator
npm install -g capacitor-assets

# Genereer icons en splash screens
# Voeg eerst icon.png (1024x1024) en splash.png (2732x2732) toe
npx capacitor-assets generate --ios
```

**Handmatig:**
- Open `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
- Voeg icons toe in verschillende sizes
- Of gebruik Xcode Asset Catalog

### 5. Build & Test

**Simulator:**
```bash
# Sync changes
npx cap sync ios

# Open in Xcode
npx cap open ios

# In Xcode: Select simulator and click Run (⌘R)
```

**Echte Device:**
- Sluit iPhone aan via USB
- Trust computer op iPhone
- Selecteer device in Xcode
- Click Run (⌘R)

### 6. App Store Deployment

**1. Archiveren:**
- Product → Archive
- Wacht tot archivering compleet is

**2. Distribute:**
- Window → Organizer
- Select archive → Distribute App
- App Store Connect → Upload
- Automatisch beheer certificaten

**3. App Store Connect:**
- Ga naar [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
- My Apps → Create new app
- Vul metadata in (screenshots, beschrijving, etc.)
- Submit for review

## Android Development

### 1. Open Project in Android Studio

```bash
npx cap open android
```

### 2. Gradle Sync

- Android Studio opent
- Wacht op Gradle sync (eerste keer kan lang duren)
- Als errors: File → Invalidate Caches / Restart

### 3. Configureer App

**AndroidManifest.xml** (`android/app/src/main/AndroidManifest.xml`):

```xml
<!-- Permissions -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />

<!-- Camera feature -->
<uses-feature android:name="android.hardware.camera" android:required="false" />
```

### 4. App Icons & Splash

**Automatisch:**

```bash
npx capacitor-assets generate --android
```

**Handmatig:**
- Icons: `android/app/src/main/res/mipmap-*/ic_launcher.png`
- Splash: gebruik [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/)

### 5. Build & Test

**Emulator:**
```bash
# Sync changes
npx cap sync android

# Open in Android Studio
npx cap open android

# In Android Studio: Select emulator and click Run
```

**Echte Device:**
- Enable Developer Options op Android device
- Enable USB Debugging
- Sluit device aan via USB
- Selecteer device in Android Studio
- Click Run

### 6. Google Play Deployment

**1. Genereer Signed APK/Bundle:**

In Android Studio:
- Build → Generate Signed Bundle / APK
- Select "Android App Bundle"
- Create new keystore:
  - Key store path: `android/keystore.jks`
  - Password: [kies sterk wachtwoord]
  - Key alias: `gazonapp-key`
  - Validity: 25 years
  - **BELANGRIJK:** Bewaar keystore en wachtwoorden veilig!

**2. Build Release:**
- Build variant: release
- Signature versions: V1 en V2
- Click Finish

**3. Google Play Console:**
- Ga naar [play.google.com/console](https://play.google.com/console)
- Create app
- Upload AAB file
- Vul metadata in
- Submit for review

## Development Workflow

### Lokale Development

```bash
# 1. Maak wijzigingen in web files (HTML/CSS/JS)

# 2. Sync naar native projects
npx cap sync

# 3. Open in IDE
npx cap open ios    # of
npx cap open android

# 4. Run in simulator/emulator
```

### Live Reload tijdens Development

**capacitor.config.json:**

```json
{
  "server": {
    "url": "http://192.168.1.100:8000",
    "cleartext": true
  }
}
```

```bash
# Start local server
python -m http.server 8000

# Run app in simulator
# App laadt nu van local server met live reload
```

**BELANGRIJK:** Verwijder `server.url` voor productie builds!

## Platform-Specifieke Code

### Feature Detection

```javascript
import { Capacitor } from '@capacitor/core';

// Check if running native
if (Capacitor.isNativePlatform()) {
  // Native code
  console.log('Running on:', Capacitor.getPlatform()); // 'ios' of 'android'
} else {
  // Web code
  console.log('Running in browser');
}

// Platform-specific
if (Capacitor.getPlatform() === 'ios') {
  // iOS-specific code
} else if (Capacitor.getPlatform() === 'android') {
  // Android-specific code
}
```

### Native Camera vs Web

```javascript
async function capturePhoto() {
  if (Capacitor.isNativePlatform()) {
    // Use native camera
    const photo = await Camera.getPhoto({
      quality: 90,
      source: CameraSource.Camera,
      resultType: CameraResultType.Uri
    });
    return photo.webPath;
  } else {
    // Use web file input
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';
      input.onchange = (e) => {
        const file = e.target.files[0];
        resolve(URL.createObjectURL(file));
      };
      input.click();
    });
  }
}
```

## Debugging

### iOS Debugging

**Safari Web Inspector:**
1. iOS device: Settings → Safari → Advanced → Web Inspector (enable)
2. Mac: Safari → Preferences → Advanced → Show Develop menu
3. Connect device, run app
4. Safari → Develop → [Your Device] → [App Name]

### Android Debugging

**Chrome DevTools:**
1. Enable USB Debugging op Android device
2. Connect device, run app
3. Chrome: `chrome://inspect`
4. Click "inspect" onder je app

### Logging

```javascript
import { CapacitorLog } from '@capacitor/core';

// Logs verschijnen in native console
console.log('Web log');  // Ook zichtbaar in native console
```

## Common Issues & Solutions

### iOS Build Failed

**"Code signing error":**
- Check Bundle Identifier is uniek
- Zorg dat je ingelogd bent met Apple ID in Xcode
- Preferences → Accounts → Add Apple ID

**"CocoaPods not installed":**
```bash
sudo gem install cocoapods
cd ios/App
pod install
```

### Android Build Failed

**"SDK not found":**
- Open Android Studio → SDK Manager
- Install Android SDK (API 31+)
- Set ANDROID_HOME environment variable

**"Gradle sync failed":**
```bash
cd android
./gradlew clean
cd ..
npx cap sync android
```

### App Crashes on Launch

**Check logs:**
```bash
# iOS
xcrun simctl spawn booted log stream --predicate 'processImagePath contains "gazonapp"'

# Android
adb logcat | grep -i gazonapp
```

## Performance Optimization

### Reduce App Size

**iOS:**
- Enable bitcode in Xcode build settings
- Use asset compression
- Strip unused resources

**Android:**
- Enable ProGuard/R8
- Use Android App Bundle (splits by architecture)
- Compress images and assets

### Improve Launch Time

```javascript
// Hide splash screen when ready
import { SplashScreen } from '@capacitor/splash-screen';

document.addEventListener('DOMContentLoaded', async () => {
  await initializeApp();
  await SplashScreen.hide();
});
```

## Testing

### Automated Testing

**E2E Tests met Appium:**

```bash
npm install --save-dev appium webdriverio

# iOS
appium --allow-insecure chromedriver_autodownload

# Android
appium
```

**Test example:**

```javascript
const { remote } = require('webdriverio');

const opts = {
  capabilities: {
    platformName: 'iOS',
    platformVersion: '15.0',
    deviceName: 'iPhone 13',
    app: '/path/to/app.app'
  }
};

const client = await remote(opts);
await client.$('#google-login-btn').click();
```

## Costs Overview

| Item | Cost | Frequency |
|------|------|-----------|
| Apple Developer Program | $99 | Per jaar |
| Google Play Console | $25 | Eenmalig |
| Mac (voor iOS dev) | Variabel | Eenmalig |
| Android Studio | Gratis | - |
| Xcode | Gratis | - |
| Capacitor | Gratis | - |

**Total:** $124 voor beide platforms (eerste jaar)

## Next Steps

1. ✅ Setup development environments
2. ✅ Add native platforms
3. ✅ Configure app metadata
4. ✅ Add required plugins
5. ✅ Test on real devices
6. ✅ Generate signed builds
7. ✅ Submit to app stores
8. 🎉 Launch native apps!

## Resources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Android Design Guidelines](https://developer.android.com/design)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policies](https://play.google.com/about/developer-content-policy/)

---

**Success!** Je PWA draait nu als native iOS en Android app! 📱🎉
