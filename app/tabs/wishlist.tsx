import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Animated,
  TextInput,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth, db, storage } from "../config/firebase";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { uploadImage } from "../utils/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  doc,
  setDoc,
} from "firebase/firestore";
import { ref, listAll, getDownloadURL } from "firebase/storage";

// Define a WishlistItem type
interface WishlistItem {
  id: string;
  imageUrl: string;
  name: string;
  notes?: string;
  createdAt: string;
}

export default function WishlistScreen() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [newItem, setNewItem] = useState<Partial<WishlistItem>>({
    name: "",
    notes: "",
  });
  const [selectedImage, setSelectedImage] = useState<string | undefined>(
    undefined
  );
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Get screen dimensions for responsive layout
  const { width } = Dimensions.get("window");
  const numColumns = 2;
  const gap = 12;
  const padding = 16;
  const itemWidth = (width - padding * 2 - gap) / numColumns;

  // Load wishlist items from Firebase Storage
  const loadWishlistItems = async () => {
    try {
      setError(null);
      setIsOffline(false);
      const userId = auth.currentUser?.uid;
      console.log("Current user ID:", userId);

      if (!userId) {
        console.log("No user ID found, user not signed in");
        setError("Please sign in to view your wishlist");
        return;
      }

      // Get wishlist items from Firebase Storage
      const storageRef = ref(storage, `images/wishlist/${userId}`);
      console.log("Created storage reference for user wishlist folder");

      console.log("Listing all folders in wishlist directory...");
      const result = await listAll(storageRef);
      console.log("Found", result.prefixes.length, "items in wishlist");

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

      console.log(
        "Processed",
        validItems.length,
        "wishlist items from storage"
      );
      setWishlistItems(validItems);
    } catch (err) {
      console.error("Error loading wishlist items:", err);
      setError("Failed to load wishlist items");
      setIsOffline(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWishlistItems();

    // Start animation when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadWishlistItems();
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      alert("Sorry, we need camera permissions to make this work!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleAddItem = async () => {
    if (!selectedImage) {
      alert("Please select an image first");
      return;
    }

    if (!newItem.name) {
      alert("Please enter an item name");
      return;
    }

    const userId = auth.currentUser?.uid;
    if (!userId) {
      alert("Please sign in to add items to your wishlist");
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress("Preparing image...");

      // Add a small delay to ensure UI updates
      await new Promise((resolve) => setTimeout(resolve, 100));

      setUploadProgress("Uploading to server...");

      // Upload the image to Firebase Storage
      const imageUrl = await uploadImage(selectedImage, `wishlist/${userId}`, {
        details: newItem.notes || "",
        name: newItem.name,
      });

      if (!imageUrl) {
        throw new Error("Upload failed - no URL returned");
      }

      console.log("Image uploaded successfully:", imageUrl);
      setUploadProgress("Upload complete!");

      // Create a new wishlist item with the Firebase URL
      const newWishlistItem: WishlistItem = {
        id: Date.now().toString(),
        imageUrl: imageUrl,
        name: newItem.name || "",
        notes: newItem.notes,
        createdAt: new Date().toISOString(),
      };

      // Add to state
      setWishlistItems([newWishlistItem, ...wishlistItems]);

      // Reset form
      setNewItem({
        name: "",
        notes: "",
      });
      setSelectedImage(undefined);
      setIsAddingItem(false);
      setIsUploading(false);
      setUploadProgress("");

      // Show success message
      alert("Item added to wishlist successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image. Please try again.");
      setIsUploading(false);
      setUploadProgress("");
    }
  };

  const handleItemPress = (item: WishlistItem) => {
    router.push(`/wishlist/${item.id}`);
  };

  const renderWishlistItem = ({
    item,
    index,
  }: {
    item: WishlistItem;
    index: number;
  }) => {
    // Create staggered animation delay based on index
    const delay = index * 100;

    return (
      <TouchableOpacity onPress={() => handleItemPress(item)}>
        <Animated.View
          className="mb-4 rounded-xl overflow-hidden bg-white shadow-md border border-emerald-100"
          style={{
            width: itemWidth,
            marginLeft: index % 2 === 0 ? 0 : gap,
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
        >
          <View className="w-full aspect-square items-center justify-center bg-gray-100">
            <Image
              source={{ uri: item.imageUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
          <View className="p-3">
            <Text
              className="text-emerald-700 font-semibold mb-1"
              numberOfLines={1}
            >
              {item.name}
            </Text>
            {item.notes && (
              <Text className="text-gray-500 text-xs mb-2" numberOfLines={2}>
                {item.notes}
              </Text>
            )}
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-500 text-xs">
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
              <TouchableOpacity className="bg-emerald-100 w-8 h-8 rounded-full items-center justify-center">
                <Ionicons name="cart-outline" size={16} color="#25292e" />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

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
        <Text className="text-text-secondary text-center mb-4">
          Pull down to refresh
        </Text>
        <TouchableOpacity
          className="bg-blue-500 px-4 py-2 rounded-lg"
          onPress={loadWishlistItems}
        >
          <Text className="text-white">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gradient-to-b from-emerald-50 to-white">
      {isOffline && (
        <View className="bg-amber-100 p-4 mb-2 border-b border-amber-200">
          <Text className="text-amber-600 text-center">
            Having trouble connecting to the server. Some features may be
            limited.
          </Text>
        </View>
      )}

      <View className="p-4 pb-0">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-emerald-700 text-2xl font-bold mb-1">
              Your Wishlist
            </Text>
            <Text className="text-emerald-600 text-base">
              {wishlistItems.length}{" "}
              {wishlistItems.length === 1 ? "item" : "items"} saved
            </Text>
          </View>
          <TouchableOpacity
            className="bg-emerald-600 w-12 h-12 rounded-full items-center justify-center shadow-md shadow-emerald-200"
            onPress={() => setIsAddingItem(true)}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {wishlistItems.length === 0 ? (
        <View className="flex-1 items-center justify-center p-4">
          <View className="w-24 h-24 bg-emerald-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="heart" size={40} color="#25292e" />
          </View>
          <Text className="text-emerald-700 text-center text-lg mb-2 font-semibold">
            Your Wishlist is Empty
          </Text>
          <Text className="text-emerald-600 text-center mb-6">
            Add items you want to buy to your wishlist!
          </Text>
          <TouchableOpacity
            className="bg-emerald-600 px-6 py-3 rounded-xl shadow-md shadow-emerald-200 flex-row items-center"
            onPress={() => setIsAddingItem(true)}
          >
            <Ionicons name="add" size={18} color="white" className="mr-2" />
            <Text className="text-white font-semibold">Add Item</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={wishlistItems}
          renderItem={renderWishlistItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            padding: padding,
            paddingBottom: padding + 20,
          }}
          numColumns={numColumns}
          columnWrapperStyle={{
            justifyContent: "space-between",
            marginBottom: gap,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#25292e"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add Item Modal */}
      <Modal
        visible={isAddingItem}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddingItem(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-emerald-700 text-xl font-bold">
                Add to Wishlist
              </Text>
              <TouchableOpacity
                className="bg-emerald-100 w-8 h-8 rounded-full items-center justify-center"
                onPress={() => setIsAddingItem(false)}
              >
                <Ionicons name="close" size={20} color="#25292e" />
              </TouchableOpacity>
            </View>

            <ScrollView className="max-h-[80vh]">
              {/* Image Selection */}
              <View className="mb-4">
                {selectedImage ? (
                  <View className="w-full aspect-square rounded-xl overflow-hidden mb-2">
                    <Image
                      source={{ uri: selectedImage }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  </View>
                ) : (
                  <View className="w-full aspect-square bg-emerald-100 rounded-xl items-center justify-center mb-2">
                    <Ionicons name="image-outline" size={40} color="#25292e" />
                  </View>
                )}

                <View className="flex-row justify-between">
                  <TouchableOpacity
                    className="flex-1 bg-emerald-100 py-3 rounded-xl mr-2 items-center"
                    onPress={pickImage}
                  >
                    <Ionicons name="images-outline" size={20} color="#25292e" />
                    <Text className="text-emerald-700 mt-1">Gallery</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-emerald-100 py-3 rounded-xl ml-2 items-center"
                    onPress={takePhoto}
                  >
                    <Ionicons name="camera-outline" size={20} color="#25292e" />
                    <Text className="text-emerald-700 mt-1">Camera</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Item Details Form */}
              <View className="mb-4">
                <Text className="text-emerald-700 font-semibold mb-2">
                  Item Name
                </Text>
                <TextInput
                  className="bg-white border border-emerald-200 rounded-lg px-4 py-3 text-gray-700 mb-4"
                  placeholder="What is this item?"
                  value={newItem.name}
                  onChangeText={(text) =>
                    setNewItem({ ...newItem, name: text })
                  }
                />

                <Text className="text-emerald-700 font-semibold mb-2">
                  Notes (Optional)
                </Text>
                <TextInput
                  className="bg-white border border-emerald-200 rounded-lg px-4 py-3 text-gray-700 mb-4"
                  placeholder="Add any notes about this item..."
                  value={newItem.notes}
                  onChangeText={(text) =>
                    setNewItem({ ...newItem, notes: text })
                  }
                  multiline
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity
                className="bg-emerald-600 py-4 rounded-xl mb-4 shadow-md shadow-emerald-200"
                onPress={handleAddItem}
                disabled={!selectedImage || !newItem.name || isUploading}
              >
                {isUploading ? (
                  <View className="flex-row items-center justify-center">
                    <ActivityIndicator color="white" />
                    <Text className="text-white ml-2">{uploadProgress}</Text>
                  </View>
                ) : (
                  <Text className="text-white text-center font-semibold text-lg">
                    Add to Wishlist
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
