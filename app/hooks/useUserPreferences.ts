import { useState, useEffect } from 'react';
import { auth, storage } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL, getBytes } from 'firebase/storage';

export interface UserPreferences {
  aesthetics: string[];
  onboardingCompleted: boolean;
}

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState(auth.currentUser);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    console.log('Setting up auth listener');
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user?.uid);
      setUser(user);
      setAuthInitialized(true);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const loadPreferences = async () => {
      console.log('Loading preferences, auth initialized:', authInitialized, 'user:', user?.uid);

      if (!authInitialized) {
        console.log('Auth not initialized yet, waiting...');
        return;
      }

      try {
        if (!user) {
          console.log('No user logged in');
          setLoading(false);
          setPreferences(null);
          return;
        }

        // Try to load preferences from storage
        const preferencesRef = ref(storage, `users/${user.uid}/preferences.json`);
        try {
          const data = await getBytes(preferencesRef);
          const text = new TextDecoder().decode(data);
          const loadedPreferences = JSON.parse(text);
          console.log('Preferences loaded:', loadedPreferences);
          setPreferences(loadedPreferences);
        } catch (error: any) {
          // If file doesn't exist, set default preferences
          if (error.code === 'storage/object-not-found') {
            console.log('No preferences found, setting defaults');
            setPreferences({
              aesthetics: [],
              onboardingCompleted: false,
            });
          } else {
            throw error;
          }
        }
      } catch (error: any) {
        console.error('Error loading preferences:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [user, authInitialized]);

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    console.log('Updating preferences:', newPreferences);
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      const updatedPreferences = {
        ...preferences,
        ...newPreferences,
      };

      // Convert preferences to JSON and upload to storage
      const preferencesJson = JSON.stringify(updatedPreferences);
      const preferencesBlob = new Blob([preferencesJson], { type: 'application/json' });
      const preferencesRef = ref(storage, `users/${user.uid}/preferences.json`);

      console.log('Saving preferences:', updatedPreferences);
      await uploadBytes(preferencesRef, preferencesBlob);
      setPreferences(updatedPreferences);
      return true;
    } catch (error: any) {
      console.error('Error updating preferences:', error);
      setError(error.message);
      return false;
    }
  };

  return {
    preferences,
    loading: loading || !authInitialized,
    error,
    updatePreferences,
  };
}