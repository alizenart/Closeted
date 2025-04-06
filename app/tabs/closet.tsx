import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { auth } from "../config/firebase";
import { getUserOutfitsFromStorage, Outfit } from "../utils/firebase";

export default function ClosetScreen() {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  // Get screen dimensions for responsive layout
  const { width } = Dimensions.get("window");
  const numColumns = 2;
  const gap = 12;
  const padding = 16;
  const itemWidth = (width - padding * 2 - gap) / numColumns;

  const loadOutfits = async () => {
    try {
      setError(null);
      setIsOffline(false);
      const userId = auth.currentUser?.uid;
      console.log("Current user ID:", userId);

      if (!userId) {
        console.log("No user ID found, user not signed in");
        setError("Please sign in to view your outfits");
        return;
      }

      console.log("Calling getUserOutfitsFromStorage with userId:", userId);
      const userOutfits = await getUserOutfitsFromStorage(userId);
      console.log("Received outfits from storage:", userOutfits);

      if (userOutfits.length === 0) {
        setIsOffline(true);
      }

      setOutfits(userOutfits);
    } catch (err) {
      console.error("Error loading outfits:", err);
      setError("Failed to load outfits");
      setIsOffline(true);
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

  const renderOutfit = ({ item }: { item: Outfit }) => (
    <View
      className="mb-4 rounded-xl overflow-hidden bg-gray-800 shadow-lg"
      style={{ width: itemWidth }}
    >
      <Image
        source={{ uri: item.imageUrl }}
        className="w-full aspect-square"
        resizeMode="cover"
      />
      <View className="p-2">
        {item.details && (
          <Text className="text-white text-xs mb-1" numberOfLines={2}>
            {item.details}
          </Text>
        )}
        {item.genre && (
          <View className="bg-gray-700 px-2 py-1 rounded-full mb-1 self-start">
            <Text className="text-white text-xs">{item.genre}</Text>
          </View>
        )}
        <View className="flex-row justify-between items-center">
          <Text className="text-white text-xs">
            {item.date
              ? new Date(item.date).toLocaleDateString()
              : new Date(item.createdAt).toLocaleDateString()}
          </Text>
          {item.rating && (
            <View className="flex-row items-center">
              <Text className="text-yellow-400 text-xs mr-1">★</Text>
              <Text className="text-white text-xs">{item.rating}/10</Text>
            </View>
          )}
        </View>
      </View>
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
        <Text className="text-text-secondary text-center mb-4">
          Pull down to refresh
        </Text>
        <TouchableOpacity
          className="bg-blue-500 px-4 py-2 rounded-lg"
          onPress={loadOutfits}
        >
          <Text className="text-white">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {isOffline && (
        <View className="bg-yellow-500/20 p-4 mb-2">
          <Text className="text-yellow-500 text-center">
            Having trouble connecting to the server. Some features may be
            limited.
          </Text>
        </View>
      )}

      {outfits.length === 0 ? (
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-text-secondary text-center mb-4">
            No outfits yet. Upload some photos to see them here!
          </Text>
          <TouchableOpacity
            className="bg-blue-500 px-4 py-2 rounded-lg"
            onPress={onRefresh}
          >
            <Text className="text-white">Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={outfits}
          renderItem={renderOutfit}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            padding: padding,
            paddingBottom: padding + 20, // Extra padding at bottom for better scrolling
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
              tintColor="#4285f4"
            />
          }
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text className="text-white text-xl font-bold mb-4">
              Your Closet
            </Text>
          }
        />
      )}
    </View>
  );
}
