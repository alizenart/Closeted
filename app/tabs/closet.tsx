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
      className="mb-4 rounded-xl overflow-hidden bg-white shadow-md border border-emerald-100"
      style={{ width: itemWidth }}
    >
      <Image
        source={{ uri: item.imageUrl }}
        className="w-full aspect-square"
        resizeMode="cover"
      />
      <View className="p-3">
        {item.details && (
          <Text className="text-gray-700 text-sm mb-2" numberOfLines={2}>
            {item.details}
          </Text>
        )}
        {item.genre && (
          <View className="bg-emerald-100 px-3 py-1 rounded-full mb-2 self-start">
            <Text className="text-emerald-700 text-xs">{item.genre}</Text>
          </View>
        )}
        <View className="flex-row justify-between items-center">
          <Text className="text-gray-500 text-xs">
            {item.date
              ? new Date(item.date).toLocaleDateString()
              : new Date(item.createdAt).toLocaleDateString()}
          </Text>
          {item.rating && (
            <View className="flex-row items-center">
              <Text className="text-amber-500 text-xs mr-1">★</Text>
              <Text className="text-gray-600 text-xs">{item.rating}/10</Text>
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
    <View className="flex-1 bg-gradient-to-b from-emerald-50 to-white">
      {isOffline && (
        <View className="bg-amber-100 p-4 mb-2 border-b border-amber-200">
          <Text className="text-amber-600 text-center">
            Having trouble connecting to the server. Some features may be
            limited.
          </Text>
        </View>
      )}

      {outfits.length === 0 ? (
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-emerald-700 text-center text-lg mb-4">
            No outfits yet. Upload some photos to see them here!
          </Text>
          <TouchableOpacity
            className="bg-emerald-600 px-6 py-3 rounded-xl shadow-md shadow-emerald-200"
            onPress={onRefresh}
          >
            <Text className="text-white font-semibold">Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={outfits}
          renderItem={renderOutfit}
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
          ListHeaderComponent={
            <Text className="text-emerald-700 text-2xl font-bold mb-6">
              Your Closet
            </Text>
          }
        />
      )}
    </View>
  );
}
