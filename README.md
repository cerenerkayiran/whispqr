# 🐱 whispqr - Anonymous Event Messaging

A React Native app that lets hosts create events and collect anonymous messages via QR codes. WhispQR enables meaningful connections without the pressure of public identity-featuring a modern, mobile-friendly design with custom illustrations created by me.

## What It Does

whispqr creates a safe space for anonymous feedback and messages at events. Hosts create an event, share a QR code, and guests can leave messages without creating accounts or revealing their identity. Think anonymous suggestion box, but modern and mobile.

### Core Features

**For Hosts:**
- Create and manage events with unique QR codes
- View all messages in real-time
- Control message visibility (public/private)
- Clean dashboard with event analytics
- Profile management and settings

**For Guests:**
- Scan QR codes to join events instantly
- Leave anonymous messages without sign-up
- Choose message privacy level
- Simple, distraction free interface


## Technical Stack

- **Framework**: React Native with Expo SDK 49
- **Navigation**: React Navigation 6 with stack navigator
- **Authentication**: Firebase Auth for host accounts
- **Database**: Firebase Firestore with real-time updates
- **QR Handling**: expo-camera and react-native-qrcode-svg
- **Animations**: Custom split-text and typewriter components
- **State Management**: React Context API with custom hooks
- **Styling**: Custom theme system with design tokens

## Project Structure

```
whispqr/
├── App.js                          # Navigation and auth providers
├── src/
│   ├── components/                 # Reusable UI components
│   │   ├── Button.js              # Custom button variants
│   │   ├── Input.js               # Form inputs with validation
│   │   ├── Card.js                # Container component
│   │   ├── AnimatedSplitText.js   # Character-by-character animations
│   │   └── TypewriterText.js      # Typewriter text effect
│   ├── screens/                   # Application screens
│   │   ├── WelcomeScreen.js       # Landing page
│   │   ├── LoginScreen.js         # Host authentication
│   │   ├── SignUpScreen.js        # Host registration
│   │   ├── HostDashboardScreen.js # Event management hub
│   │   ├── CreateEventScreen.js   # Event creation form
│   │   ├── ProfileSettingsScreen.js # Host profile management
│   │   ├── EventDetailsScreen.js  # Individual event management
│   │   ├── QRScannerScreen.js     # QR code scanning
│   │   ├── GuestMessageScreen.js  # Anonymous message form
│   │   └── MessageViewScreen.js   # Message viewing and management
│   ├── contexts/
│   │   └── AuthContext.js         # Authentication state management
│   ├── hooks/
│   │   └── useFirestore.js        # Firebase operations
│   └── utils/
│       ├── firebase.js            # Firebase configuration and services
│       ├── theme.js               # Design system (colors, spacing, typography)
│       └── qrCode.js              # QR code generation utilities
```

## Getting Started

### Prerequisites

- Node.js 16 or higher
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app on your phone for testing
- Firebase project with Auth and Firestore enabled

### Installation

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd whispqr
   npm install
   ```

2. **Firebase setup**
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication (Email/Password provider)
   - Enable Firestore Database
   - Copy your web app config to `src/utils/firebase.js`

3. **Run the app**
   ```bash
   npx expo start
   ```
   Then scan the QR code with Expo Go or press 'i' for iOS simulator / 'a' for Android emulator.

### Firebase Security Rules

Add these rules to your Firestore database:

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

## How It Works

### Guest Experience
1. Scan a whispqr code at an event
2. Write an anonymous message
3. Choose if it should be public or host only
4. Submit and done, no account needed
5. Read the public messages

### Host Experience
1. Sign up and create an event
2. Share the generated QR code
3. Watch messages come in real-time
4. Manage events from the dashboard
5. Update profile settings as needed

## Key Features Explained

### Dashboard Design
The host dashboard features a clean design with:
- Custom animated welcome text that splits character by character
- Typewriter effect for messages
- Circular profile image with custom illustration
- Clean event management with active/expired event separation
- Pagination for expired events (shows 5 at a time with load more)

### Animation System
- **Split Text Animation**: Welcome messages animate character by character using React Native's Animated API
- **Typewriter Effect**: Rotating messages with realistic typing and deletion effects
- **Smooth Transitions**: All navigation and state changes include subtle animations

### Event Management
- Events expire after 48 hours automatically
- Hosts can view all messages or just public ones
- Real-time updates using Firestore listeners
- QR code generation

### Privacy Controls
- Guests choose message visibility without revealing identity
- Hosts can delete inappropriate messages
- No personal data collection from guests
- Secure authentication only for hosts

## Development Commands

```bash
# Start development
npx expo start

# Platform-specific
npx expo start --ios
npx expo start --android
npx expo start --web

# Clear cache if needed
npx expo start --clear

# Check for issues
npx expo doctor

# Update dependencies
npx expo install --fix
```

## Design System

The app uses a carefully crafted design system:

**Colors**: Muted teal palette with warm neutrals
- Primary: #89A8B2 (muted teal-gray)
- Background: #F1F0E8 (warm off-white)
- Surface: #E5E1DA (warm surface)
- Text: Various blue-gray shades for hierarchy

**Typography**: Clean, readable font stack with consistent sizing
**Spacing**: 8px-based system (xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, xxl: 48px)
**Animations**: Subtle motion that enhances rather than distracts

## Deployment

For production deployment:

1. Configure `app.json` with proper bundle identifiers and app store assets
2. Build with EAS: `npx eas build --platform all`
3. Submit to stores: `npx eas submit --platform all`

## Current Status

This is a fully functional MVP with:
- Complete host and guest user flows
- Real-time messaging with Firebase
- UI with custom animations
- Mobile optimized design
- Comprehensive error handling
- Profile management for hosts
- Event management

## Future Considerations

- Message reactions and threading
- Event analytics and insights
- Push notifications for new messages
- Message moderation tools
- Export functionality for hosts
- Advanced QR code customization
- Multi language support

## License

MIT License - see LICENSE file for details.

---

Built with React Native, Expo, and Firebase by Ceren Erkayiran.