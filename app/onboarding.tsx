import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ImageBackground,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useUserPreferences } from "./hooks/useUserPreferences";
import { auth } from "./config/firebase";
import { Image } from "expo-image";

const AESTHETICS = [
  {
    id: "minimalist",
    label: "Minimalist",
    image: require("../assets/genres/minimalist.jpg"),
  },
  {
    id: "streetwear",
    label: "Streetwear",
    image: require("../assets/genres/streetwear.jpg"),
  },
  {
    id: "classic_timeless",
    label: "Classic / Timeless",
    image: require("../assets/genres/classic_timeless.jpg"),
  },
  {
    id: "boho",
    label: "Bohemian",
    image: require("../assets/genres/boho.jpg"),
  },
  {
    id: "edgy_punk",
    label: "Edgy / Punk",
    image: require("../assets/genres/edgy_punk.jpg"),
  },
  {
    id: "academia",
    label: "Academia",
    image: require("../assets/genres/academia.jpg"),
  },
  {
    id: "y2k",
    label: "Y2K / Retro",
    image: require("../assets/genres/y2k.jpg"),
  },
  {
    id: "cottagecore",
    label: "Cottagecore",
    image: require("../assets/genres/cottagecore.jpg"),
  },
  {
    id: "athleisure",
    label: "Sporty / Athleisure",
    image: require("../assets/genres/athleisure.jpg"),
  },
  {
    id: "eclectic",
    label: "Artsy / Eclectic",
    image: require("../assets/genres/eclectic.jpg"),
  },
  {
    id: "business",
    label: "Business Casual",
    image: require("../assets/genres/business.jpg"),
  },
];

const { width } = Dimensions.get("window");
const CARD_SPACING = 8;
const CARD_WIDTH = (width - 48 - CARD_SPACING) / 2; // 48 = padding (16 * 2) + gap between cards (16)
const CARD_HEIGHT = CARD_WIDTH * 1.5;

export default function OnboardingScreen() {
  const router = useRouter();
  const [selectedAesthetics, setSelectedAesthetics] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updatePreferences, loading, error, preferences } =
    useUserPreferences();

  useEffect(() => {
    console.log("Onboarding screen mounted");
    console.log("Current user:", auth.currentUser?.uid);
    console.log("Loading:", loading);
    console.log("Preferences:", preferences);
    console.log("Error:", error);
  }, [loading, preferences, error]);

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
    }
  }, [error]);

  useEffect(() => {
    if (preferences?.onboardingCompleted) {
      console.log("Onboarding already completed, redirecting to tabs");
      router.replace("tabs");
    }
  }, [preferences]);

  const toggleAesthetic = (aestheticId: string) => {
    setSelectedAesthetics((prev) => {
      if (prev.includes(aestheticId)) {
        return prev.filter((id) => id !== aestheticId);
      } else {
        return [...prev, aestheticId];
      }
    });
  };

  const handleSubmit = async () => {
    if (selectedAesthetics.length === 0) {
      Alert.alert("Error", "Please select at least one aesthetic");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Submitting preferences:", selectedAesthetics);
      const success = await updatePreferences({
        aesthetics: selectedAesthetics,
        onboardingCompleted: true,
      });

      if (success) {
        console.log("Preferences saved successfully, navigating to tabs");
        router.replace("tabs");
      } else {
        Alert.alert("Error", "Failed to save preferences. Please try again.");
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#4285f4" />
        <Text className="text-text-secondary mt-4">Loading...</Text>
      </View>
    );
  }

  if (!auth.currentUser) {
    console.log("No user found, redirecting to login");
    router.replace("/");
    return null;
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1">
        <View className="p-6 space-y-6">
          <View className="space-y-2">
            <Text className="text-3xl font-bold text-text">
              Welcome to Closeted!
            </Text>
            <Text className="text-text-secondary text-lg">
              Let's personalize your experience. Select the aesthetics that
              interest you:
            </Text>
          </View>

          <View className="flex-row flex-wrap gap-2">
            {AESTHETICS.map((aesthetic) => (
              <TouchableOpacity
                key={aesthetic.id}
                onPress={() => toggleAesthetic(aesthetic.id)}
                style={{
                  width: CARD_WIDTH,
                  height: CARD_HEIGHT,
                  marginBottom: CARD_SPACING,
                }}
              >
                <ImageBackground
                  source={aesthetic.image}
                  style={{
                    width: "100%",
                    height: "100%",
                    justifyContent: "flex-end",
                  }}
                  imageStyle={{
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: selectedAesthetics.includes(aesthetic.id)
                      ? "#4285f4"
                      : "transparent",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "rgba(0,0,0,0.6)",
                      padding: 8,
                      borderBottomLeftRadius: 12,
                      borderBottomRightRadius: 12,
                    }}
                  >
                    <Text
                      className="text-white text-center font-medium"
                      numberOfLines={1}
                    >
                      {aesthetic.label}
                    </Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </View>

          {isSubmitting ? (
            <View className="items-center py-4">
              <ActivityIndicator size="large" color="#4285f4" />
              <Text className="text-text-secondary mt-2">
                Saving preferences...
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleSubmit}
              className="w-full bg-primary py-3 rounded-lg mt-4"
            >
              <Text className="text-white text-center font-semibold">
                Continue
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
