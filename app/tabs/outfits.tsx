import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { auth } from "../config/firebase";
import { getUserOutfits, Outfit, uploadImage } from "../utils/firebase";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

export default function OutfitsScreen() {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | undefined>(
    undefined
  );

  const loadOutfits = async () => {
    try {
      setError(null);
      const userId = auth.currentUser?.uid;
      if (!userId) {
        setError("Please sign in to view your outfits");
        return;
      }

      const userOutfits = await getUserOutfits(userId);
      setOutfits(userOutfits);
    } catch (err) {
      console.error("Error loading outfits:", err);
      setError("Failed to load outfits");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOutfits();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadOutfits();
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (err) {
      console.error("Error picking image:", err);
      setError("Failed to pick image");
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) {
      setError("Please select an image first");
      return;
    }

    try {
      setUploading(true);
      const userId = auth.currentUser?.uid;
      if (!userId) {
        setError("Please sign in to upload images");
        return;
      }

      await uploadImage(selectedImage, userId);
      setSelectedImage(undefined); // Clear the selected image
      await loadOutfits(); // Reload the outfits after successful upload
    } catch (err) {
      console.error("Error uploading image:", err);
      setError("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const renderOutfit = ({ item }: { item: Outfit }) => (
    <View className="w-full aspect-square mb-4 rounded-lg overflow-hidden">
      <Image
        source={{ uri: item.imageUrl }}
        className="w-full h-full"
        resizeMode="cover"
      />
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#4285f4" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-4">
        <Text className="text-red-500 text-center mb-4">{error}</Text>
        <Text className="text-text-secondary text-center">
          Pull down to refresh
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {selectedImage ? (
        <View className="flex-1 items-center justify-center p-4">
          <Image
            source={{ uri: selectedImage }}
            className="w-80 h-80 rounded-lg mb-4"
            resizeMode="cover"
          />
          <View className="flex-row space-x-4">
            <TouchableOpacity
              onPress={handleImageUpload}
              disabled={uploading}
              className="bg-[#4285f4] px-6 py-3 rounded-lg"
            >
              {uploading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold">Use this photo</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedImage(undefined)}
              className="bg-gray-600 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-semibold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          {outfits.length === 0 ? (
            <View className="flex-1 items-center justify-center p-4">
              <Text className="text-text-secondary text-center mb-4">
                No outfits yet. Upload some photos to see them here!
              </Text>
              <TouchableOpacity
                onPress={pickImage}
                className="bg-[#4285f4] px-6 py-3 rounded-lg"
              >
                <Text className="text-white font-semibold">Choose a photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={outfits}
              renderItem={renderOutfit}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 16 }}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: "space-between" }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor="#4285f4"
                />
              }
            />
          )}

          {/* Floating Action Button */}
          <TouchableOpacity
            onPress={pickImage}
            className="absolute bottom-6 right-6 w-14 h-14 bg-[#4285f4] rounded-full items-center justify-center shadow-lg"
          >
            <Ionicons name="add" size={30} color="#fff" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
