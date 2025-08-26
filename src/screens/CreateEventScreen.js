// Create Event Screen - Event creation for hosts
// Allows hosts to create new events with details and generate QR codes

import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, Image, Dimensions } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useEvents } from '../hooks/useFirestore';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import { colors, spacing, fontSize, fontWeight } from '../utils/theme';

const CreateEventScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { createEvent } = useEvents(user?.uid);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    allowPublicMessages: true,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Illustration config: keep full image visible and ensure it fits the screen
  const illustrationSource = require('../assets/images/create-event.jpg');
  const screenHeight = Dimensions.get('window').height;
  const illustrationMaxHeight = Math.min(240, Math.round(screenHeight * 0.28));

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Event name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Event name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Event name must be at least 3 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Event name must be less than 100 characters';
    }

    // Description validation (optional but with limits)
    if (formData.description.trim().length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    // Location validation (optional but with limits)
    if (formData.location.trim().length > 100) {
      newErrors.location = 'Location must be less than 100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle event creation
  const handleCreateEvent = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const eventData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        allowPublicMessages: formData.allowPublicMessages,
        hostName: user?.displayName || 'Unknown Host',
      };

      const result = await createEvent(eventData);
      
      if (result.success) {
        // Navigate to event details with the new event ID
        navigation.replace('EventDetails', { eventId: result.eventId });
      } else {
        setErrors({ general: result.error || 'Failed to create event' });
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={{
            ...styles.scrollContent,
            flexGrow: 1
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
          bounces={true}
        >
          <Card style={styles.formCard}>
            {/* Illustration */}
            <View style={styles.illustrationContainer}>
              <View style={[styles.illustrationWrapper, { height: illustrationMaxHeight }]}>
                <Image
                  source={illustrationSource}
                  style={styles.illustrationImage}
                  resizeMode="contain"
                  accessibilityLabel="Create event illustration"
                />
              </View>
            </View>

            {/* General Error Message */}
            {errors.general && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errors.general}</Text>
              </View>
            )}

            {/* Event Name Input */}
            <Input
              label="Event Name *"
              placeholder="Enter event name"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              error={errors.name}
              maxLength={100}
              helperText="This will be displayed to guests"
            />

            {/* Description Input */}
            <Input
              label="Description"
              placeholder="Describe your event (optional)"
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              error={errors.description}
              multiline
              numberOfLines={3}
              maxLength={500}
              helperText="Optional description to provide more context"
            />

            {/* Location Input */}
            <Input
              label="Location"
              placeholder="Event location (optional)"
              value={formData.location}
              onChangeText={(value) => handleInputChange('location', value)}
              error={errors.location}
              maxLength={100}
              helperText="Where is this event taking place?"
            />

            {/* Public Messages Toggle */}
            <View style={styles.toggleContainer}>
              <View style={styles.toggleHeader}>
                <Text style={styles.toggleLabel}>Message Visibility</Text>
                <Text style={styles.toggleDescription}>
                  Choose whether guests can send public messages or only private ones
                </Text>
              </View>

              <View style={styles.toggleOptions}>
                <Button
                  title="Allow Public Messages"
                  variant={formData.allowPublicMessages ? 'primary' : 'outline'}
                  size="small"
                  onPress={() => handleInputChange('allowPublicMessages', true)}
                  style={styles.toggleButton}
                />
                <Button
                  title="Private Only"
                  variant={!formData.allowPublicMessages ? 'primary' : 'outline'}
                  size="small"
                  onPress={() => handleInputChange('allowPublicMessages', false)}
                  style={styles.toggleButton}
                />
              </View>

              <Text style={styles.toggleHelperText}>
                {formData.allowPublicMessages 
                  ? 'Guests can choose to send public messages (visible to everyone) or private messages (host only)'
                  : 'All messages will be private and only visible to you (the host)'
                }
              </Text>
            </View>

            {/* Create Event Button */}
            <Button
              title="Create Event"
              onPress={handleCreateEvent}
              loading={loading}
              disabled={loading}
              style={styles.createButton}
            />

            {/* Info Section */}
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
              Create an event, share the code, and let your audience do what people do best: overshare anonymously.
              </Text>
            </View>

            {/* Bottom spacer to ensure button is accessible */}
            <View style={{ height: spacing.md }} />
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

  formCard: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  errorContainer: {
    backgroundColor: colors.error,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.textOnPrimary,
    fontSize: fontSize.sm,
    textAlign: 'center',
    fontWeight: fontWeight.medium,
  },
  toggleContainer: {
    marginBottom: spacing.lg,
  },
  toggleHeader: {
    marginBottom: spacing.md,
  },
  toggleLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  toggleDescription: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  toggleOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  toggleButton: {
    flex: 1,
  },
  toggleHelperText: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 16,
  },
  createButton: {
    marginBottom: spacing.lg,
  },
  infoContainer: {
    backgroundColor: colors.accent,
    padding: spacing.md,
    borderRadius: 8,
  },
  infoText: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 20,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  illustrationWrapper: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  illustrationImage: {
    width: '100%',
    height: '100%',
  },
  illustrationSubtext: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});

export default CreateEventScreen; 