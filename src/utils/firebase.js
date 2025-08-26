// Firebase configuration and initialization for Expo
// Handles Firebase Auth and Firestore setup for whispqr app

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, initializeAuth, getReactNativePersistence, sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore, collection, addDoc, doc, getDoc, getDocs, query, where, orderBy, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateStringCode } from './qrCode';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAhEJVxVCM-f-cpa8Yk7eaDYGhhpX-Rvr0",
  authDomain: "whispqr.firebaseapp.com",
  projectId: "whispqr",
  storageBucket: "whispqr.firebasestorage.app",
  messagingSenderId: "856919905995",
  appId: "1:856919905995:web:d1605235b73afff6702d4e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
const db = getFirestore(app);

// Export Firebase services
export { auth, db };

// Firebase utility functions for the app
export const FirebaseService = {
  // Authentication helpers
  auth: {
    // Sign in with email and password (for hosts)
    signIn: async (email, password) => {
      if (!auth) {
        return { success: false, error: 'Firebase not configured. Please set up your Firebase project.' };
      }
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Sign up with email and password (for hosts)
    signUp: async (email, password, displayName) => {
      if (!auth || !db) {
        return { success: false, error: 'Firebase not configured. Please set up your Firebase project.' };
      }
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update user profile with display name
        await updateProfile(userCredential.user, {
          displayName: displayName,
        });

        // Create user document in Firestore
        await addDoc(collection(db, 'users'), {
          uid: userCredential.user.uid,
          email: email,
          displayName: displayName,
          createdAt: serverTimestamp(),
          isHost: true,
        });

        return { success: true, user: userCredential.user };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Sign out
    signOut: async () => {
      if (!auth) {
        return { success: false, error: 'Firebase not configured. Please set up your Firebase project.' };
      }
      try {
        await signOut(auth);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Get current user
    getCurrentUser: () => {
      return auth ? auth.currentUser : null;
    },

    // Listen to auth state changes
    onAuthStateChanged: (callback) => {
      if (!auth) {
        // In demo mode, immediately call callback with null user
        callback(null);
        return () => {}; // Return empty unsubscribe function
      }
      return onAuthStateChanged(auth, callback);
    },

    // Reset password
    resetPassword: async (email) => {
      console.log('Starting password reset process...');
      if (!auth) {
        console.error('Auth is not initialized!');
        return { success: false, error: 'Firebase not configured. Please set up your Firebase project.' };
      }
      try {
        console.log('Auth is initialized. Attempting to send password reset email to:', email);
        console.log('Current auth state:', auth.currentUser ? 'User is signed in' : 'No user signed in');
        
        await sendPasswordResetEmail(auth, email, {
          url: 'https://whispqr.firebaseapp.com', // Add your domain here
          handleCodeInApp: false,
        });
        
        console.log('Password reset email sent successfully');
        return { success: true };
      } catch (error) {
        console.error('Detailed error information:', {
          code: error.code,
          message: error.message,
          fullError: error
        });
        
        // Provide more specific error messages
        if (error.code === 'auth/user-not-found') {
          return { success: false, error: 'No account exists with this email address.' };
        } else if (error.code === 'auth/invalid-email') {
          return { success: false, error: 'Please enter a valid email address.' };
        } else if (error.code === 'auth/too-many-requests') {
          return { success: false, error: 'Too many attempts. Please try again later.' };
        } else if (error.code === 'auth/operation-not-allowed') {
          console.error('Email/Password authentication is not enabled in Firebase Console');
          return { success: false, error: 'Password reset is not enabled. Please contact support.' };
        }
        return { success: false, error: `${error.message} (Code: ${error.code})` };
      }
    },

    // Update user profile
    updateProfile: async (profileData) => {
      if (!auth) {
        return { success: false, error: 'Firebase not configured. Please set up your Firebase project.' };
      }
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          return { success: false, error: 'No user is currently signed in.' };
        }

        await updateProfile(currentUser, profileData);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
  },

  // Firestore helpers
  firestore: {
    // Create a new event
    createEvent: async (hostId, eventData) => {
      if (!db) {
        return { success: false, error: 'Firebase not configured. Please set up your Firebase project.' };
      }
      try {
        // First create the event to get the event ID
        const eventRef = await addDoc(collection(db, 'events'), {
          ...eventData,
          hostId: hostId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isActive: true,
        });

        // Generate string code using the event ID and update the document
        const stringCode = generateStringCode(eventRef.id);
        await updateDoc(eventRef, {
          stringCode: stringCode
        });

        return { success: true, eventId: eventRef.id };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Get event by ID
    getEvent: async (eventId) => {
      if (!db) {
        return { success: false, error: 'Firebase not configured. Please set up your Firebase project.' };
      }
      try {
        const eventDoc = await getDoc(doc(db, 'events', eventId));

        if (eventDoc.exists()) {
          const eventData = eventDoc.data();
          
          // Check if event is manually deleted
          if (eventData.isDeleted) {
            return { success: false, error: 'Event not found' };
          }
          
          // Check if event is older than 48 hours
          const now = new Date();
          const eventTime = eventData.createdAt?.toDate?.() || new Date(eventData.createdAt) || new Date(0);
          const hoursSinceCreation = (now.getTime() - eventTime.getTime()) / (1000 * 60 * 60);
          
          if (hoursSinceCreation > 48) {
            return { success: false, error: 'Event has expired' };
          }
          
          return { success: true, event: { id: eventId, ...eventData } };
        } else {
          return { success: false, error: 'Event not found' };
        }
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Get events for a host
    getHostEvents: async (hostId) => {
      if (!db) {
        return { success: false, error: 'Firebase not configured. Please set up your Firebase project.' };
      }
      try {
        const q = query(
          collection(db, 'events'),
          where('hostId', '==', hostId)
        );
        const eventsSnapshot = await getDocs(q);

        const events = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Filter out manually deleted events
        const nonDeletedEvents = events.filter(event => !event.isDeleted);

        // Separate active and expired events
        const now = new Date();
        const activeEvents = [];
        const expiredEvents = [];

        nonDeletedEvents.forEach(event => {
          const eventTime = event.createdAt?.toDate?.() || new Date(event.createdAt) || new Date(0);
          const hoursSinceCreation = (now.getTime() - eventTime.getTime()) / (1000 * 60 * 60);
          
          if (hoursSinceCreation <= 48) {
            activeEvents.push(event);
          } else {
            expiredEvents.push(event);
          }
        });

        // Sort both arrays by createdAt (newest first)
        const sortedActiveEvents = activeEvents.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
          const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
          return bTime.getTime() - aTime.getTime();
        });

        const sortedExpiredEvents = expiredEvents.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
          const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
          return bTime.getTime() - aTime.getTime();
        });

        return { 
          success: true, 
          events: sortedActiveEvents,
          expiredEvents: sortedExpiredEvents
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Find event by string code
    findEventByStringCode: async (stringCode) => {
      if (!db) {
        return { success: false, error: 'Firebase not configured. Please set up your Firebase project.' };
      }
      try {
        const q = query(
          collection(db, 'events'),
          where('stringCode', '==', stringCode.toUpperCase()),
          where('isActive', '==', true)
        );
        const eventsSnapshot = await getDocs(q);

        if (eventsSnapshot.empty) {
          return { success: false, error: 'Event not found' };
        }

        // Filter out deleted events and expired events
        const now = new Date();
        const activeEvents = eventsSnapshot.docs.filter(doc => {
          const eventData = doc.data();
          
          // Filter out manually deleted events
          if (eventData.isDeleted) return false;
          
          // Filter out events older than 48 hours
          const eventTime = eventData.createdAt?.toDate?.() || new Date(eventData.createdAt) || new Date(0);
          const hoursSinceCreation = (now.getTime() - eventTime.getTime()) / (1000 * 60 * 60);
          
          return hoursSinceCreation <= 48;
        });
        
        if (activeEvents.length === 0) {
          return { success: false, error: 'Event not found or has expired' };
        }

        const eventDoc = activeEvents[0];
        return { 
          success: true, 
          eventId: eventDoc.id,
          event: { id: eventDoc.id, ...eventDoc.data() }
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Add a message to an event
    addMessage: async (eventId, messageData) => {
      if (!db) {
        return { success: false, error: 'Firebase not configured. Please set up your Firebase project.' };
      }
      try {
        const messageRef = await addDoc(collection(db, 'events', eventId, 'messages'), {
          ...messageData,
          createdAt: serverTimestamp(),
          isDeleted: false,
        });

        return { success: true, messageId: messageRef.id };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Get messages for an event
    getEventMessages: async (eventId, isHost = false) => {
      try {
        let q = query(
          collection(db, 'events', eventId, 'messages'),
          where('isDeleted', '==', false)
        );

        // If not host, only show public messages
        if (!isHost) {
          q = query(
            collection(db, 'events', eventId, 'messages'),
            where('isDeleted', '==', false),
            where('isPublic', '==', true)
          );
        }

        const messagesSnapshot = await getDocs(q);
        
        const messages = messagesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Sort by createdAt in JavaScript (newest first)
        const sortedMessages = messages.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
          const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
          return bTime.getTime() - aTime.getTime();
        });

        return { success: true, messages: sortedMessages };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Listen to real-time message updates
    listenToMessages: (eventId, isHost = false, callback) => {
      if (!db) {
        callback({ success: false, error: 'Firebase not configured. Please set up your Firebase project.' });
        return () => {}; // Return empty unsubscribe function
      }
      let q = query(
        collection(db, 'events', eventId, 'messages'),
        where('isDeleted', '==', false)
      );

      // If not host, only show public messages
      if (!isHost) {
        q = query(
          collection(db, 'events', eventId, 'messages'),
          where('isDeleted', '==', false),
          where('isPublic', '==', true)
        );
      }

      return onSnapshot(
        q,
        (snapshot) => {
          const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          // Sort by createdAt in JavaScript (newest first)
          const sortedMessages = messages.sort((a, b) => {
            const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
            const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
            return bTime.getTime() - aTime.getTime();
          });
          
          callback({ success: true, messages: sortedMessages });
        },
        (error) => {
          callback({ success: false, error: error.message });
        }
      );
    },

    // Delete a message (soft delete)
    deleteMessage: async (eventId, messageId) => {
      try {
        await updateDoc(doc(db, 'events', eventId, 'messages', messageId), {
          isDeleted: true,
          deletedAt: serverTimestamp(),
        });

        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Update event status
    updateEventStatus: async (eventId, isActive) => {
      try {
        await updateDoc(doc(db, 'events', eventId), {
          isActive: isActive,
          updatedAt: serverTimestamp(),
        });

        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Delete event (soft delete)
    deleteEvent: async (eventId) => {
      try {
        await updateDoc(doc(db, 'events', eventId), {
          isDeleted: true,
          deletedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
  },
};

export default FirebaseService; 