import { auth, storage, db, app } from '../config/firebase';
import { getStorage, ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import * as FileSystem from 'expo-file-system';
import RNFetchBlob from 'react-native-blob-util';

export interface Outfit {
  id: string;
  imageUrl: string;
  createdAt: Date;
  userId: string;
  details?: string;
  rating?: number;
  genre?: string;
  date?: Date;
}

interface OutfitMetadata {
  details?: string;
  rating?: number;
  genre?: string;
  date?: Date;
}

// Helper function to retry operations
const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      console.log(`Attempt ${attempt} failed:`, error);
      lastError = error;

      if (attempt < maxRetries) {
        console.log(`Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError;
};

async function uriToBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  return await response.blob();
}

export const uploadImage = async (
  uri: string,
  userId: string,
  metadata?: OutfitMetadata
): Promise<string> => {
  try {
    console.log('Starting image upload for user:', userId);

    // Use retry logic for Storage operations
    return await retryOperation(async () => {
      const response = await fetch(uri);
      const blob = await response.blob();

      const storageRef = ref(getStorage(app), `outfits/${userId}/${Date.now()}`);
      console.log('Created storage reference');

      console.log('Uploading image to storage...');
      const snapshot = await uploadBytes(storageRef, blob);
      console.log('Image uploaded to storage');

      console.log('Getting download URL...');
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('Got download URL:', downloadURL);

      // Store metadata in Firestore
      const outfitsRef = collection(db, 'outfits');
      await addDoc(outfitsRef, {
        imageUrl: downloadURL,
        userId: userId,
        createdAt: Timestamp.now(),
        ...metadata
      });

      return downloadURL;
    });
  } catch (error: any) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Get all outfits for the current user from Firestore
export const getUserOutfits = async (userId: string): Promise<Outfit[]> => {
  try {
    console.log('Getting outfits for user:', userId);

    // Use retry logic for Firestore operations
    return await retryOperation(async () => {
      const outfitsRef = collection(db, 'outfits');
      console.log('Created outfits collection reference');

      const q = query(outfitsRef, where('userId', '==', userId));
      console.log('Created query with userId filter');

      console.log('Executing query...');
      const querySnapshot = await getDocs(q);
      console.log('Query executed, found', querySnapshot.size, 'outfits');

      const outfits = querySnapshot.docs.map(doc => ({
        id: doc.id,
        imageUrl: doc.data().imageUrl,
        createdAt: doc.data().createdAt.toDate(),
        userId: doc.data().userId
      }));
      console.log('Processed outfits:', outfits);

      return outfits;
    });
  } catch (error: any) {
    console.error('Error getting user outfits:', error);
    // Return empty array instead of throwing to prevent app from crashing
    return [];
  }
};

// Get all outfits for the current user directly from Firebase Storage
export const getUserOutfitsFromStorage = async (userId: string): Promise<Outfit[]> => {
  try {
    console.log('Getting outfits from storage for user:', userId);

    // Use retry logic for Storage operations
    return await retryOperation(async () => {
      const storageRef = ref(getStorage(app), `images/${userId}`);
      console.log('Created storage reference for user folder');

      console.log('Listing all items in user folder...');
      const result = await listAll(storageRef);
      console.log('Found', result.items.length, 'items in storage');

      // Get download URLs for all items
      const downloadUrls = await Promise.all(
        result.items.map(async (item) => {
          const url = await getDownloadURL(item);
          return {
            id: item.name,
            imageUrl: url,
            createdAt: new Date(), // We don't have creation date in storage metadata
            userId: userId
          };
        })
      );

      console.log('Processed', downloadUrls.length, 'outfits from storage');
      return downloadUrls;
    });
  } catch (error: any) {
    console.error('Error getting user outfits from storage:', error);
    // Return empty array instead of throwing to prevent app from crashing
    return [];
  }
};

// Check if outfits collection exists and create a sample outfit if it doesn't
export const initializeOutfitsCollection = async (userId: string): Promise<void> => {
  try {
    console.log('Initializing outfits collection for user:', userId);

    // Use retry logic for Firestore operations
    await retryOperation(async () => {
      const outfitsRef = collection(db, 'outfits');
      const q = query(outfitsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log('No outfits found, creating a sample outfit');
        // Create a sample outfit
        await addDoc(outfitsRef, {
          imageUrl: 'https://firebasestorage.googleapis.com/v0/b/outfitted-15775.appspot.com/o/images%2Fsample-outfit.jpg?alt=media',
          createdAt: Timestamp.now(),
          userId: userId
        });
        console.log('Sample outfit created');
      } else {
        console.log('Outfits collection already exists with', querySnapshot.size, 'outfits');
      }
    });
  } catch (error: any) {
    console.error('Error initializing outfits collection:', error);
    // Don't throw the error to prevent app from crashing
  }
};

// Default export for the file
export default {
  uploadImage,
  getUserOutfits,
  getUserOutfitsFromStorage,
  initializeOutfitsCollection
};
