// Host Dashboard Screen - Main screen for authenticated hosts
// Shows list of events, provides navigation to create new events, and user management

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, RefreshControl, TouchableOpacity, Alert, Image, Animated, PanResponder } from 'react-native';
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
        <View style={styles.eventTitleContainer}>
          <Text style={styles.eventTitle} numberOfLines={2}>
            {item.name || 'Unnamed Event'}
          </Text>
          {item.location && (
            <Text style={styles.eventLocation} numberOfLines={1}>
              at {item.location}
            </Text>
          )}
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.isActive ? colors.success : colors.textLight }
        ]}>
          <Text style={[
            styles.statusText,
            { color: item.isActive ? colors.textOnPrimary : colors.textOnPrimary }
          ]}>
            {item.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      {item.description && (
        <Text style={styles.eventDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      <TouchableOpacity
        onPress={() => navigation.navigate('MessageView', { 
          eventId: item.id, 
          eventName: item.name 
        })}
        style={styles.messageCountContainer}
      >
        <Text style={styles.messageCount}>View Messages</Text>
      </TouchableOpacity>
    </Card>
  );

  // Render expired event item (read-only)
  const handleDeleteEvent = async (eventId, eventName) => {
    Alert.alert(
      'Delete Expired Event',
      `Really destroy '${eventName}'? It won’t haunt anyone afterward.`,
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

  // Swipeable Expired Event Card Component
  const SwipeableExpiredEventCard = ({ item }) => {
    const translateX = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(1)).current;

    const panResponder = useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: (evt, gestureState) => {
          return Math.abs(gestureState.dx) > 20;
        },
        onPanResponderMove: (evt, gestureState) => {
          if (gestureState.dx < 0) {
            translateX.setValue(gestureState.dx);
          }
        },
        onPanResponderRelease: (evt, gestureState) => {
          if (gestureState.dx < -100) {
            // Swipe far enough - delete with confirmation
            Animated.parallel([
              Animated.timing(translateX, {
                toValue: -400,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              })
            ]).start(() => {
              handleDeleteEvent(item.id, item.name || 'Unnamed Event');
            });
          } else {
            // Snap back
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        },
      })
    ).current;

    return (
      <View style={styles.swipeContainer}>
        <View style={styles.deleteBackground}>
          <Text style={styles.deleteBackgroundText}>Delete</Text>
        </View>
        <Animated.View
          style={[
            styles.expiredEventCardContainer,
            {
              transform: [{ translateX }],
              opacity,
            },
          ]}
          {...panResponder.panHandlers}
        >
          <Card style={[styles.eventCard, styles.expiredEventCard]} shadowType="sm">
            <View style={styles.eventHeader}>
              <View style={styles.eventTitleContainer}>
                <Text style={[styles.eventTitle, styles.expiredEventTitle]} numberOfLines={2}>
                  {item.name || 'Unnamed Event'}
                </Text>
                {item.location && (
                  <Text style={[styles.eventLocation, styles.expiredEventLocation]} numberOfLines={1}>
                    at {item.location}
                  </Text>
                )}
              </View>
              <View style={[styles.statusBadge, styles.expiredStatusBadge]}>
                <Text style={[styles.statusText, styles.expiredStatusText]}>
                  Expired
                </Text>
              </View>
            </View>

            {item.description && (
              <Text style={[styles.eventDescription, styles.expiredEventDescription]} numberOfLines={2}>
                {item.description}
              </Text>
            )}

            <TouchableOpacity
              onPress={() => navigation.navigate('MessageView', { 
                eventId: item.id, 
                eventName: item.name 
              })}
              style={styles.messageCountContainer}
            >
              <Text style={[styles.messageCount, styles.expiredMessageCount]}>View Messages</Text>
            </TouchableOpacity>
          </Card>
        </Animated.View>
      </View>
    );
  };

  const renderExpiredEventItem = ({ item }) => (
    <SwipeableExpiredEventCard item={item} />
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
    height: 50,
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
    paddingTop: 100,
    paddingBottom: spacing.sm, 
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
    overflow: 'hidden', 
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
    fontSize: 36, 
    fontWeight: fontWeight.light,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  userName: {
    fontSize: 36,
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
    height: 80, 
    justifyContent: 'center', 
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
  eventTitleContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  eventTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    lineHeight: 22,
  },
  eventLocation: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    letterSpacing: 0.5,
  },
  eventDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  messageCountContainer: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
  },
  messageCount: {
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
    color: colors.textPrimary,
  },
  expiredSectionDescription: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  expiredEventCard: {
    opacity: 0.9,
    backgroundColor: colors.surface,
  },
  expiredEventTitle: {
    color: colors.textPrimary,
  },
  expiredStatusBadge: {
    backgroundColor: colors.textLight,
  },
  expiredStatusText: {
    color: colors.textOnPrimary,
  },
  expiredEventDescription: {
    color: colors.textPrimary,
  },
  expiredEventLocation: {
    color: colors.textSecondary,
  },
  expiredMessageCount: {
    color: colors.primary,
  },
  expiredEventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  swipeContainer: {
    marginBottom: spacing.md,
    position: 'relative',
  },
  expiredEventCardContainer: {
    backgroundColor: colors.background,
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
  },
  deleteBackgroundText: {
    color: colors.textOnPrimary,
    fontWeight: fontWeight.bold,
    fontSize: fontSize.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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