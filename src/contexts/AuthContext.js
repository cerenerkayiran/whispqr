// Authentication Context - Manages user authentication state
// Provides auth context and hooks for Firebase authentication

import React, { useState, useEffect, createContext, useContext } from 'react';
import FirebaseService from '../utils/firebase';

// Create authentication context
const AuthContext = createContext({});

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Authentication provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Handle authentication state changes
  useEffect(() => {
    const unsubscribe = FirebaseService.auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sign in function - pass through Firebase result so callers can handle errors
  const signIn = async (email, password) => {
    const result = await FirebaseService.auth.signIn(email, password);
    return result;
  };

  // Sign up function - pass through result
  const signUp = async (email, password, displayName) => {
    const result = await FirebaseService.auth.signUp(email, password, displayName);
    return result;
  };

  // Sign out function - pass through result
  const signOut = async () => {
    const result = await FirebaseService.auth.signOut();
    return result;
  };

  // Reset password function - pass through result
  const resetPassword = async (email) => {
    const result = await FirebaseService.auth.resetPassword(email);
    return result;
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    const result = await FirebaseService.auth.updateProfile(profileData);
    
    // If update was successful, refresh the user state immediately
    if (result.success) {
      const currentUser = FirebaseService.auth.getCurrentUser();
      if (currentUser) {
        setUser({ ...currentUser }); // Trigger re-render with updated user data
      }
    }
    
    return result;
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;