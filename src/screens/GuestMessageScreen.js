// Guest Message Screen - Anonymous message submission
// Allows guests to leave anonymous messages with privacy controls

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useEvent } from '../hooks/useFirestore';
import FirebaseService from '../utils/firebase';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import { colors, spacing, fontSize, fontWeight } from '../utils/theme';

const GuestMessageScreen = ({ navigation, route }) => {
  const { eventId } = route.params;
  const { event, loading: eventLoading, error: eventError } = useEvent(eventId);
  
  const [messageData, setMessageData] = useState({
    content: '',
    isPublic: true,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setMessageData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  // Validate message
  const validateMessage = () => {
    if (!messageData.content.trim()) {
      setError('Please enter a message');
      return false;
    }
    
    if (messageData.content.trim().length > 1000) {
      setError('Message must be less than 1000 characters');
      return false;
    }



    return true;
  };

  // Submit message
  const handleSubmitMessage = async () => {
    if (!validateMessage()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const message = {
        content: messageData.content.trim(),
        isPublic: event?.allowPublicMessages ? messageData.isPublic : false,
        timestamp: new Date().toISOString(),
        // Note: No user identification for true anonymity
      };

      const result = await FirebaseService.firestore.addMessage(eventId, message);

      if (result.success) {
        setSuccess(true);
        // Reset form
        setMessageData({
          content: '',
          isPublic: event?.allowPublicMessages ? true : false,
        });
      } else {
        setError(result.error || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle successful submission
  const handleContinue = () => {
    setSuccess(false);
    // Clear the form for potential new message
    setMessageData({
      content: '',
      isPublic: event?.allowPublicMessages ? true : false,
    });
  };

  // Handle leaving the event
  const handleLeave = () => {
    navigation.navigate('Welcome');
  };

  // Show loading state while event loads
  if (eventLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading event...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error if event not found
  if (eventError || !event) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Event Not Found</Text>
          <Text style={styles.errorDescription}>
            {eventError || 'This event may no longer be active or the QR code is invalid.'}
          </Text>
          <Button
            title="Try Another Event"
            variant="primary"
            onPress={() => navigation.navigate('QRScanner')}
            style={styles.errorButton}
          />
          <Button
            title="Back to Home"
            variant="outline"
            onPress={() => navigation.navigate('Welcome')}
            style={styles.errorButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Show success state
  if (success) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.successContainer}>
          <Card style={styles.successCard} backgroundColor={colors.surface}>
            <Text style={styles.successTitle}>Message Sent!</Text>
            <Text style={styles.successDescription}>
              Your anonymous message has been delivered to the event host
              {event?.allowPublicMessages && messageData.isPublic ? ' and is now visible to other attendees' : ''}.
            </Text>
            
            <View style={styles.successButtons}>
              <Button
                title="Send Another Message"
                variant="primary"
                onPress={handleContinue}
                style={styles.successButton}
              />
              {event?.allowPublicMessages && (
                <Button
                  title="View Messages"
                  variant="secondary"
                  onPress={() => navigation.navigate('MessageView', { 
                    eventId: eventId, 
                    eventName: event.name,
                    isGuest: true 
                  })}
                  style={styles.successButton}
                />
              )}
              <Button
                title="Leave Event"
                variant="outline"
                onPress={handleLeave}
                style={styles.successButton}
              />
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Main message form
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Event Header */}
          <Card style={styles.eventHeader}>
            <Text style={styles.eventTitle}>{event.name}</Text>
            {event.description && (
              <Text style={styles.eventDescription}>{event.description}</Text>
            )}
            {event.location && (
              <Text style={styles.eventLocation}>📍 {event.location}</Text>
            )}
            <Text style={styles.eventHost}>
              Hosted by {event.hostName || 'Unknown'}
            </Text>
          </Card>

          {/* Message Form */}
          <Card style={styles.messageForm}>
            <Text style={styles.formTitle}>Leave an Anonymous Message</Text>
            
            {/* Error Display */}
            {error && (
              <View style={styles.errorMessageContainer}>
                <Text style={styles.errorMessageText}>{error}</Text>
              </View>
            )}

            {/* Anonymous Name (Optional) */}
            {/* Message Content */}
            <Input
              label="Your Message *"
              placeholder="Share your thoughts, questions, or feedback..."
              value={messageData.content}
              onChangeText={(value) => handleInputChange('content', value)}
              multiline
              numberOfLines={4}
              maxLength={1000}
              helperText={`${messageData.content.length}/1000 characters`}
            />

            {/* Privacy Controls */}
            {event.allowPublicMessages ? (
              <View style={styles.privacyContainer}>
                <Text style={styles.privacyLabel}>Message Visibility</Text>
                <Text style={styles.privacyDescription}>
                  Choose who can see your message
                </Text>

                <View style={styles.privacyOptions}>
                  <Button
                    title="📢 Public (Everyone)"
                    variant={messageData.isPublic ? 'primary' : 'outline'}
                    size="small"
                    onPress={() => handleInputChange('isPublic', true)}
                    style={styles.privacyButton}
                  />
                  <Button
                    title="🔒 Private (Host Only)"
                    variant={!messageData.isPublic ? 'primary' : 'outline'}
                    size="small"
                    onPress={() => handleInputChange('isPublic', false)}
                    style={styles.privacyButton}
                  />
                </View>

                <Text style={styles.privacyHelperText}>
                  {messageData.isPublic 
                    ? 'Other attendees will be able to see this message'
                    : 'Only the event host will see this message'
                  }
                </Text>
              </View>
            ) : (
              <View style={styles.privacyNotice}>
                <Text style={styles.privacyNoticeText}>
                  🔒 This event accepts private messages only. Your message will only be visible to the host.
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              <Button
                title="Send Message"
                onPress={handleSubmitMessage}
                loading={loading}
                disabled={loading || !messageData.content.trim()}
                style={styles.submitButton}
              />
              
              {event?.allowPublicMessages && (
                <Button
                  title="View Messages"
                  variant="outline"
                  onPress={() => navigation.navigate('MessageView', { 
                    eventId: eventId, 
                    eventName: event.name,
                    isGuest: true 
                  })}
                  style={styles.viewMessagesButton}
                />
              )}
            </View>

            {/* Anonymous Notice */}
            <View style={styles.anonymousNotice}>
              <Text style={styles.anonymousText}>
                🔒 Your message is completely anonymous. No personal information is collected or stored.
              </Text>
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
  eventTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
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
    marginBottom: spacing.xs,
  },
  eventHost: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  messageForm: {
    marginBottom: spacing.lg,
  },
  formTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  errorMessageContainer: {
    backgroundColor: colors.error,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  errorMessageText: {
    color: colors.textOnPrimary,
    fontSize: fontSize.sm,
    textAlign: 'center',
    fontWeight: fontWeight.medium,
  },
  privacyContainer: {
    marginBottom: spacing.lg,
  },
  privacyLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  privacyDescription: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  privacyOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  privacyButton: {
    flex: 1,
  },
  privacyHelperText: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 16,
  },
  privacyNotice: {
    backgroundColor: colors.accent,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  privacyNoticeText: {
    fontSize: fontSize.xs,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 18,
  },
  actionButtonsContainer: {
    marginBottom: spacing.lg,
  },
  submitButton: {
    marginBottom: spacing.sm,
  },
  viewMessagesButton: {
    marginBottom: spacing.sm,
  },
  anonymousNotice: {
    backgroundColor: colors.accent,
    padding: spacing.md,
    borderRadius: 8,
  },
  anonymousText: {
    fontSize: fontSize.xs,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 18,
  },
  successContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  successCard: {
    alignItems: 'center',
  },
  successTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  successDescription: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  successButtons: {
    width: '100%',
  },
  successButton: {
    marginBottom: spacing.md,
  },
});

export default GuestMessageScreen; 