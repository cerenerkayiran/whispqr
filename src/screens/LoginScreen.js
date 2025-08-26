// Login Screen - Host authentication
// Allows event hosts to sign in with email and password

import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import { colors, spacing, fontSize, fontWeight } from '../utils/theme';

const LoginScreen = ({ navigation }) => {
  const { signIn, resetPassword } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email field empty. Ghosting us?';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Bruh that’s not the email.';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'No password? Nice try';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Tiny password alert - think bigger, at least 6 chars.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login
  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const result = await signIn(formData.email.trim(), formData.password);
      
      if (!result.success) {
        // Handle specific Firebase auth errors with user-friendly messages
        let errorMessage = result.error;
        
        if (result.error.includes('user-not-found')) {
          errorMessage = 'Who dis? We don’t know that email';
        } else if (result.error.includes('wrong-password')) {
          errorMessage = 'Password says: ‘Try harder.’';
        } else if (result.error.includes('invalid-credential')) {
          // Newer Firebase error that can mean wrong email/password combination
          errorMessage = 'Wrong keys, wrong vibes';
        } else if (result.error.includes('invalid-email')) {
          errorMessage = 'We need a real email, not a love letter';
        } else if (result.error.includes('too-many-requests')) {
          errorMessage = 'Chill, FBI vibes detected. Try again later';
        }
        
        setErrors({ general: errorMessage });
      }
      // If successful, navigation will be handled by App.js auth state change
    } catch (error) {
      setErrors({ general: 'Well, that’s awkward. Try again.' });
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
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to manage your pixel playground</Text>
          </View>

          <Card style={styles.formCard}>
            {/* Hiding Cat Illustration */}
            <View style={styles.illustrationContainer}>
              <Image 
                source={require('../assets/images/hidingcat.png')}
                style={styles.illustrationImage}
                resizeMode="cover"
              />
            </View>

            {/* General Error Message */}
            {errors.general && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errors.general}</Text>
              </View>
            )}

            {/* Email Input */}
            <Input
              label="Email"
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            {/* Password Input */}
            <Input
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              error={errors.password}
              secureTextEntry
              autoComplete="password"
            />

            {/* Login Button */}
            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.loginButton}
            />

            {/* Navigation Links */}
            <View style={styles.linkContainer}>
              <Text style={styles.linkText}>
                Don't have an account?{' '}
                <Text
                  style={styles.link}
                  onPress={() => navigation.navigate('SignUp')}
                >
                  Create one
                </Text>
              </Text>
            </View>

            {/* Forgot Password */}
            <View style={styles.linkContainer}>
              <Text
                style={styles.link}
                onPress={async () => {
                  if (!formData.email.trim()) {
                    setErrors({ email: 'We can’t read minds. Enter email first.' });
                    return;
                  }

                  if (!/\S+@\S+\.\S+/.test(formData.email)) {
                    setErrors({ email: 'We need a real email, not a love letter' });
                    return;
                  }
                  
                  setLoading(true);
                  try {
                    const result = await resetPassword(formData.email.trim());
                    if (result.success) {
                      Alert.alert(
                        'Reset Email On the Way!',
                        'If an account exists with this email address, instructions will be sent! Email may be playing hide-and-seek in spam.',
                        [{ text: 'OK' }]
                      );
                      // Clear any existing errors
                      setErrors({});
                    } else {
                      // Show error in the error container instead of an alert
                      setErrors({ general: result.error });
                    }
                  } catch (error) {
                    console.error('Password reset error:', error);
                    setErrors({ general: 'Failed to send password reset email. Please try again.' });
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                Forgot Password?
              </Text>
            </View>
          </Card>

          {/* Guest Option */}
          <View style={styles.guestContainer}>
            <Text style={styles.guestText}>
              Just want to join an event?{' '}
              <Text
                style={styles.link}
                onPress={() => navigation.navigate('QRScanner')}
              >
                Scan QR Code
              </Text>
            </Text>
          </View>
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
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
    illustrationContainer: {
    alignItems: 'center',
    marginTop: -100,
    marginBottom: spacing.md,
    paddingTop: 0,
    width: '100%',
  },
  illustrationImage: {
    width: '100%',
    height: 200,
  },
  formCard: {
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
  loginButton: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  linkContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  linkText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  link: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  guestContainer: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  guestText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default LoginScreen; 