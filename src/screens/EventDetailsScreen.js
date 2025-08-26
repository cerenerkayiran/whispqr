// Remove TextEncoder polyfill and qrcode npm package usage
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, Clipboard, Share } from 'react-native';
import * as FileSystem from 'expo-file-system';
import QRCode from 'react-native-qrcode-svg';
import { useEvent, useEvents } from '../hooks/useFirestore';
import { useAuth } from '../contexts/AuthContext';
import { generateStringCode } from '../utils/qrCode';
import Button from '../components/Button';
import Card from '../components/Card';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../utils/theme';

const EventDetailsScreen = ({ navigation, route }) => {
  const { eventId } = route.params;
  const { user } = useAuth();
  const { event, loading, error, refreshEvent } = useEvent(eventId);
  const { deleteEvent } = useEvents(user?.uid);
  const [qrError, setQrError] = React.useState(false);
  const [qrRef, setQrRef] = React.useState(null);

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Share QR code as image
  const shareQRCode = async () => {
    if (qrRef) {
      try {
        qrRef.toDataURL(async (dataURL) => {
          try {
            // Create a temporary file for the QR code image
            const filename = `${event?.name || 'Event'}_QR.png`;
            const fileUri = `${FileSystem.documentDirectory}${filename}`;
            
            // Write the base64 data to a file
            await FileSystem.writeAsStringAsync(fileUri, dataURL, {
              encoding: FileSystem.EncodingType.Base64,
            });
            
            // Share the file
            const shareOptions = {
              title: `Join "${event?.name || 'Event'}" on whispqr`,
              message: `Scan this QR code to join "${event?.name || 'Event'}" and leave anonymous messages!\n\nOr use code: ${generateStringCode(eventId)}`,
              url: fileUri,
            };
            
            await Share.share(shareOptions);
            
            // Clean up the temporary file after sharing
            setTimeout(async () => {
              try {
                await FileSystem.deleteAsync(fileUri, { idempotent: true });
              } catch (cleanupError) {
                console.log('Cleanup error:', cleanupError);
              }
            }, 10000); // Clean up after 10 seconds
            
          } catch (fileError) {
            console.error('File sharing error:', fileError);
            // Fallback to text sharing
            shareTextOnly();
          }
        });
      } catch (error) {
        console.error('QR generation error:', error);
        shareTextOnly();
      }
    } else {
      shareTextOnly();
    }
  };

  // Fallback text-only sharing
  const shareTextOnly = () => {
    const shareOptions = {
      title: `Join "${event?.name || 'Event'}" on whispqr`,
      message: `Join "${event?.name || 'Event'}" on whispqr! Use code: ${generateStringCode(eventId)}`,
    };
    
    Share.share(shareOptions).catch((error) => {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share event details');
    });
  };

  // Handle event deletion with confirmation
  const handleDeleteEvent = () => {
    Alert.alert(
      'Delete Event',
      `Are you sure you want to delete "${event?.name || 'this event'}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteEvent(eventId);
              if (result.success) {
                Alert.alert('Success', 'Event deleted successfully', [
                  {
                    text: 'OK',
                    onPress: () => navigation.navigate('HostDashboard'),
                  },
                ]);
              } else {
                Alert.alert('Error', result.error || 'Failed to delete event');
              }
            } catch (error) {
              Alert.alert('Error', 'An unexpected error occurred');
              console.error('Delete event error:', error);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading event details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !event) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Event Not Found</Text>
          <Text style={styles.errorDescription}>
            {error || 'Unable to load event details.'}
          </Text>
          <Button
            title="Try Again"
            variant="outline"
            onPress={refreshEvent}
            style={styles.errorButton}
          />
          <Button
            title="Back to Dashboard"
            variant="primary"
            onPress={() => navigation.goBack()}
            style={styles.errorButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Event Header */}
        <Card style={styles.eventHeader}>
          <View style={styles.eventTitleRow}>
            <Text style={styles.eventTitle}>{event.name}</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: event.isActive ? colors.success : colors.textLight }
            ]}>
              <Text style={[
                styles.statusText,
                { color: event.isActive ? colors.textPrimary : colors.textOnPrimary }
              ]}>
                {event.isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>

          {event.description && (
            <Text style={styles.eventDescription}>{event.description}</Text>
          )}

          {event.location && (
            <Text style={styles.eventLocation}>📍 {event.location}</Text>
          )}

          <View style={styles.eventMeta}>
            <Text style={styles.eventDate}>
              Created: {formatDate(event.createdAt)}
            </Text>
            <Text style={styles.eventPrivacy}>
              {event.allowPublicMessages ? '📢 Public messages allowed' : '🔒 Private messages only'}
            </Text>
          </View>
        </Card>

        {/* Event Access Codes Section */}
        <Card style={styles.qrSection}>
          <Text style={styles.sectionTitle}>Event Access Code</Text>
          <Text style={styles.sectionDescription}>
            Share this code with your audience to let them join your event
          </Text>

          <View style={styles.qrCodeContainer}>
            <View style={{
              backgroundColor: 'white',
              padding: spacing.lg,
              borderRadius: 12,
              marginBottom: spacing.lg,
              width: 250,
              height: 250,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOpacity: 0.2,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 4,
              elevation: 4,
            }}>
              {qrError ? (
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: colors.error, marginBottom: spacing.md, textAlign: 'center' }}>
                    Failed to generate QR code
                  </Text>
                </View>
              ) : eventId ? (
                <View style={{
                  backgroundColor: 'white',
                  padding: spacing.md,
                }}>
                  <QRCode
                    value={generateStringCode(eventId)}
                    size={200}
                    backgroundColor="white"
                    color="black"
                    getRef={(c) => setQrRef(c)}
                    onError={(error) => {
                      console.error('QR Code Error:', error);
                      setQrError(true);
                    }}
                  />
                </View>
              ) : (
                <Text>Loading QR code...</Text>
              )}
            </View>
            <Text style={styles.qrCodeLabel}>QR Code</Text>
          </View>

          {/* Share Button - matching View Messages button structure */}
          <Card style={styles.actionsSection}>
            <View style={styles.actionButtons}>
              <Button
                title="Share QR Code"
                variant="primary"
                onPress={shareQRCode}
                style={styles.actionButton}
              />
            </View>
          </Card>

          {/* String Code */}
          <View style={styles.stringCodeContainer}>
            <Text style={styles.stringCodeLabel}>String Code</Text>
            <View style={styles.stringCodeWrapper}>
              <Text style={styles.stringCodeText}>{generateStringCode(eventId)}</Text>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => {
                  Clipboard.setString(generateStringCode(eventId));
                  Alert.alert('Copied!', 'String code copied to clipboard');
                }}
              >
                <Text style={styles.copyButtonText}>Copy</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.stringCodeDescription}>
              Guests can type this code to join your event
            </Text>
          </View>
        </Card>

        {/* Action Buttons */}
        <Card style={styles.actionsSection}>
          <Text style={[styles.sectionTitle, styles.manageEventTitle]}>Manage Event</Text>
          <View style={styles.actionButtons}>
            <Button
              title="View Messages"
              variant="primary"
              onPress={() => navigation.navigate('MessageView', { 
                eventId: eventId, 
                eventName: event.name 
              })}
              style={styles.actionButton}
            />
            <Button
              title="Delete Event"
              variant="outline"
              onPress={handleDeleteEvent}
              style={[styles.actionButton, styles.deleteButton]}
            />
          </View>
        </Card>

        {/* Instructions for Hosts */}
        <Card style={styles.instructionsSection} backgroundColor={colors.accent}>
          <Text style={styles.instructionTitle}>How to Use</Text>
          <View style={styles.instructionsList}>
            <Text style={styles.instructionItem}>
              1. Share the QR code above with your audience
            </Text>
            <Text style={styles.instructionItem}>
              2. Guests scan the code to join your event
            </Text>
            <Text style={styles.instructionItem}>
              3. They can leave anonymous messages immediately
            </Text>
            <Text style={styles.instructionItem}>
              4. View and manage all messages from "View Messages"
            </Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  errorTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.error,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorDescription: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  errorButton: {
    marginBottom: spacing.md,
    minWidth: 200,
  },
  eventHeader: {
    marginBottom: spacing.lg,
  },
  eventTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  eventTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  eventDescription: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  eventLocation: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  eventMeta: {
    gap: spacing.xs,
  },
  eventDate: {
    fontSize: fontSize.xs,
    color: colors.textLight,
  },
  eventPrivacy: {
    fontSize: fontSize.xs,
    color: colors.textLight,
  },
  qrSection: {
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  manageEventTitle: {
    marginBottom: spacing.lg,
  },
  sectionDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  qrCodeWrapper: {
    padding: spacing.md,
    backgroundColor: 'white',
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  qrCodeImage: {
    width: 200,
    height: 200,
  },
  qrCodeLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  stringCodeContainer: {
    alignItems: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  stringCodeLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  stringCodeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  stringCodeText: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    flex: 1,
  },
  copyButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
  },
  copyButtonText: {
    color: colors.textOnPrimary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  stringCodeDescription: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  qrCodeUrl: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  qrError: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  qrErrorText: {
    fontSize: fontSize.md,
    color: colors.error,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xs,
  },
  qrErrorDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  qrLoading: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingVertical: spacing.xl,
  },
  qrLoadingText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  qrActions: {
    width: '100%',
    gap: spacing.md,
  },
  shareButton: {
    width: '100%',
  },
  downloadButton: {
    width: '100%',
  },
  actionsSection: {
    marginBottom: spacing.sm,
  },
  actionButtons: {
    gap: spacing.md,
  },
  actionButton: {
    width: '100%',
  },
  deleteButton: {
    borderColor: colors.primary,
  },
  instructionsSection: {
    marginBottom: spacing.lg,
  },
  instructionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  instructionsList: {
    gap: spacing.sm,
  },
  instructionItem: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  qrTextContainer: {
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  qrTextLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  qrTextContent: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
});

export default EventDetailsScreen; 