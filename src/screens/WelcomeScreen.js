// Welcome Screen - Landing page for whispqr app
// Provides options for hosts to login/signup and guests to scan QR codes

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Button from '../components/Button';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../utils/theme';
import guestsImage from '../../assets/guests.jpg';
import hostImage from '../../assets/host.jpg';

const WelcomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor={colors.background} />
      
      {/* Header with Back Button */}
      <View style={styles.headerRow}>
        <Button
          title="←"
          variant="ghost"
          size="small"
          onPress={() => navigation.navigate('Landing')}
          style={styles.backButton}
          textStyle={styles.backButtonText}
        />
        <Text style={styles.title}>whispqr</Text>
        <View style={styles.spacer} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.buttonsContainer}>
          {/* Join Event Button */}
                                <TouchableOpacity 
                        style={styles.squareButton}
                        onPress={() => navigation.navigate('QRScanner')}
                      >
                        <Image 
                          source={guestsImage}
                          style={styles.buttonBackgroundImage}
                          resizeMode="cover"
                        />
                        <View style={styles.buttonOverlay}>
                          <Text style={styles.buttonTitle}>Join an Event</Text>
                          <Text style={styles.buttonDescription}>
                            Scan QR & leave your mark invisibly
                          </Text>
                        </View>
                      </TouchableOpacity>

          {/* Host Event Button */}
                                <TouchableOpacity 
                        style={styles.squareButton}
                        onPress={() => navigation.navigate('Login')}
                      >
                        <Image 
                          source={hostImage}
                          style={styles.buttonBackgroundImage}
                          resizeMode="cover"
                        />
                        <View style={styles.buttonOverlay}>
                          <Text style={styles.buttonTitle}>Host an Event</Text>
                          <Text style={styles.buttonDescription}>
                            Create & lead the pixel party
                          </Text>
                        </View>
                      </TouchableOpacity>
        </View>
      </View>


    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    marginBottom: 0,
  },
  backButton: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs, 
  },
  backButtonText: {
    color: colors.primary,
    fontSize: fontSize.md,
  },
  spacer: {
    width: 40,
  },
  title: {
    fontSize: fontSize.xxxl + 12,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    letterSpacing: 1,
    textAlign: 'center',
    flex: 1,
  },
  subtitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.regular,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  decorativeElement: {
    width: 60,
    height: 4,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.full,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 0,
  },
  buttonsContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: spacing.xl,
    flex: 0,
    marginTop: spacing.xxl, 
  },
  squareButton: {
    width: 280,
    height: 280,
    borderRadius: borderRadius.lg,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  buttonContent: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  placeholderText: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    textAlign: 'center',
  },
  buttonBackgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  buttonOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  buttonTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textOnPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  buttonDescription: {
    fontSize: fontSize.sm,
    color: colors.textOnPrimary,
    textAlign: 'center',
    lineHeight: 16,
  },

});

export default WelcomeScreen; 