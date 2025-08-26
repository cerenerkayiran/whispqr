// QR Scanner Screen - Allows guests to scan QR codes to join events (Expo version)
// Handles QR code scanning and validation for anonymous event access

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { parseEventUrl, isValidEventId, parseStringCode } from '../utils/qrCode';
import Button from '../components/Button';
import Card from '../components/Card';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../utils/theme';

const QRScannerScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualCode, setManualCode] = useState('');

  // Request camera permissions
  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  // Handle successful QR code scan
  const handleBarCodeScanned = async ({ type, data }) => {
    if (isProcessing || scanned) return; // Prevent multiple scans
    
    setScanned(true);
    setIsProcessing(true);
    setError('');

    try {
      console.log('Scanned QR Code:', data);

      // Parse the scanned URL to extract event ID
      const parseResult = parseEventUrl(data);
      
      if (!parseResult.success) {
        setError('Invalid QR code. Please scan a valid whispqr event QR code.');
        setTimeout(() => {
          resetScanner();
        }, 2000);
        return;
      }

      const eventId = parseResult.eventId;

      // Validate event ID format
      if (!isValidEventId(eventId)) {
        setError('Invalid event format. Please scan a valid whispqr event QR code.');
        setTimeout(() => {
          resetScanner();
        }, 2000);
        return;
      }

      // Navigate to guest message screen with event ID
      navigation.navigate('GuestMessage', { eventId });
      
    } catch (error) {
      console.error('QR scan error:', error);
      setError('Failed to process QR code. Please try again.');
      setTimeout(() => {
        resetScanner();
      }, 2000);
    }
  };

  // Handle manual code entry
  const handleManualCodeSubmit = async () => {
    if (!manualCode.trim()) {
      setError('Please enter a code');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // First try to parse as string code
      const stringResult = await parseStringCode(manualCode.trim());
      
      if (stringResult.success) {
        navigation.navigate('GuestMessage', { eventId: stringResult.eventId });
        return;
      }

      // If string code fails, try to parse as event ID directly
      if (isValidEventId(manualCode.trim())) {
        navigation.navigate('GuestMessage', { eventId: manualCode.trim() });
        return;
      }

      setError(stringResult.error || 'Invalid code. Please check and try again.');
      
    } catch (error) {
      console.error('Manual code error:', error);
      setError('Failed to process code. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset scanner state
  const resetScanner = () => {
    setScanned(false);
    setIsProcessing(false);
    setError('');
    setManualCode('');
  };

  // Handle manual retry
  const handleRetry = () => {
    resetScanner();
  };

  // Show permission request screen
  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Requesting camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show permission denied screen
  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionDescription}>
            whispqr needs camera access to scan QR codes. Please enable camera permission in your device settings.
          </Text>
          <Button
            title="Go to Settings"
            variant="primary"
            onPress={() => {
              // In a real app, you might open device settings
              // For now, just go back
              navigation.goBack();
            }}
            style={styles.permissionButton}
          />
          <Button
            title="Go Back"
            variant="outline"
            onPress={() => navigation.goBack()}
            style={styles.permissionButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {!isManualMode ? (
        <>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={styles.scanner}
            barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
          />
          
          {/* Scanner Overlay */}
          <View style={styles.overlay}>
            <View style={styles.overlayTop}>
              <Text style={styles.instructionTitle}>Scan QR Code</Text>
              <Text style={styles.instructionText}>
                Point your camera at the whispqr event QR code to join
              </Text>
            </View>

            <View style={styles.scannerFrame}>
              <View style={styles.scannerCorners}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>
            </View>

            <View style={styles.overlayBottom}>
              {error ? (
                <Card style={styles.errorCard} backgroundColor={colors.error}>
                  <Text style={styles.errorText}>{error}</Text>
                  <Button
                    title="Try Again"
                    variant="outline"
                    size="small"
                    onPress={handleRetry}
                    style={styles.retryButton}
                    textStyle={{ color: colors.textOnPrimary }}
                  />
                </Card>
              ) : isProcessing ? (
                <Card style={styles.processingCard} backgroundColor={colors.primary}>
                  <Text style={styles.processingText}>Processing QR Code...</Text>
                </Card>
              ) : (
                <Text style={styles.helpText}>
                  Make sure the QR code is fully visible and well-lit
                </Text>
              )}

              <View style={styles.bottomButtons}>
                <Button
                  title="Enter Code Manually"
                  variant="ghost"
                  onPress={() => setIsManualMode(true)}
                  style={styles.manualButton}
                  textStyle={{ color: colors.textOnPrimary }}
                />
                <Button
                  title="Cancel"
                  variant="ghost"
                  onPress={() => navigation.goBack()}
                  style={styles.cancelButton}
                  textStyle={{ color: colors.textOnPrimary }}
                />
              </View>
            </View>
          </View>
        </>
      ) : (
        /* Manual Code Entry Mode */
        <View style={styles.manualContainer}>
          <View style={styles.manualHeader}>
            <Text style={styles.instructionTitle}>Enter Event Code</Text>
            <Text style={styles.instructionText}>
              Type the 6-character code or event ID to join
            </Text>
          </View>

          <Card style={styles.manualForm}>
            <TextInput
              style={styles.codeInput}
              placeholder="Enter code (e.g., ABC123)"
              value={manualCode}
              onChangeText={setManualCode}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={20}
            />

            {error ? (
              <Text style={styles.manualErrorText}>{error}</Text>
            ) : null}

            <View style={styles.manualButtons}>
              <Button
                title="Join Event"
                variant="primary"
                onPress={handleManualCodeSubmit}
                loading={isProcessing}
                disabled={isProcessing || !manualCode.trim()}
                style={styles.joinButton}
              />
              <Button
                title="Scan QR Code Instead"
                variant="outline"
                onPress={() => {
                  setIsManualMode(false);
                  resetScanner();
                }}
                style={styles.scanButton}
              />
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => navigation.goBack()}
                style={styles.cancelButton}
              />
            </View>
          </Card>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.textPrimary,
  },
  scanner: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overlayTop: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  instructionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textOnPrimary,
    marginBottom: spacing.sm,
  },
  instructionText: {
    fontSize: fontSize.md,
    color: colors.textOnPrimary,
    textAlign: 'center',
    opacity: 0.9,
  },
  scannerFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  scannerCorners: {
    flex: 1,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: colors.accent,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  overlayBottom: {
    alignItems: 'center',
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    width: '100%',
  },
  errorCard: {
    marginBottom: spacing.lg,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.textOnPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  retryButton: {
    minWidth: 100,
    borderColor: colors.textOnPrimary,
  },
  processingCard: {
    marginBottom: spacing.lg,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
  },
  processingText: {
    fontSize: fontSize.sm,
    color: colors.textOnPrimary,
    textAlign: 'center',
    lineHeight: 20,
  },
  helpText: {
    fontSize: fontSize.sm,
    color: colors.textOnPrimary,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  cancelButton: {
    minWidth: 100,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
  },
  permissionText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  permissionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  permissionDescription: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  permissionButton: {
    marginBottom: spacing.md,
    minWidth: 200,
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: spacing.md,
  },
  manualButton: {
    minWidth: 150,
  },
  manualContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
  },
  manualHeader: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  manualForm: {
    width: '100%',
    maxWidth: 350,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  codeInput: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  manualErrorText: {
    fontSize: fontSize.sm,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  manualButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  joinButton: {
    flex: 1,
  },
  scanButton: {
    flex: 1,
  },
});

export default QRScannerScreen; 