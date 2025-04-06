import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SocialScreen() {
  return (
    <View className="flex-1 bg-gradient-to-b from-emerald-50 to-white">
      <View className="p-4">
        <Text className="text-emerald-700 text-2xl font-bold mb-2">
          Social Feed
        </Text>
        <Text className="text-emerald-600 text-base mb-6">
          Connect with other fashion enthusiasts
        </Text>

        <View className="bg-white rounded-xl shadow-md border border-emerald-100 p-4 mb-4">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center flex-1 mr-4">
              <View className="w-12 h-12 rounded-full bg-emerald-100 items-center justify-center mr-3">
                <Text className="text-emerald-700 text-xl">👋</Text>
              </View>
              <View className="flex-1">
                <Text className="text-emerald-700 font-semibold text-lg">
                  Welcome!
                </Text>
                <Text className="text-gray-500">
                  Share your outfits with the community
                </Text>
              </View>
            </View>
            <TouchableOpacity
              className="bg-emerald-600 px-4 py-2 rounded-lg shadow-md shadow-emerald-200"
              onPress={() => {}}
            >
              <Text className="text-white font-semibold">Enable</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
