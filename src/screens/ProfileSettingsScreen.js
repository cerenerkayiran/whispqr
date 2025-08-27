// Profile Settings Screen - Host profile management
// Allows hosts to edit name, email, and logout

import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../utils/theme';

const ProfileSettingsScreen = ({ navigation }) => {
  const { user, signOut, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isLoading, setIsLoading] = useState(false);

  // Handle save profile changes
  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Display name is required');
      return;
    }

    setIsLoading(true);
    try {
      // Update profile (you may need to implement updateProfile in AuthContext)
      if (updateProfile) {
        const result = await updateProfile({ displayName: displayName.trim() });
        if (result.success) {
          Alert.alert(
            'New name updated', 
            'Old you never existed',
            [
              {
                text: 'OK',
                onPress: () => navigation.goBack()
              }
            ]
          );
        } else {
          Alert.alert('Error', result.error || 'Failed to update profile. Please try again.');
        }
      } else {
        Alert.alert('Info', 'Profile update functionality will be implemented');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              // Navigation will be handled by App.js auth state change
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Display Name</Text>
            <Input
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Enter your display name"
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <Input
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.emailInput}
              editable={false} // Email changes might require re-authentication
            />
            <Text style={styles.inputNote}>
            Changing emails? Patience… it's coming soon.
            </Text>
          </View>

          <Button
            title="Save Changes"
            onPress={handleSaveProfile}
            loading={isLoading}
            style={styles.saveButton}
          />
        </View>

        {/* Account Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          
          <Button
            title="Sign Out"
            variant="outline"
            onPress={handleSignOut}
            style={styles.signOutButton}
            textStyle={styles.signOutButtonText}
          />
        </View>
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

  formSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl, // Added top padding since header was removed
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  input: {
    marginBottom: spacing.xs,
  },
  emailInput: {
    marginBottom: 0, // No margin for email input with note
  },
  inputNote: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    fontStyle: 'italic',
    marginTop: -spacing.xs, // Pull the note up closer to the input
  },
  saveButton: {
    marginTop: spacing.md,
  },
  actionsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  signOutButton: {
    borderColor: colors.error,
    backgroundColor: colors.error,
  },
  signOutButtonText: {
    color: colors.textOnPrimary,
  },
});

export default ProfileSettingsScreen;
