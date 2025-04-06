import React, { useEffect, useState, useRef } from "react";
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
  Pressable,
  TextInput,
  ScrollView,
} from "react-native";
import { auth } from "../config/firebase";
import { getUserOutfitsFromStorage, Outfit } from "../utils/firebase";
import { Ionicons } from "@expo/vector-icons";

export default function ClosetScreen() {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "rating" | "genre">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

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
    loadOutfits();
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const getSortedOutfits = () => {
    let sorted = [...outfits];

    // Filter by search query
    if (searchQuery) {
      sorted = sorted.filter(
        (outfit) =>
          outfit.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          outfit.genre?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by selected criteria
    sorted.sort((a, b) => {
      if (sortBy === "date") {
        const dateA = a.date || a.createdAt;
        const dateB = b.date || b.createdAt;
        return sortOrder === "asc"
          ? new Date(dateA).getTime() - new Date(dateB).getTime()
          : new Date(dateB).getTime() - new Date(dateA).getTime();
      } else if (sortBy === "rating") {
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        return sortOrder === "asc" ? ratingA - ratingB : ratingB - ratingA;
      } else if (sortBy === "genre") {
        const genreA = a.genre || "";
        const genreB = b.genre || "";
        return sortOrder === "asc"
          ? genreA.localeCompare(genreB)
          : genreB.localeCompare(genreA);
      }
      return 0;
    });

    return sorted;
  };

  const renderOutfit = ({ item, index }: { item: Outfit; index: number }) => {
    // Create staggered animation delay based on index
    const delay = index * 100;

    return (
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
          {item.details && (
            <Text className="text-gray-700 text-sm mb-2" numberOfLines={2}>
              {item.details}
            </Text>
          )}
          {item.genre && (
            <View className="bg-emerald-100 px-3 py-1 rounded-full mb-2 self-start">
              <Text className="text-emerald-700 text-xs font-medium">
                {item.genre}
              </Text>
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
                <Text className="text-gray-600 text-xs font-medium">
                  {item.rating}/10
                </Text>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
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

      {/* Search and Sort Controls */}
      <View className="p-4 pb-0">
        <View className="flex-row items-center mb-4">
          <View className="flex-1 flex-row items-center bg-white rounded-xl border border-emerald-200 px-3 py-2 mr-2">
            <Ionicons name="search" size={18} color="#25292e" />
            <TextInput
              className="flex-1 ml-2 text-gray-700"
              placeholder="Search outfits..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            ) : null}
          </View>
          <TouchableOpacity
            className="bg-white w-10 h-10 rounded-xl border border-emerald-200 items-center justify-center"
            onPress={toggleSortOrder}
          >
            <Ionicons
              name={sortOrder === "asc" ? "arrow-up" : "arrow-down"}
              size={18}
              color="#25292e"
            />
          </TouchableOpacity>
        </View>

        <View className="flex-row mb-4">
          <TouchableOpacity
            className={`px-3 py-1 rounded-full mr-2 ${
              sortBy === "date" ? "bg-emerald-600" : "bg-emerald-100"
            }`}
            onPress={() => setSortBy("date")}
          >
            <Text
              className={`text-xs font-medium ${
                sortBy === "date" ? "text-white" : "text-emerald-700"
              }`}
            >
              Date
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-3 py-1 rounded-full mr-2 ${
              sortBy === "rating" ? "bg-emerald-600" : "bg-emerald-100"
            }`}
            onPress={() => setSortBy("rating")}
          >
            <Text
              className={`text-xs font-medium ${
                sortBy === "rating" ? "text-white" : "text-emerald-700"
              }`}
            >
              Rating
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-3 py-1 rounded-full ${
              sortBy === "genre" ? "bg-emerald-600" : "bg-emerald-100"
            }`}
            onPress={() => setSortBy("genre")}
          >
            <Text
              className={`text-xs font-medium ${
                sortBy === "genre" ? "text-white" : "text-emerald-700"
              }`}
            >
              Genre
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {outfits.length === 0 ? (
        <View className="flex-1 items-center justify-center p-4">
          <View className="w-24 h-24 bg-emerald-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="shirt-outline" size={40} color="#25292e" />
          </View>
          <Text className="text-emerald-700 text-center text-lg mb-2 font-semibold">
            Your Closet is Empty
          </Text>
          <Text className="text-emerald-600 text-center mb-6">
            Upload some photos to see them here!
          </Text>
          <TouchableOpacity
            className="bg-emerald-600 px-6 py-3 rounded-xl shadow-md shadow-emerald-200 flex-row items-center"
            onPress={onRefresh}
          >
            <Ionicons name="refresh" size={18} color="white" className="mr-2" />
            <Text className="text-white font-semibold">Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={getSortedOutfits()}
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
            <View className="mb-6">
              <Text className="text-emerald-700 text-2xl font-bold mb-2">
                Your Closet
              </Text>
              <Text className="text-emerald-600 text-base">
                {getSortedOutfits().length}{" "}
                {getSortedOutfits().length === 1 ? "outfit" : "outfits"} in your
                collection
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
