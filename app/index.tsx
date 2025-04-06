// landing.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { auth } from "./config/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import * as WebBrowser from "expo-web-browser";
import { LinearGradient } from "expo-linear-gradient";

// Initialize WebBrowser for auth session handling
WebBrowser.maybeCompleteAuthSession();

export default function LandingScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log("Google Sign In successful:", result.user);
      router.replace("/tabs");
    } catch (err: any) {
      console.error("Google Sign In error:", err);
      setError(err.message || "An error occurred during Google Sign In");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        // For new signups, redirect to onboarding
        router.replace("/onboarding");
        return;
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        router.replace("/tabs");
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || "An error occurred during authentication");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.replace("/tabs");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <LinearGradient
        colors={["#f0fdf4", "#dcfce7", "#bbf7d0"]}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          className="flex-1 px-6"
        >
          <Animated.View
            style={{ opacity: fadeAnim }}
            className="flex-1 justify-center items-center"
          >
            <View className="w-full max-w-sm space-y-8">
              <View className="items-center space-y-2">
                <Text className="text-5xl font-bold text-emerald-800 mb-2">
                  Welcome to Closeted
                </Text>
                <Text className="text-emerald-700 text-center text-lg font-medium">
                  {isSignUp ? "Create your account" : "Sign in to your account"}
                </Text>
              </View>

              <View className="space-y-4">
                <TextInput
                  className="w-full bg-white/80 backdrop-blur-sm text-gray-800 px-4 py-3.5 rounded-2xl border border-emerald-200 focus:border-emerald-400 shadow-sm"
                  placeholder="Email"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <TextInput
                  className="w-full bg-white/80 backdrop-blur-sm text-gray-800 px-4 py-3.5 rounded-2xl border border-emerald-200 focus:border-emerald-400 shadow-sm"
                  placeholder="Password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              {error && (
                <View className="bg-red-50 p-4 rounded-2xl border border-red-200">
                  <Text className="text-red-600 text-center font-medium">
                    {error}
                  </Text>
                </View>
              )}

              {isLoading ? (
                <View className="items-center py-4">
                  <ActivityIndicator size="large" color="#059669" />
                </View>
              ) : (
                <View className="space-y-4">
                  <TouchableOpacity
                    onPress={handleAuth}
                    className="w-full bg-emerald-600 py-3.5 rounded-2xl shadow-lg shadow-emerald-200 active:bg-emerald-700"
                  >
                    <Text className="text-white text-center font-semibold text-lg">
                      {isSignUp ? "Sign Up" : "Sign In"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setIsSignUp(!isSignUp)}
                    className="w-full py-3"
                  >
                    <Text className="text-emerald-700 text-center font-medium">
                      {isSignUp
                        ? "Already have an account? Sign In"
                        : "Need an account? Sign Up"}
                    </Text>
                  </TouchableOpacity>

                  <View className="flex-row items-center my-4">
                    <View className="flex-1 h-[1px] bg-emerald-200" />
                    <Text className="mx-4 text-emerald-600 font-medium">
                      OR
                    </Text>
                    <View className="flex-1 h-[1px] bg-emerald-200" />
                  </View>

                  <TouchableOpacity
                    onPress={handleGoogleSignIn}
                    className="w-full bg-white py-3.5 rounded-2xl flex-row items-center justify-center space-x-3 shadow-md border border-emerald-100 active:bg-gray-50"
                  >
                    <Image
                      source={{ uri: "https://www.google.com/favicon.ico" }}
                      className="w-5 h-5"
                    />
                    <Text className="text-gray-700 font-semibold">
                      Sign in with Google
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSkip}
                    className="w-full py-3"
                  >
                    <Text className="text-emerald-600 text-center font-medium">
                      Skip for now
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}
