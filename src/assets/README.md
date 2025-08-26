# App Illustrations

Place your iPad drawings here using the following naming convention:

## Naming Convention
- `landing-illustration.png` - Main landing page illustration
- `join-event-icon.png` - Join event section icon
- `host-event-icon.png` - Host event section icon
- `empty-events.png` - Empty state for events list
- `empty-messages.png` - Empty state for messages
- `success-check.png` - Success state illustration
- `error-state.png` - Error state illustration

## Guidelines
1. Save as PNG with transparent background
2. Use app color palette:
   - Primary: #89A8B2 (muted teal-gray)
   - Secondary: #B3C8CF (light blue-gray)
   - Surface: #E5E1DA (warm off-white)
   - Background: #F1F0E8 (very light warm white)

3. Recommended Sizes:
   - Large illustrations: 600x400px
   - Section icons: 200x200px
   - Small icons: 100x100px

## Usage
Import illustrations in components like this:
```javascript
import landingIllustration from '../assets/landing-illustration.png';
```

Then use in Image component:
```javascript
<Image 
  source={landingIllustration}
  style={styles.illustration}
  resizeMode="contain"
/>
```