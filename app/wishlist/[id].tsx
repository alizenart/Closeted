import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";

// Define a WishlistItem type
interface WishlistItem {
  id: string;
  imageUrl: string;
  name: string;
  notes?: string;
  createdAt: string;
}

// Define a ClosetItem type for similar items
interface ClosetItem {
  id: string;
  imageUrl: string;
  name: string;
  genre: string;
  rating: number;
}

export default function WishlistItemDetailScreen() {
  const { id } = useLocalSearchParams();
  const [item, setItem] = useState<WishlistItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [compatibilityScore, setCompatibilityScore] = useState(0);
  const [similarItems, setSimilarItems] = useState<ClosetItem[]>([]);
  const [recommendations, setRecommendations] = useState<WishlistItem[]>([]);

  useEffect(() => {
    loadItemDetails();
  }, [id]);

  const loadItemDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock data - replace with actual Firebase call
      const mockItems: WishlistItem[] = [
        {
          id: "1",
          imageUrl:
            "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
          name: "Vintage Denim Jacket",
          notes: "Size M, light wash",
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          imageUrl:
            "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
          name: "Leather Boots",
          notes: "Brown, size 9",
          createdAt: new Date().toISOString(),
        },
      ];

      const foundItem = mockItems.find((item) => item.id === id);

      if (foundItem) {
        setItem(foundItem);

        // Mock compatibility score (0-100)
        setCompatibilityScore(Math.floor(Math.random() * 100));

        // Mock similar items from closet
        const mockSimilarItems: ClosetItem[] = [
          {
            id: "c1",
            imageUrl:
              "https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            name: "Blue Denim Jeans",
            genre: "Casual",
            rating: 4,
          },
          {
            id: "c2",
            imageUrl:
              "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            name: "White T-Shirt",
            genre: "Casual",
            rating: 5,
          },
        ];
        setSimilarItems(mockSimilarItems);

        // Mock recommendations
        const mockRecommendations: WishlistItem[] = [
          {
            id: "r1",
            imageUrl:
              "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            name: "Matching Belt",
            notes: "Brown leather, size 32",
            createdAt: new Date().toISOString(),
          },
          {
            id: "r2",
            imageUrl:
              "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            name: "Stylish Hat",
            notes: "Beige, one size",
            createdAt: new Date().toISOString(),
          },
        ];
        setRecommendations(mockRecommendations);
      } else {
        setError("Item not found");
      }
    } catch (err) {
      console.error("Error loading item details:", err);
      setError("Failed to load item details");
    } finally {
      setLoading(false);
    }
  };

  const renderSimilarItem = ({ item }: { item: ClosetItem }) => (
    <TouchableOpacity
      className="mr-4 bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden"
      style={{ width: 150 }}
      onPress={() => router.push(`/tabs/closet?id=${item.id}`)}
    >
      <View className="w-full aspect-square bg-gray-100">
        <Image
          source={{ uri: item.imageUrl }}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>
      <View className="p-2">
        <Text
          className="text-emerald-700 font-medium text-sm"
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <View className="flex-row justify-between items-center mt-1">
          <Text className="text-gray-500 text-xs">{item.genre}</Text>
          <View className="flex-row items-center">
            <Ionicons name="star" size={12} color="#fbbf24" />
            <Text className="text-gray-500 text-xs ml-1">{item.rating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderRecommendation = ({ item }: { item: WishlistItem }) => (
    <TouchableOpacity
      className="mr-4 bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden"
      style={{ width: 150 }}
      onPress={() => router.push(`/wishlist/${item.id}`)}
    >
      <View className="w-full aspect-square bg-gray-100">
        <Image
          source={{ uri: item.imageUrl }}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>
      <View className="p-2">
        <Text
          className="text-emerald-700 font-medium text-sm"
          numberOfLines={1}
        >
          {item.name}
        </Text>
        {item.notes && (
          <Text className="text-gray-500 text-xs mt-1" numberOfLines={1}>
            {item.notes}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#25292e" />
      </View>
    );
  }

  if (error || !item) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-4">
        <Text className="text-red-500 text-center mb-4">
          {error || "Item not found"}
        </Text>
        <TouchableOpacity
          className="bg-emerald-600 px-4 py-2 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gradient-to-b from-emerald-50 to-white">
      <ScrollView className="flex-1">
        <View className="w-full aspect-square bg-gray-100">
          <Image
            source={{ uri: item.imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        <View className="p-4">
          <Text className="text-emerald-700 text-2xl font-bold mb-2">
            {item.name}
          </Text>

          {item.notes && (
            <Text className="text-gray-600 mb-4">{item.notes}</Text>
          )}

          <Text className="text-gray-500 text-sm mb-6">
            Added on {new Date(item.createdAt).toLocaleDateString()}
          </Text>

          {/* Compatibility Score */}
          <View className="bg-white rounded-xl shadow-sm border border-emerald-100 p-4 mb-6">
            <Text className="text-emerald-700 text-lg font-semibold mb-2">
              Compatibility Score
            </Text>
            <View className="flex-row items-center">
              <View className="w-16 h-16 rounded-full bg-emerald-100 items-center justify-center mr-4">
                <Text className="text-emerald-700 text-xl font-bold">
                  {compatibilityScore}%
                </Text>
              </View>
              <View className="flex-1">
                <View className="h-2 bg-gray-200 rounded-full mb-2">
                  <View
                    className="h-2 bg-emerald-500 rounded-full"
                    style={{ width: `${compatibilityScore}%` }}
                  />
                </View>
                <Text className="text-gray-600 text-sm">
                  {compatibilityScore > 80
                    ? "Perfect match with your style!"
                    : compatibilityScore > 60
                    ? "Good addition to your wardrobe"
                    : "Might not fit your current style"}
                </Text>
              </View>
            </View>
          </View>

          {/* Similar Items from Closet */}
          <View className="mb-6">
            <Text className="text-emerald-700 text-lg font-semibold mb-3">
              Similar Items in Your Closet
            </Text>
            <FlatList
              data={similarItems}
              renderItem={renderSimilarItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 16 }}
            />
          </View>

          {/* Recommendations */}
          <View className="mb-6">
            <Text className="text-emerald-700 text-lg font-semibold mb-3">
              Our Recommendations
            </Text>
            <FlatList
              data={recommendations}
              renderItem={renderRecommendation}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 16 }}
            />
          </View>

          <TouchableOpacity
            className="bg-emerald-600 py-3 rounded-xl mb-4 shadow-md shadow-emerald-200"
            onPress={() => router.back()}
          >
            <Text className="text-white text-center font-semibold">
              Back to Wishlist
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
