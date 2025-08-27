// Main App.js - Entry point for whispqr React Native Expo app
// Handles navigation, authentication state, and app-wide providers

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';
import { TextEncoder, TextDecoder } from 'fast-text-encoding';
import { Buffer } from 'buffer';


// Set global TextEncoder and TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.Buffer = Buffer;

// Import Firebase service, auth context, and theme
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { colors } from './src/utils/theme';

// Import screens
import LandingScreen from './src/screens/LandingScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import HostDashboardScreen from './src/screens/HostDashboardScreen';
import CreateEventScreen from './src/screens/CreateEventScreen';
import EventDetailsScreen from './src/screens/EventDetailsScreen';
import QRScannerScreen from './src/screens/QRScannerScreen';
import GuestMessageScreen from './src/screens/GuestMessageScreen';
import MessageViewScreen from './src/screens/MessageViewScreen';
import ProfileSettingsScreen from './src/screens/ProfileSettingsScreen';
import TestQRScreen from './src/screens/TestQRScreen';
import TestQRScannerScreen from './src/screens/TestQRScannerScreen';

// Create navigation stack
const Stack = createStackNavigator();


const LoadingScreen = () => (
  <View style={{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  }}>
    <Text style={{
      fontSize: 18,
      color: colors.textSecondary,
      fontWeight: '500',
    }}>
      Loading whispqr...
    </Text>
  </View>
);

// Internal Navigation Component
const AppNavigator = () => {
  const { user, loading } = useAuth();

  // Show loading screen while checking auth state
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <StatusBar style="dark" backgroundColor={colors.background} />
      <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerStyle: {
                backgroundColor: colors.background,
                shadowColor: colors.primary,
                shadowOpacity: 0.1,
                shadowOffset: { width: 0, height: 1 },
                shadowRadius: 4,
                elevation: 4,
              },
              headerTintColor: colors.textPrimary,
              headerTitleStyle: {
                fontWeight: '600',
                fontSize: 18,
              },
              cardStyle: {
                backgroundColor: colors.background,
              },
              // Smooth transitions with subtle animations
              cardStyleInterpolator: ({ current, layouts }) => {
                return {
                  cardStyle: {
                    transform: [
                      {
                        translateX: current.progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [layouts.screen.width, 0],
                        }),
                      },
                    ],
                  },
                };
              },
            }}
          >
            {user ? (
              // Authenticated user flow (hosts)
              <>
                <Stack.Screen 
                  name="HostDashboard" 
                  component={HostDashboardScreen}
                  options={{ headerShown: false }}
                />
                <Stack.Screen 
                  name="CreateEvent" 
                  component={CreateEventScreen}
                  options={{ title: 'Create Event' }}
                />
                <Stack.Screen 
                  name="EventDetails" 
                  component={EventDetailsScreen}
                  options={{ title: 'Event Details' }}
                />
                <Stack.Screen 
                  name="ProfileSettings" 
                  component={ProfileSettingsScreen}
                  options={{ title: 'Profile Settings' }}
                />
              </>
            ) : (
              // Unauthenticated flow (guests and host login)
              <>
                <Stack.Screen 
                  name="Landing" 
                  component={LandingScreen}
                  options={{ headerShown: false }}
                />
                <Stack.Screen 
                  name="Welcome" 
                  component={WelcomeScreen}
                  options={{ headerShown: false }}
                />
                <Stack.Screen 
                  name="Login" 
                  component={LoginScreen}
                  options={{ title: 'Host Login' }}
                />
                <Stack.Screen 
                  name="SignUp" 
                  component={SignUpScreen}
                  options={{ title: 'Create Host Account' }}
                />
              </>
            )}
            
            {/* Guest flow screens - accessible regardless of auth state */}
            <Stack.Screen 
              name="QRScanner" 
              component={QRScannerScreen}
              options={{ 
                title: 'Scan QR Code',
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen 
              name="GuestMessage" 
              component={GuestMessageScreen}
              options={{ 
                title: 'Leave Message',
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen 
              name="MessageView" 
              component={MessageViewScreen}
              options={{ 
                title: 'Messages',
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen 
              name="TestQR" 
              component={TestQRScreen}
              options={{ 
                title: 'Test QR Code',
                unmountOnBlur: true
              }}
            />
            <Stack.Screen 
              name="TestQRScanner" 
              component={TestQRScannerScreen}
              options={{ title: 'Test QR Scanner' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
    </>
  );
};

// Main App component with AuthProvider wrapper
const App = () => {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
};

export default App; 