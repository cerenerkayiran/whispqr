# Quick Start Guide for whispqr Expo App

## Setup

### 1. Install Dependencies
```bash
# Install Expo CLI globally
npm install -g @expo/cli

# Install project dependencies
npm install
```

### 2. Configure Firebase

**Option 1: Environment Variables (Recommended)**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or use existing one
3. Enable **Authentication** (Email/Password)
4. Enable **Firestore Database**
5. Copy your web app config from Project Settings
6. Create a `.env` file in project root:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

**Option 2: Direct Config**
Update the `firebaseConfig` object in `src/utils/firebase.js` directly.

**Note**: The app runs in **demo mode** without Firebase warnings if no valid config is provided. You'll see a warning in the console explaining this.

### 3. Start Development
```bash
# Start the Expo development server
npx expo start

# Choose your platform:
# - Press 'i' for iOS Simulator
# - Press 'a' for Android Emulator  
# - Scan QR code with Expo Go app on your phone
```

## Testing on Your Phone

### Install Expo Go:
- **iOS**: [Download from App Store](https://apps.apple.com/app/expo-go/id982107779)
- **Android**: [Download from Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Test the App:
1. Open Expo Go app
2. Scan the QR code from your terminal
3. App will load on your device!

## Firebase Setup (Detailed)

### Firestore Security Rules:
In Firebase Console → Firestore → Rules, replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /events/{eventId} {
      allow read: if true;
      allow write: if request.auth != null && 
        (resource == null || request.auth.uid == resource.data.hostId);
      
      match /messages/{messageId} {
        allow read, write: if true;
      }
    }
  }
}
```

## User Flows to Test

### As a Host:
1. Open app → Tap "Create Host Account" 
2. Sign up with email/password
3. Create your first event
4. Share the QR code with friends
5. Manage the event

### As a Guest:
1. Open app → Tap "Scan QR Code"
2. Allow camera permission
3. Scan a host's QR code
4. Leave an anonymous message

## Common Issues & Solutions

### "Camera not working"
- QR scanning only works on real devices, not simulators
- Make sure camera permissions are granted

### "Firebase connection failed" or "Firebase not configured"
- Check your `.env` file has correct Firebase values
- Alternatively, update `firebaseConfig` in `src/utils/firebase.js` directly  
- Ensure Firestore and Auth are enabled in Firebase Console
- In demo mode, auth/database features won't work but the app won't crash

### "Expo start fails"
- Run `npx expo doctor` to check for issues
- Try `npx expo start --clear` to clear cache

---

** You're all set!** The app should now be running with full functionality. Test both host and guest flows to see the anonymous messaging in action! 