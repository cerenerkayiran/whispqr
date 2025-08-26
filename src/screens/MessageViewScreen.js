// Message View Screen - Real-time message management for hosts
// Displays all messages with real-time updates and management options

import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
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
    // In a real app, you'd show a confirmation dialog here
    // For now, we'll add a simple confirmation with a user feedback system [[memory:5180760]]
    try {
      const result = await deleteMessage(messageId);
      if (!result.success) {
        // Show error feedback in a professional way
        console.error('Failed to delete message:', result.error);
      }
    } catch (error) {
      console.error('Delete message error:', error);
    }
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

  // Render message item
  const renderMessageItem = ({ item }) => (
    <Card style={styles.messageCard} shadowType="sm">
      <View style={styles.messageHeader}>
        <View style={styles.messageInfo}>
          <View style={styles.messageMetadata}>
            <Text style={styles.messageTime}>
              {formatTimestamp(item.createdAt)}
            </Text>
            {!isGuest && (
              <View style={[
                styles.visibilityBadge,
                { backgroundColor: item.isPublic ? colors.success : colors.secondary }
              ]}>
                <Text style={[
                  styles.visibilityText,
                  { color: colors.textPrimary }
                ]}>
                  {item.isPublic ? '📢 Public' : '🔒 Private'}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        {!isGuest && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteMessage(item.id, item.content)}
          >
            <Text style={styles.deleteButtonText}>🗑️</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.messageContent}>{item.content}</Text>
    </Card>
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
        <Text style={styles.headerTitle}>
          {isGuest ? 'Public Messages' : 'Messages'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {eventName} • {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''}
          {isGuest ? ' from other attendees' : ''}
        </Text>
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
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  filterContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
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
  messageCard: {
    marginBottom: spacing.md,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  messageInfo: {
    flex: 1,
  },
  messageMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  messageTime: {
    fontSize: fontSize.xs,
    color: colors.textLight,
  },
  visibilityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  visibilityText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  deleteButton: {
    padding: spacing.sm,
    marginTop: -spacing.sm,
    marginRight: -spacing.sm,
  },
  deleteButtonText: {
    fontSize: 16,
  },
  messageContent: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    lineHeight: 22,
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