import React, {
  ScrollView,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Image } from "react-native";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import { auth, storage } from "../config/firebase";
import { getUserOutfitsFromStorage, Outfit } from "../utils/firebase";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { ref, listAll, getDownloadURL } from "firebase/storage";

interface ButtonProps {
  label: string;
  onPress?: () => void;
  style?: ViewStyle;
}

interface WishlistItem {
  id: string;
  imageUrl: string;
  name: string;
  notes?: string;
  createdAt: string;
}

const Button = ({ label, onPress, style }: ButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, style]}
      className="bg-emerald-600 active:bg-emerald-700"
    >
      <Text className="text-white font-semibold">{label}</Text>
    </TouchableOpacity>
  );
};

import ImageViewer from "@/components/ImageViewer";
import * as ImagePicker from "expo-image-picker";

const PlaceholderImage = require("@/assets/images/react-logo.png");

export default function Index() {
  const [selectedImage, setSelectedImage] = useState<string | undefined>(
    undefined
  );
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOutfits = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.log("No user ID found, user not signed in");
        return;
      }

      const userOutfits = await getUserOutfitsFromStorage(userId);
      setOutfits(userOutfits);
    } catch (err) {
      console.error("Error loading outfits:", err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadOutfits(), loadWishlistItems()]);
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const pickImageAsync = async () => {
    console.log("pickImageAsync");
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      console.log(result);
      setSelectedImage(result.assets[0].uri);
    } else {
      alert("You did not select any image.");
    }
  };

  // Load wishlist items from Firebase Storage
  const loadWishlistItems = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.log("No user ID found, user not signed in");
        return;
      }

      // Get wishlist items from Firebase Storage
      const storageRef = ref(storage, `images/wishlist/${userId}`);
      const result = await listAll(storageRef);

      // Get items from each folder
      const items = await Promise.all(
        result.prefixes.map(async (folderRef) => {
          try {
            // Get the image URL
            const imageRef = ref(storage, `${folderRef.fullPath}/image.jpg`);
            const imageUrl = await getDownloadURL(imageRef);

            // Get the metadata
            const metadataRef = ref(
              storage,
              `${folderRef.fullPath}/metadata.json`
            );
            const metadataResponse = await fetch(
              await getDownloadURL(metadataRef)
            );
            const metadata = await metadataResponse.json();

            const wishlistItem: WishlistItem = {
              id: folderRef.name,
              imageUrl,
              name: metadata.name || "",
              notes: metadata.notes || "",
              createdAt: metadata.createdAt || new Date().toISOString(),
            };
            return wishlistItem;
          } catch (error) {
            console.error(`Error processing folder ${folderRef.name}:`, error);
            return null;
          }
        })
      );

      // Filter out any failed retrievals and sort by creation date
      const validItems = items
        .filter((item): item is WishlistItem => item !== null)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

      setWishlistItems(validItems);
    } catch (err) {
      console.error("Error loading wishlist items:", err);
    } finally {
      setLoadingWishlist(false);
    }
  };

  // Load outfits when component mounts
  useEffect(() => {
    loadOutfits();
    loadWishlistItems();
  }, []);

  // Navigate to outfits tab
  const navigateToOutfits = () => {
    router.push("/tabs/closet");
  };

  // Navigate to create tab
  const navigateToCreate = () => {
    router.push("/tabs/create");
  };

  // Navigate to wishlist item
  const navigateToWishlistItem = (itemId: string) => {
    router.push(`/wishlist/${itemId}`);
  };

  // Navigate to add wishlist item
  const navigateToAddWishlist = () => {
    router.push("/tabs/wishlist");
  };

  return (
    <View className="flex-1 bg-emerald-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#059669"
            colors={["#059669"]}
          />
        }
      >
        {/* recommendations section */}
        <View className="px-4 py-6 space-y-4">
          <View className="space-y-1">
            <Text className="text-xl font-bold text-emerald-800">
              Recommendations
            </Text>
            <Text className="text-emerald-600 text-sm">
              Based on your wishlist
            </Text>
          </View>

          {loadingWishlist ? (
            <View className="items-center py-8">
              <ActivityIndicator size="large" color="#059669" />
              <Text className="text-emerald-600 mt-2">Loading wishlist...</Text>
            </View>
          ) : wishlistItems.length === 0 ? (
            <TouchableOpacity
              onPress={navigateToAddWishlist}
              className="bg-white rounded-2xl p-6 shadow-sm items-center"
            >
              <View className="w-16 h-16 bg-emerald-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="heart-outline" size={32} color="#059669" />
              </View>
              <Text className="text-emerald-700 text-lg font-semibold text-center mb-2">
                Add Your First Wishlist Item
              </Text>
              <Text className="text-emerald-600 text-center mb-4">
                Start building your wishlist to get personalized recommendations
              </Text>
              <View className="bg-emerald-600 px-6 py-3 rounded-xl">
                <Text className="text-white font-semibold">Get Started →</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View className="space-y-4">
              {wishlistItems.slice(0, 2).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => navigateToWishlistItem(item.id)}
                  className="bg-white rounded-2xl p-3 shadow-sm"
                >
                  <Image
                    source={{ uri: item.imageUrl }}
                    className="w-full h-40 rounded-xl"
                    resizeMode="cover"
                  />
                  <View className="p-2">
                    <Text className="text-emerald-700 font-semibold text-lg mb-1">
                      {item.name}
                    </Text>
                    {item.notes && (
                      <Text className="text-gray-600 text-sm" numberOfLines={2}>
                        {item.notes}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View className="px-4 py-6 space-y-4">
          <Text className="text-xl font-bold text-emerald-800">
            Your Outfits
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-1"
            contentContainerStyle={{ paddingRight: 16 }}
          >
            <View className="flex-row">
              {loading ? (
                <View className="items-center justify-center p-4">
                  <Text className="text-emerald-600">Loading outfits...</Text>
                </View>
              ) : outfits.length > 0 ? (
                <>
                  {outfits.slice(0, 5).map((outfit) => (
                    <View key={outfit.id} className="mr-4">
                      <Image
                        source={{ uri: outfit.imageUrl }}
                        className="w-24 h-64 rounded-2xl"
                        resizeMode="cover"
                      />
                    </View>
                  ))}
                  <TouchableOpacity
                    className="w-24 h-64 rounded-2xl bg-emerald-100 justify-center items-center mr-4"
                    onPress={navigateToOutfits}
                  >
                    <Text className="text-emerald-700 font-semibold text-center text-base">
                      See all outfits →
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  className="w-48 h-64 rounded-2xl bg-emerald-100 justify-center items-center p-4 mr-4"
                  onPress={navigateToCreate}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={32}
                    color="#059669"
                  />
                  <Text className="text-emerald-700 font-semibold text-center mt-2 text-base">
                    Create your first outfit
                  </Text>
                  <Text className="text-emerald-600 text-center mt-1 text-sm">
                    Tap to get started →
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
});
