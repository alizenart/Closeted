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
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { useUserPreferences } from "./hooks/useUserPreferences";
import { auth } from "./config/firebase";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";

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
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current;

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
      router.replace("/tabs");
    }
  }, [preferences]);

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
        router.replace("/tabs");
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
      <View className="flex-1 bg-emerald-50 justify-center items-center">
        <ActivityIndicator size="large" color="#059669" />
        <Text className="text-emerald-700 mt-4 font-medium">Loading...</Text>
      </View>
    );
  }

  if (!auth.currentUser) {
    console.log("No user found, redirecting to login");
    router.replace("/");
    return null;
  }

  return (
    <View className="flex-1">
      <LinearGradient
        colors={["#f0fdf4", "#dcfce7", "#bbf7d0"]}
        className="flex-1"
      >
        <ScrollView className="flex-1">
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }}
            className="p-6 space-y-6"
          >
            <View className="space-y-2">
              <Text className="text-4xl font-bold text-emerald-800">
                Welcome to Closeted!
              </Text>
              <Text className="text-emerald-700 text-lg font-medium">
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
                      borderRadius: 16,
                      borderWidth: 2,
                      borderColor: selectedAesthetics.includes(aesthetic.id)
                        ? "#059669"
                        : "transparent",
                    }}
                  >
                    <LinearGradient
                      colors={["transparent", "rgba(0,0,0,0.8)"]}
                      style={{
                        padding: 12,
                        borderBottomLeftRadius: 16,
                        borderBottomRightRadius: 16,
                      }}
                    >
                      <Text
                        className="text-white text-center font-semibold text-base"
                        numberOfLines={1}
                      >
                        {aesthetic.label}
                      </Text>
                    </LinearGradient>
                  </ImageBackground>
                </TouchableOpacity>
              ))}
            </View>

            {isSubmitting ? (
              <View className="items-center py-4">
                <ActivityIndicator size="large" color="#059669" />
                <Text className="text-emerald-700 mt-2 font-medium">
                  Saving preferences...
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleSubmit}
                className="w-full bg-emerald-600 py-3.5 rounded-2xl shadow-lg shadow-emerald-200 active:bg-emerald-700"
              >
                <Text className="text-white text-center font-semibold text-lg">
                  Continue
                </Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}
