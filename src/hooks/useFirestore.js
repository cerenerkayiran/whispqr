// Custom hook for Firestore operations
// Provides stateful logic for Firebase Firestore interactions with real-time updates

import { useState, useEffect, useCallback } from 'react';
import FirebaseService from '../utils/firebase';

// Hook for managing events
export const useEvents = (hostId = null) => {
  const [events, setEvents] = useState([]);
  const [expiredEvents, setExpiredEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load events for a specific host
  const loadEvents = useCallback(async () => {
    if (!hostId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await FirebaseService.firestore.getHostEvents(hostId);
      if (result.success) {
        setEvents(result.events);
        setExpiredEvents(result.expiredEvents || []);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [hostId]);

  // Create a new event
  const createEvent = useCallback(async (eventData) => {
    if (!hostId) return { success: false, error: 'No host ID provided' };
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await FirebaseService.firestore.createEvent(hostId, eventData);
      if (result.success) {
        // Reload events to get the updated list
        await loadEvents();
      } else {
        setError(result.error);
      }
      return result;
    } catch (err) {
      const error = err.message;
      setError(error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [hostId, loadEvents]);

  // Update event status
  const updateEventStatus = useCallback(async (eventId, isActive) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await FirebaseService.firestore.updateEventStatus(eventId, isActive);
      if (result.success) {
        // Update local state
        setEvents(prevEvents => 
          prevEvents.map(event => 
            event.id === eventId 
              ? { ...event, isActive, updatedAt: new Date() }
              : event
          )
        );
      } else {
        setError(result.error);
      }
      return result;
    } catch (err) {
      const error = err.message;
      setError(error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, []);

  // Load events when hostId changes
  useEffect(() => {
    if (hostId) {
      loadEvents();
    }
  }, [hostId, loadEvents]);

  // Delete event
  const deleteEvent = useCallback(async (eventId) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await FirebaseService.firestore.deleteEvent(eventId);
      if (result.success) {
        // Remove event from local state
        setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
      } else {
        setError(result.error);
      }
      return result;
    } catch (err) {
      const error = err.message;
      setError(error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    events,
    expiredEvents,
    loading,
    error,
    createEvent,
    updateEventStatus,
    deleteEvent,
    refreshEvents: loadEvents,
  };
};

// Hook for managing messages with real-time updates
export const useMessages = (eventId, isHost = false) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add a new message
  const addMessage = useCallback(async (messageData) => {
    if (!eventId) return { success: false, error: 'No event ID provided' };
    
    setError(null);
    
    try {
      const result = await FirebaseService.firestore.addMessage(eventId, messageData);
      if (!result.success) {
        setError(result.error);
      }
      return result;
    } catch (err) {
      const error = err.message;
      setError(error);
      return { success: false, error };
    }
  }, [eventId]);

  // Delete a message (hosts only)
  const deleteMessage = useCallback(async (messageId) => {
    if (!eventId || !isHost) return { success: false, error: 'Not authorized' };
    
    setError(null);
    
    try {
      const result = await FirebaseService.firestore.deleteMessage(eventId, messageId);
      if (!result.success) {
        setError(result.error);
      }
      return result;
    } catch (err) {
      const error = err.message;
      setError(error);
      return { success: false, error };
    }
  }, [eventId, isHost]);

  // Set up real-time listener for messages
  useEffect(() => {
    if (!eventId) return;

    setLoading(true);
    setError(null);

    // Set up real-time listener
    const unsubscribe = FirebaseService.firestore.listenToMessages(
      eventId,
      isHost,
      (result) => {
        setLoading(false);
        if (result.success) {
          setMessages(result.messages);
          setError(null);
        } else {
          setError(result.error);
        }
      }
    );

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [eventId, isHost]);

  return {
    messages,
    loading,
    error,
    addMessage,
    deleteMessage,
  };
};

// Hook for getting a single event
export const useEvent = (eventId) => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load event details
  const loadEvent = useCallback(async () => {
    if (!eventId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await FirebaseService.firestore.getEvent(eventId);
      if (result.success) {
        setEvent(result.event);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  // Load event when eventId changes
  useEffect(() => {
    if (eventId) {
      loadEvent();
    }
  }, [eventId, loadEvent]);

  return {
    event,
    loading,
    error,
    refreshEvent: loadEvent,
  };
}; 