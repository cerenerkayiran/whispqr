// Landing Screen - First page users see when opening whispqr
// Simple introduction with app name, description, and continue button

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Button from '../components/Button';
import TypewriterText from '../components/TypewriterText';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../utils/theme';
import catImage from '../../assets/cat.jpg';

const LandingScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor={colors.background} />
      
      <View style={styles.content}>
        {/* App Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>whispqr</Text>
        </View>

        {/* Cat Illustration */}
        <View style={styles.illustrationContainer}>
          <Image 
            source={catImage}
            style={styles.catImage}
            resizeMode="contain"
          />
        </View>

        {/* Animated Description */}
        <View style={styles.descriptionContainer}>
          <TypewriterText
            text={[
              "Whisper your thoughts, without a trace.",
              "Secrets belong here, share freely.",
              "Join events, stay off the radar.",
              "Welcome to whispqr - where every whisper counts.",
              "No one knows it’s you ;)",
            ]}
            style={styles.description}
            typingSpeed={50}
            initialDelay={1000}
            pauseDuration={1800}
            deletingSpeed={25}
            showCursor={true}
            cursorCharacter="_"
            cursorStyle={styles.cursor}
            loop={true}
          />
        </View>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <Button
            title="I'm Ready"
            variant="primary"
            size="large"
            onPress={() => navigation.navigate('Welcome')}
            style={styles.continueButton}
          />
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Secure • Anonymous • Real-time
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: fontSize.xxxl + 12,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.md,
    letterSpacing: 1.5,
  },
  decorativeElement: {
    width: 80,
    height: 6,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.full,
  },
  illustrationContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.6, // Make it subtle
    zIndex: -1, // Put illustration behind everything
    transform: [{ translateX: 10 }],
    pointerEvents: 'none', // Make the view non-interactive
  },
  catImage: {
    width: 400,
    height: 400,
    marginBottom: spacing.xxl,
  },
  descriptionContainer: {
    marginBottom: spacing.xxl * 1.5,
    paddingHorizontal: spacing.lg,
    maxWidth: 340,
    height: 120,
    justifyContent: 'center',
    zIndex: 2,
  },
  description: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.regular,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 28,
  },
  cursor: {
    fontSize: fontSize.lg * 1.2,
    fontWeight: fontWeight.regular,
    color: colors.primary,
    marginLeft: 2,
    marginBottom: -2, 
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 280,
    marginTop: spacing.xxl * 4, 
  },
  continueButton: {
    width: '100%',
    paddingVertical: spacing.lg,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textLight,
    textAlign: 'center',
  },
});

export default LandingScreen;