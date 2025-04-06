import { auth, storage, db, app } from '../config/firebase';
import { getStorage, ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import * as FileSystem from 'expo-file-system';
import { analyzeClothingImage } from './chatgpt';

export interface Outfit {
  id: string;
  imageUrl: string;
  createdAt: Date;
  userId: string;
  details: string;
  rating: number;
  genre: string;
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
      console.log(`Attempt ${attempt} of ${maxRetries}`);
      const result = await operation();
      console.log(`Operation completed successfully on attempt ${attempt}`);
      return result;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      lastError = error;

      if (attempt < maxRetries) {
        console.log(`Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        console.error('All retry attempts failed');
      }
    }
  }

  console.error('Operation failed after all retries:', lastError);
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
    const downloadURL = await retryOperation(async () => {
      try {
        const response = await fetch(uri);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        const blob = await response.blob();
        console.log('Image blob created successfully');

        // Generate a unique folder name for this image
        const timestamp = Date.now();
        const folderName = `image_${timestamp}`;

        // Create references for both the image and metadata
        const imageRef = ref(getStorage(app), `images/${userId}/${folderName}/image.jpg`);
        const metadataRef = ref(getStorage(app), `images/${userId}/${folderName}/metadata.json`);

        console.log('Created storage references');

        // Upload the image
        console.log('Uploading image to storage...');
        const imageSnapshot = await uploadBytes(imageRef, blob);
        console.log('Image uploaded to storage successfully');

        // Get the download URL for the image
        console.log('Getting download URL...');
        const url = await getDownloadURL(imageSnapshot.ref);
        console.log('Got download URL:', url);

        // Analyze the clothing in the image
        console.log('Analyzing clothing in image...');
        const clothingAnalysis = await analyzeClothingImage(url);
        console.log('=== Clothing Analysis Results ===');
        console.log('Outerwear:', clothingAnalysis.outerwear);
        console.log('Top:', clothingAnalysis.top);
        console.log('Bottom:', clothingAnalysis.bottom);
        console.log('Shoes:', clothingAnalysis.shoes);
        console.log('===============================');

        // Create and upload metadata with analysis
        const metadataContent = {
          details: metadata?.details || '',
          rating: metadata?.rating || 0,
          genre: metadata?.genre || '',
          date: metadata?.date || new Date().toISOString(),
          createdAt: new Date().toISOString(),
          userId: userId,
          imageUrl: url,
          clothingAnalysis: {
            outerwear: clothingAnalysis.outerwear || '',
            top: clothingAnalysis.top || '',
            bottom: clothingAnalysis.bottom || '',
            shoes: clothingAnalysis.shoes || ''
          }
        };

        const metadataBlob = new Blob([JSON.stringify(metadataContent)], { type: 'application/json' });
        await uploadBytes(metadataRef, metadataBlob);
        console.log('Metadata with analysis uploaded to storage successfully');

        return url;
      } catch (error) {
        console.error('Error in upload process:', error);
        throw error; // Re-throw to be caught by retryOperation
      }
    });

    console.log('Upload process completed successfully');
    return downloadURL;
  } catch (error: any) {
    console.error('Error uploading image:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
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

      const outfits = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          imageUrl: data.imageUrl,
          createdAt: data.createdAt.toDate(),
          userId: data.userId,
          details: data.details || '',
          rating: data.rating || 0,
          genre: data.genre || '',
          date: data.date ? data.date.toDate() : undefined
        };
      });
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

      console.log('Listing all folders in user directory...');
      const result = await listAll(storageRef);
      console.log('Found', result.prefixes.length, 'folders in storage');

      // Get outfits from each folder
      const outfits = await Promise.all(
        result.prefixes.map(async (folderRef) => {
          try {
            // Get the image URL
            const imageRef = ref(getStorage(app), `${folderRef.fullPath}/image.jpg`);
            const imageUrl = await getDownloadURL(imageRef);

            // Get the metadata
            const metadataRef = ref(getStorage(app), `${folderRef.fullPath}/metadata.json`);
            const metadataResponse = await fetch(await getDownloadURL(metadataRef));
            const metadata = await metadataResponse.json();

            const outfit: Outfit = {
              id: folderRef.name,
              imageUrl,
              createdAt: new Date(metadata.createdAt),
              userId: metadata.userId,
              details: metadata.details || '',
              rating: metadata.rating || 0,
              genre: metadata.genre || '',
              date: metadata.date ? new Date(metadata.date) : undefined
            };
            return outfit;
          } catch (error) {
            console.error(`Error processing folder ${folderRef.name}:`, error);
            return null;
          }
        })
      );

      // Filter out any failed retrievals and sort by creation date
      const validOutfits = outfits
        .filter((outfit): outfit is Outfit => outfit !== null)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      console.log('Processed', validOutfits.length, 'outfits from storage');
      return validOutfits;
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
