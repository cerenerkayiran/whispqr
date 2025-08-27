// Message View Screen - Real-time message management for hosts
// Displays all messages with real-time updates and management options

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, RefreshControl, TouchableOpacity, Animated, PanResponder, Alert } from 'react-native';
import { useMessages } from '../hooks/useFirestore';
import Button from '../components/Button';
import Card from '../components/Card';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../utils/theme';

const MessageViewScreen = ({ navigation, route }) => {
  const { eventId, eventName, isGuest = false } = route.params;
  const { messages, loading, error, deleteMessage } = useMessages(eventId, !isGuest); // isHost = !isGuest
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'public', 'private'

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    // The useMessages hook automatically handles real-time updates
    // Just reset the refreshing state after a short delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Handle message deletion with user confirmation
  const handleDeleteMessage = async (messageId, messageContent) => {
    const messagePreview = messageContent.length > 50 
      ? messageContent.substring(0, 50) + '...' 
      : messageContent;

    Alert.alert(
      'Obliterate this whisper?',
      `Destroy evidence? Are you sure?\n\n"${messagePreview}"`,
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
              const result = await deleteMessage(messageId);
              if (!result.success) {
                console.error('Failed to delete message:', result.error);
              }
            } catch (error) {
              console.error('Delete message error:', error);
            }
          },
        },
      ],
    );
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Unknown time';
    }
  };

  // Filter messages based on current filter
  const filteredMessages = messages.filter(message => {
    switch (filter) {
      case 'public':
        return message.isPublic;
      case 'private':
        return !message.isPublic;
      default:
        return true;
    }
  });

  // Swipeable Message Card Component
  const SwipeableMessageCard = ({ item }) => {
    const translateX = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(1)).current;

    const panResponder = useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: (evt, gestureState) => {
          return !isGuest && Math.abs(gestureState.dx) > 20;
        },
        onPanResponderMove: (evt, gestureState) => {
          if (!isGuest && gestureState.dx < 0) {
            translateX.setValue(gestureState.dx);
          }
        },
        onPanResponderRelease: (evt, gestureState) => {
          if (!isGuest) {
            if (gestureState.dx < -100) {
              // Swipe far enough - delete
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
                handleDeleteMessage(item.id, item.content);
              });
            } else {
              // Snap back
              Animated.spring(translateX, {
                toValue: 0,
                useNativeDriver: true,
              }).start();
            }
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
            styles.messageCardContainer,
            {
              transform: [{ translateX }],
              opacity,
            },
          ]}
          {...(isGuest ? {} : panResponder.panHandlers)}
        >
          <Card style={styles.messageCard} shadowType="md">
            <View style={styles.messageHeader}>
              <View style={styles.messageInfo}>
                <View style={styles.messageMetadata}>
                  <View style={styles.timestampContainer}>
                    <Text style={styles.messageTime}>
                      {formatTimestamp(item.createdAt)}
                    </Text>
                  </View>
                  {!isGuest && (
                    <View style={[
                      styles.visibilityBadge,
                      item.isPublic ? styles.publicBadge : styles.privateBadge
                    ]}>
                      <Text style={styles.visibilityText}>
                        {item.isPublic ? 'Public' : 'Private'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.messageContentContainer}>
              <Text style={styles.messageContent}>{item.content}</Text>
            </View>
            

          </Card>
        </Animated.View>
      </View>
    );
  };

  // Render message item
  const renderMessageItem = ({ item }) => (
    <SwipeableMessageCard item={item} />
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>
        {isGuest 
          ? 'No Public Messages Yet' 
          : (filter === 'all' ? 'No Messages Yet' : `No ${filter} Messages`)
        }
      </Text>
      <Text style={styles.emptyStateDescription}>
        {isGuest 
          ? 'Public messages from other attendees will appear here. Be the first to share your thoughts!'
          : (filter === 'all' 
            ? 'Messages from your audience will appear here in real-time.'
            : `Switch to "All" to see all messages, or wait for new ${filter} messages.`
          )
        }
      </Text>
    </View>
  );

  // Render error state
  const renderErrorState = () => (
    <View style={styles.errorState}>
      <Text style={styles.errorTitle}>Unable to Load Messages</Text>
      <Text style={styles.errorDescription}>{error}</Text>
      <Button
        title="Try Again"
        variant="outline"
        onPress={handleRefresh}
        style={styles.errorButton}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {isGuest ? 'Public Messages' : 'Event Whispers'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {eventName} • {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''}
            {isGuest ? ' from attendees' : ''}
          </Text>
        </View>
        {!loading && (
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live</Text>
          </View>
        )}
      </View>

      {/* Filter Controls - only show for hosts */}
      {!isGuest && (
        <View style={styles.filterContainer}>
          <View style={styles.filterButtons}>
            <Button
              title={`All (${messages.length})`}
              variant={filter === 'all' ? 'primary' : 'outline'}
              size="small"
              onPress={() => setFilter('all')}
              style={styles.filterButton}
            />
            <Button
              title={`Public (${messages.filter(m => m.isPublic).length})`}
              variant={filter === 'public' ? 'primary' : 'outline'}
              size="small"
              onPress={() => setFilter('public')}
              style={styles.filterButton}
            />
            <Button
              title={`Private (${messages.filter(m => !m.isPublic).length})`}
              variant={filter === 'private' ? 'primary' : 'outline'}
              size="small"
              onPress={() => setFilter('private')}
              style={styles.filterButton}
            />
          </View>
        </View>
      )}

      {/* Messages List */}
      {error ? (
        renderErrorState()
      ) : (
        <FlatList
          data={filteredMessages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.messagesList,
            filteredMessages.length === 0 && styles.emptyListContent
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textOnPrimary,
    marginRight: spacing.xs,
  },
  liveText: {
    fontSize: fontSize.xs,
    color: colors.textOnPrimary,
    fontWeight: fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterButton: {
    flex: 1,
  },
  messagesList: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  swipeContainer: {
    marginBottom: spacing.lg,
    position: 'relative',
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
  messageCardContainer: {
    backgroundColor: colors.background,
  },
  messageCard: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  messageInfo: {
    flex: 1,
  },
  messageMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  timestampContainer: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  messageTime: {
    fontSize: fontSize.xs,
    color: colors.textOnPrimary,
    fontWeight: fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  visibilityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  publicBadge: {
    backgroundColor: colors.primary,
  },
  privateBadge: {
    backgroundColor: colors.error,
  },
  visibilityText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textOnPrimary,
  },

  messageContentContainer: {
    paddingLeft: spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  messageContent: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    lineHeight: 24,
    letterSpacing: 0.2,
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
    paddingHorizontal: spacing.md,
  },
  errorState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
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
});

export default MessageViewScreen; 