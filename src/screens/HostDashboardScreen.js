// Host Dashboard Screen - Main screen for authenticated hosts
// Shows list of events, provides navigation to create new events, and user management

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, RefreshControl, TouchableOpacity, Alert, Image } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useEvents } from '../hooks/useFirestore';
import Button from '../components/Button';
import Card from '../components/Card';
import AnimatedSplitText from '../components/AnimatedSplitText';
import TypewriterText from '../components/TypewriterText';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../utils/theme';

const HostDashboardScreen = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const { events, expiredEvents, loading, error, refreshEvents, deleteEvent } = useEvents(user?.uid);
  const [refreshing, setRefreshing] = useState(false);

  // Handle pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshEvents();
    setRefreshing(false);
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      // Navigation will be handled by App.js auth state change
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Render event item
  const renderEventItem = ({ item }) => (
    <Card
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventDetails', { eventId: item.id })}
      shadowType="md"
    >
      <View style={styles.eventHeader}>
        <Text style={styles.eventTitle} numberOfLines={2}>
          {item.name || 'Unnamed Event'}
        </Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.isActive ? colors.success : colors.textLight }
        ]}>
          <Text style={[
            styles.statusText,
            { color: item.isActive ? colors.textPrimary : colors.textOnPrimary }
          ]}>
            {item.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      {item.description && (
        <Text style={styles.eventDescription} numberOfLines={3}>
          {item.description}
        </Text>
      )}

      <View style={styles.eventFooter}>
        <Text style={styles.eventDate}>
          Created: {formatDate(item.createdAt)}
        </Text>
        <TouchableOpacity
          style={styles.viewMessagesButton}
          onPress={() => navigation.navigate('MessageView', { 
            eventId: item.id, 
            eventName: item.name 
          })}
        >
          <Text style={styles.viewMessagesText}>View Messages</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  // Render expired event item (read-only)
  const handleDeleteEvent = async (eventId, eventName) => {
    Alert.alert(
      'Delete Expired Event',
      `Are you sure you want to delete "${eventName}"? This action cannot be undone.`,
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
                // The event will be automatically removed from the list due to the state update in useEvents hook
                await refreshEvents();
              }
            } catch (error) {
              console.error('Error deleting event:', error);
              Alert.alert(
                'Error',
                'Failed to delete the event. Please try again.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };

  const renderExpiredEventItem = ({ item }) => (
    <Card style={[styles.eventCard, styles.expiredEventCard]} shadowType="sm">
      <View style={styles.eventHeader}>
        <Text style={[styles.eventTitle, styles.expiredEventTitle]} numberOfLines={2}>
          {item.name || 'Unnamed Event'}
        </Text>
        <View style={[styles.statusBadge, styles.expiredStatusBadge]}>
          <Text style={[styles.statusText, styles.expiredStatusText]}>
            Expired
          </Text>
        </View>
      </View>

      {item.description && (
        <Text style={[styles.eventDescription, styles.expiredEventDescription]} numberOfLines={3}>
          {item.description}
        </Text>
      )}

      <View style={styles.eventFooter}>
        <Text style={[styles.eventDate, styles.expiredEventDate]}>
          Created: {formatDate(item.createdAt)}
        </Text>
        <View style={styles.expiredEventActions}>
          <TouchableOpacity
            style={[styles.viewMessagesButton, styles.expiredViewMessagesButton]}
            onPress={() => navigation.navigate('MessageView', { 
              eventId: item.id, 
              eventName: item.name 
            })}
          >
            <Text style={[styles.viewMessagesText, styles.expiredViewMessagesText]}>View Messages</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.deleteButton]}
            onPress={() => handleDeleteEvent(item.id, item.name || 'Unnamed Event')}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No Events Yet</Text>
              <Text style={styles.emptyStateDescription}>
          Step one: create an event.{'\n'}Step two: watch the chaos.
        </Text>
    </View>
  );

  // Render error state
  const renderErrorState = () => (
    <View style={styles.errorState}>
      <Text style={styles.errorTitle}>Unable to Load Events</Text>
      <Text style={styles.errorDescription}>{error}</Text>
      <Button
        title="Try Again"
        variant="outline"
        onPress={refreshEvents}
        style={styles.errorButton}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.heroBackground}>
        <View style={styles.statusBarSpacer} />
      </SafeAreaView>
      <FlatList
        data={[]}
        keyExtractor={() => 'dummy'}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <>
            {/* Beautiful Header Section */}
            <View style={styles.heroSection}>
              <View style={styles.welcomeContainer}>
                <View style={styles.welcomeHeaderRow}>
                  <AnimatedSplitText
                    text="Welcome,"
                    style={styles.welcomeTitle}
                    delay={80}
                    duration={600}
                    splitType="chars"
                    from={{ opacity: 0, translateY: 30, scale: 0.8 }}
                    to={{ opacity: 1, translateY: 0, scale: 1 }}
                  />
                  <TouchableOpacity
                    style={styles.profileButton}
                    onPress={() => navigation.navigate('ProfileSettings')}
                  >
                    <Image 
                      source={require('../assets/images/profilebutton.jpg')}
                      style={styles.profileImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                </View>
                <AnimatedSplitText
                  text={user?.displayName || user?.email?.split('@')[0] || 'there'}
                  style={styles.userName}
                  delay={100}
                  duration={800}
                  splitType="chars"
                  from={{ opacity: 0, translateY: 40, scale: 0.5 }}
                  to={{ opacity: 1, translateY: 0, scale: 1 }}
                />
                <View style={styles.typewriterContainer}>
                  <TypewriterText
                    text={[
                      "You're the whisper keeper.",
                      "Set the stage, then let the whispers flow.",
                      "This isn't just an event, it's a carefully encrypted social experiment."
                    ]}
                    style={styles.welcomeSubtitle}
                    typingSpeed={60}
                    initialDelay={1800}
                    pauseDuration={2500}
                    deletingSpeed={30}
                    loop={true}
                    showCursor={true}
                    cursorCharacter="|"
                    cursorStyle={{ color: colors.primary }}
                  />
                </View>
              </View>

              {/* Custom Illustration */}
              <View style={styles.illustrationContainer}>
                <Image 
                  source={require('../assets/images/hostdashboard.jpg')}
                  style={styles.illustrationImage}
                  resizeMode="cover"
                />
              </View>
            </View>

            {/* Create Event Button */}
            <View style={styles.createEventSection}>
              <Button
                title="Create Event"
                variant="primary"
                onPress={() => navigation.navigate('CreateEvent')}
                style={styles.createEventButton}
              />
            </View>

            {/* Test Button - Remove this in production */}
            <View style={styles.testSection}>
              <Button
                title="Open Test QR Screen"
                onPress={() => navigation.navigate('TestQR')}
                style={styles.testButton}
              />
            </View>

            {/* Events Content */}
            {error && !error.toLowerCase().includes('index') ? (
              renderErrorState()
            ) : (
              <View style={styles.eventsContent}>
                {/* Active Events Section */}
                <View style={styles.eventsSection}>
                  {events.length === 0 ? (
                    renderEmptyState()
                  ) : (
                    events.map((item) => (
                      <View key={item.id} style={styles.eventItemWrapper}>
                        {renderEventItem({ item })}
                      </View>
                    ))
                  )}
                </View>

                {/* Expired Events Section */}
                {expiredEvents.length > 0 && (
                  <View style={styles.eventsSection}>
                    <Text style={[styles.sectionTitle, styles.expiredSectionTitle]}>
                      Expired Events
                    </Text>
                    <Text style={styles.expiredSectionDescription}>
                      These events are no longer accessible to guests
                    </Text>
                    {expiredEvents.map((item) => (
                      <View key={item.id} style={styles.eventItemWrapper}>
                        {renderExpiredEventItem({ item })}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 50, // Reduced height to not cover the content
    backgroundColor: colors.surface,
    zIndex: -1,
  },
  statusBarSpacer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  
  // Hero Section Styles
  heroSection: {
    backgroundColor: colors.surface,
    paddingTop: 100, // Even more padding to push content down further
    paddingBottom: spacing.sm, // Reduced from spacing.lg to spacing.md
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    marginBottom: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: spacing.md,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // Ensures image stays within circular bounds
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  welcomeContainer: {
    marginBottom: spacing.xl,
  },
  welcomeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 36, // Increased from fontSize.xxxl (32px) to 36px
    fontWeight: fontWeight.light,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  userName: {
    fontSize: 36, // Increased from fontSize.xxxl (32px) to 36px
    fontWeight: fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  welcomeSubtitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  typewriterContainer: {
    height: 80, // Increased height for more spacing
    justifyContent: 'center', // Center the text vertically in the larger container
    alignItems: 'flex-start',
  },
  
  // Illustration Styles
  illustrationContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  illustrationImage: {
    width: 320,
    height: 320,
    borderRadius: borderRadius.full,
  },
  
  // Action Button Styles
  createEventSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  createEventButton: {
    width: '100%',
    paddingVertical: spacing.md,
  },
  testSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  testButton: {
    width: '100%',
  },
  
  // Events Content Styles
  eventsContent: {
    paddingHorizontal: spacing.lg,
  },
  eventsSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  eventCard: {
    marginBottom: spacing.md,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  eventTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
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
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventDate: {
    fontSize: fontSize.xs,
    color: colors.textLight,
  },
  viewMessagesButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  viewMessagesText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyStateTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  emptyStateButton: {
    minWidth: 200,
  },
  errorState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  errorTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.error,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  errorButton: {
    minWidth: 120,
  },
  // Expired events styles
  eventItemWrapper: {
    marginBottom: spacing.md,
  },
  expiredSectionTitle: {
    marginTop: spacing.xl,
    color: colors.textSecondary,
  },
  expiredSectionDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  expiredEventCard: {
    opacity: 0.7,
    backgroundColor: colors.surfaceLight,
  },
  expiredEventTitle: {
    color: colors.textSecondary,
  },
  expiredStatusBadge: {
    backgroundColor: colors.textLight,
  },
  expiredStatusText: {
    color: colors.textOnPrimary,
  },
  expiredEventDescription: {
    color: colors.textSecondary,
  },
  expiredEventDate: {
    color: colors.textLight,
  },
  expiredViewMessagesButton: {
    backgroundColor: colors.border,
  },
  expiredViewMessagesText: {
    color: colors.textSecondary,
  },
  expiredEventActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  deleteButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.error,
    borderRadius: borderRadius.sm,
  },
  deleteButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textOnPrimary,
  },
});

export default HostDashboardScreen; 