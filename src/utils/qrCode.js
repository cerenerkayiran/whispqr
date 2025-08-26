// QR Code utility functions for Expo
// Handles QR code generation and URL creation for event sharing

// Note: For QR code generation in Expo, we'll use react-native-qrcode-svg
// The actual QR code rendering will be done in components using QRCode from 'react-native-qrcode-svg'

// Generate QR code configuration for an event
export const generateQRCodeConfig = (eventId, options = {}) => {
  const {
    size = 200,
    backgroundColor = 'white',
    color = 'black',
    logo = null,
    logoSize = 30,
  } = options;

  try {
    // Create the URL that guests will scan
    const eventUrl = createEventUrl(eventId);
    
    // Generate a short string code for easy typing
    const stringCode = generateStringCode(eventId);
    
    return {
      success: true,
      config: {
        value: eventUrl,
        size,
        backgroundColor,
        color,
        logo,
        logoSize,
      },
      url: eventUrl,
      stringCode: stringCode,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// Legacy function name for backward compatibility
export const generateQRCode = generateQRCodeConfig;

// Create event URL for QR code
export const createEventUrl = (eventId) => {
  // In a real app, this would be your app's deep link or web URL
  // For now, we'll use a simple format that the app can handle
  return `whispqr://event/${eventId}`;
};

// Parse event ID from scanned URL
export const parseEventUrl = (url) => {
  try {
    // Handle whispqr:// deep links
    if (url.startsWith('whispqr://event/')) {
      const eventId = url.replace('whispqr://event/', '');
      if (eventId && eventId.length > 0) {
        return {
          success: true,
          eventId: eventId,
        };
      }
    }

    // Handle HTTP/HTTPS URLs with event parameter
    const urlObj = new URL(url);
    const eventId = urlObj.searchParams.get('event') || urlObj.pathname.split('/').pop();
    
    if (eventId && eventId.length > 0) {
      return {
        success: true,
        eventId: eventId,
      };
    }

    return {
      success: false,
      error: 'Invalid event URL format',
    };
  } catch (error) {
    return {
      success: false,
      error: 'Unable to parse event URL',
    };
  }
};

// Validate event ID format
export const isValidEventId = (eventId) => {
  // Basic validation - adjust based on your Firestore document ID format
  if (!eventId || typeof eventId !== 'string') {
    return false;
  }
  
  // Check length (Firestore auto-generated IDs are typically 20 characters)
  if (eventId.length < 10 || eventId.length > 30) {
    return false;
  }
  
  // Check for valid characters (alphanumeric)
  const validCharacters = /^[a-zA-Z0-9]+$/;
  return validCharacters.test(eventId);
};

// Generate shareable text for events
export const generateShareText = (eventName, eventId) => {
  const eventUrl = createEventUrl(eventId);
  return `Join "${eventName}" on whispqr! Scan this QR code or visit: ${eventUrl}`;
};

// Generate a short string code for an event
export const generateStringCode = (eventId) => {
  // Create a hash from the eventId to generate a consistent code
  let hash = 0;
  for (let i = 0; i < eventId.length; i++) {
    const char = eventId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to a 6-character alphanumeric code
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  const absHash = Math.abs(hash);
  
  for (let i = 0; i < 6; i++) {
    const index = (absHash + i * 7) % chars.length;
    code += chars[index];
  }
  
  return code;
};

// Parse string code to get event ID (reverse lookup)
export const parseStringCode = async (stringCode) => {
  // Import Firebase service here to avoid circular dependencies
  const { default: FirebaseService } = await import('./firebase');
  
  try {
    // Clean and validate the string code
    const cleanCode = stringCode.trim().toUpperCase();
    if (!cleanCode || cleanCode.length !== 6) {
      return {
        success: false,
        error: 'Invalid code format. Please enter a 6-character code.',
      };
    }

    // Look up the event in Firestore
    const result = await FirebaseService.firestore.findEventByStringCode(cleanCode);
    
    if (result.success) {
      return {
        success: true,
        eventId: result.eventId,
        event: result.event,
      };
    } else {
      return {
        success: false,
        error: 'Invalid code. Please check and try again.',
      };
    }
  } catch (error) {
    console.error('String code lookup error:', error);
    return {
      success: false,
      error: 'Failed to validate code. Please try again.',
    };
  }
};

// QR Code styling options for different themes
export const qrCodeStyles = {
  // Primary theme with app colors
  primary: {
    backgroundColor: '#FDFCFC', // colors.background
    color: '#E8B4E3', // colors.primary
    size: 200,
  },
  
  // High contrast for better scanning
  highContrast: {
    backgroundColor: 'white',
    color: 'black',
    size: 200,
  },
  
  // Secondary theme
  secondary: {
    backgroundColor: '#F8F6F8', // colors.surface
    color: '#B4D8F0', // colors.secondary
    size: 200,
  },
  
  // Large size for printing
  large: {
    backgroundColor: 'white',
    color: 'black',
    size: 400,
  },
  
  // Small size for inline display
  small: {
    backgroundColor: 'white',
    color: 'black',
    size: 120,
  },
}; 