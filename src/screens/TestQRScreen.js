import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Clipboard } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { colors, spacing, borderRadius, shadows } from '../utils/theme';

function TestQRScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [eventData, setEventData] = useState(null);

  // Generate a random event code
  const generateEventCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Calculate expiration time (48 hours from now)
  const calculateExpiration = () => {
    const now = new Date();
    const expiration = new Date(now.getTime() + (48 * 60 * 60 * 1000)); // 48 hours in milliseconds
    return expiration;
  };

  // Generate event data with expiration
  const generateEventData = () => {
    const expirationDate = calculateExpiration();
    return {
      id: `event-${Date.now()}`,
      name: 'Test Event',
      host: 'Test Host',
      code: generateEventCode(),
      createdAt: new Date().toISOString(),
      expiresAt: expirationDate.toISOString(),
      isActive: true
    };
  };

  // Format remaining time
  const getRemainingTime = (expiresAt) => {
    const now = new Date();
    const expiration = new Date(expiresAt);
    const diffHours = Math.floor((expiration - now) / (1000 * 60 * 60));
    const diffMinutes = Math.floor(((expiration - now) % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours <= 0 && diffMinutes <= 0) return 'Expired';
    return `${diffHours}h ${diffMinutes}m remaining`;
  };

  // Generate new event data
  const generateNew = () => {
    setIsLoading(true);
    setTimeout(() => {
      const newEventData = generateEventData();
      setEventData(newEventData);
      setIsLoading(false);
    }, 500);
  };

  // Initialize with event data
  useEffect(() => {
    generateNew();
  }, []);

  const copyCodeToClipboard = async () => {
    try {
      await Clipboard.setString(eventData.code);
      Alert.alert('Success', 'Event code copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy code:', error);
      Alert.alert('Error', 'Failed to copy event code');
    }
  };

  if (!eventData) return null;

  const remainingTime = getRemainingTime(eventData.expiresAt);
  const isExpired = remainingTime === 'Expired';

  return (
    <View style={styles.container}>
      <View style={styles.qrBox}>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : hasError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to generate QR code</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={generateNew}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.qrWrapper}>
            <QRCode
              value={`whispqr://event/${eventData.id}`}
              size={200}
              backgroundColor="white"
              color="black"
              onError={(error) => {
                console.error('QR Code Error:', error);
                setHasError(true);
              }}
            />
          </View>
        )}
      </View>
      
      {/* Event details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.eventId}>ID: {eventData.id}</Text>
        <Text style={[
          styles.expirationText,
          isExpired ? styles.expiredText : null
        ]}>
          {remainingTime}
        </Text>
      </View>

      {/* Event code with copy button */}
      <TouchableOpacity 
        style={styles.codeContainer}
        onPress={copyCodeToClipboard}
        activeOpacity={0.7}
      >
        <View style={styles.codeContent}>
          <Text style={styles.codeLabel}>Event Code:</Text>
          <Text style={styles.codeText}>{eventData.code}</Text>
        </View>
        <Text style={styles.copyHint}>Tap to copy</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button}
        onPress={generateNew}
      >
        <Text style={styles.buttonText}>Generate New QR Code</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, { marginTop: spacing.md }]}
        onPress={() => navigation.navigate('TestQRScanner')}
      >
        <Text style={styles.buttonText}>Open Scanner</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  qrBox: {
    backgroundColor: 'white',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    ...shadows.md,
    marginBottom: spacing.lg,
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrWrapper: {
    backgroundColor: 'white',
    padding: spacing.md,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: colors.error,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  retryText: {
    color: colors.textOnPrimary,
    fontSize: 14,
  },
  detailsContainer: {
    backgroundColor: 'white',
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    ...shadows.sm,
    marginBottom: spacing.md,
    width: '100%',
    alignItems: 'center',
  },
  eventId: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  expirationText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  expiredText: {
    color: colors.error,
  },
  codeContainer: {
    backgroundColor: 'white',
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    ...shadows.sm,
    marginBottom: spacing.lg,
    width: '100%',
    alignItems: 'center',
  },
  codeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  codeLabel: {
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  codeText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  copyHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.sm,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TestQRScreen;