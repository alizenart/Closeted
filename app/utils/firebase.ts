import { auth, storage, db } from '../config/firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import * as FileSystem from 'expo-file-system';
import RNFetchBlob from 'react-native-blob-util';
import { app } from "../config/firebase";

export interface Outfit {
  id: string;
  imageUrl: string;
  createdAt: Date;
  userId: string;
}

async function uriToBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  return await response.blob();
}


export async function uploadImage(uri: string, userId: string): Promise<string> {
  try {
    // Create a permanent copy of the file
    const permanentUri = `${FileSystem.cacheDirectory}${Date.now()}.jpg`;
    await FileSystem.copyAsync({ from: uri, to: permanentUri });

    // Use the new URI
    const response = await fetch(permanentUri);
    const blob = await response.blob();

    const filename = permanentUri.substring(permanentUri.lastIndexOf('/') + 1);
    const storageRef = ref(getStorage(app), `images/${userId}/${filename}`);

    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error("Upload failed:", {
      error,
      message: error.message,
      nativeError: error.nativeErrorCode || error.code
    });
    throw error;
  }
}


// Get all outfits for the current user
export const getUserOutfits = async (userId: string): Promise<Outfit[]> => {
  try {
    const outfitsRef = collection(db, 'outfits');
    const q = query(outfitsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      imageUrl: doc.data().imageUrl,
      createdAt: doc.data().createdAt.toDate(),
      userId: doc.data().userId
    }));
  } catch (error) {
    console.error('Error getting user outfits:', error);
    throw error;
  }
};
// Default export for the file
export default {
  uploadImage,
  getUserOutfits
};
