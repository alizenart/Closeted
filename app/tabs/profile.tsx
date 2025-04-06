import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../config/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/");
    } catch (error) {
      console.error("Error signing out:", error);
      Alert.alert("Error", "Failed to sign out. Please try again.");
    }
  };

  return (
    <View className="flex-1 bg-gradient-to-b from-emerald-50 to-white">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* Profile Header */}
        <View className="bg-white rounded-xl shadow-md border border-emerald-100 p-4 mb-4">
          <View className="flex-row items-center mb-4">
            <View className="w-20 h-20 rounded-full bg-emerald-100 items-center justify-center mr-4">
              <Text className="text-emerald-700 text-3xl">👤</Text>
            </View>
            <View className="flex-1">
              <Text className="text-emerald-700 text-2xl font-bold mb-1">
                John Doe
              </Text>
              <Text className="text-gray-500">@johndoe</Text>
            </View>
            <TouchableOpacity
              className="bg-emerald-100 p-2 rounded-lg"
              onPress={() => {}}
            >
              <Ionicons name="pencil" size={20} color="#25292e" />
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View className="flex-row justify-between py-4 border-t border-b border-emerald-100">
            <View className="items-center flex-1">
              <Text className="text-emerald-700 text-xl font-bold">42</Text>
              <Text className="text-gray-500 text-sm">Outfits</Text>
            </View>
            <View className="items-center flex-1 border-x border-emerald-100">
              <Text className="text-emerald-700 text-xl font-bold">128</Text>
              <Text className="text-gray-500 text-sm">Following</Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-emerald-700 text-xl font-bold">256</Text>
              <Text className="text-gray-500 text-sm">Followers</Text>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View className="bg-white rounded-xl shadow-md border border-emerald-100 overflow-hidden mb-4">
          <Text className="text-emerald-700 font-semibold text-lg p-4 border-b border-emerald-100">
            Settings
          </Text>

          {/* Account Settings */}
          <View className="p-4 border-b border-emerald-100">
            <Text className="text-gray-500 text-sm mb-3">ACCOUNT</Text>
            <TouchableOpacity className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center">
                <Ionicons name="person-outline" size={20} color="#25292e" />
                <Text className="text-gray-700 ml-3">Edit Profile</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center">
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color="#25292e"
                />
                <Text className="text-gray-700 ml-3">Notifications</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Preferences */}
          <View className="p-4 border-b border-emerald-100">
            <Text className="text-gray-500 text-sm mb-3">PREFERENCES</Text>
            <TouchableOpacity className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center">
                <Ionicons
                  name="color-palette-outline"
                  size={20}
                  color="#25292e"
                />
                <Text className="text-gray-700 ml-3">Theme</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center">
                <Ionicons name="language-outline" size={20} color="#25292e" />
                <Text className="text-gray-700 ml-3">Language</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Support */}
          <View className="p-4">
            <Text className="text-gray-500 text-sm mb-3">SUPPORT</Text>
            <TouchableOpacity className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center">
                <Ionicons
                  name="help-circle-outline"
                  size={20}
                  color="#25292e"
                />
                <Text className="text-gray-700 ml-3">Help Center</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center">
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color="#25292e"
                />
                <Text className="text-gray-700 ml-3">Terms of Service</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          className="bg-red-50 py-4 rounded-xl mb-4"
          onPress={handleLogout}
        >
          <Text className="text-red-600 text-center font-semibold">
            Log Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
