import React, {
  ScrollView,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
  Dimensions,
} from "react-native";
import { Image } from "react-native";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import { auth } from "../config/firebase";
import { getUserOutfitsFromStorage, Outfit } from "../utils/firebase";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

interface ButtonProps {
  label: string;
  onPress?: () => void;
  style?: ViewStyle;
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

  // Load outfits when component mounts
  useEffect(() => {
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

    loadOutfits();
  }, []);

  // Navigate to outfits tab
  const navigateToOutfits = () => {
    router.push("/tabs/closet");
  };

  // Navigate to create tab
  const navigateToCreate = () => {
    router.push("/tabs/create");
  };

  return (
    <View className="flex-1 bg-emerald-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
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

          {/* Rows of Objects */}
          <View className="space-y-4">
            {/* First Row */}
            <View className="bg-white rounded-2xl p-3 shadow-sm">
              <Image
                source={{
                  uri: "https://saltymom.net/wp-content/uploads/2016/08/diy-sew-a-square-linen-japanese-dress-saltymom-net.png?w=640",
                }}
                className="w-full h-40 rounded-xl"
                resizeMode="cover"
              />
              <View className="flex-row justify-center space-x-3 mt-3">
                <Button label="A" style={styles.circularButton} />
                <Button label="B" style={styles.circularButton} />
                <Button label="C" style={styles.circularButton} />
              </View>
            </View>

            {/* Second Row */}
            <View className="bg-white rounded-2xl p-3 shadow-sm">
              <Image
                source={{
                  uri: "https://saltymom.net/wp-content/uploads/2016/08/diy-sew-a-square-linen-japanese-dress-saltymom-net.png?w=640",
                }}
                className="w-full h-40 rounded-xl"
                resizeMode="cover"
              />
              <View className="flex-row justify-center space-x-3 mt-3">
                <Button label="A" style={styles.circularButton} />
                <Button label="B" style={styles.circularButton} />
                <Button label="C" style={styles.circularButton} />
              </View>
            </View>
          </View>
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
  circularButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
});
