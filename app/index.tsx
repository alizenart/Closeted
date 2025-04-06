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

// Initialize WebBrowser for auth session handling
WebBrowser.maybeCompleteAuthSession();

export default function LandingScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

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
      className="flex-1 bg-gradient-to-b from-emerald-50 to-white"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1 px-6"
      >
        <View className="flex-1 justify-center items-center">
          <View className="w-full max-w-sm space-y-8">
            <View className="items-center">
              <Text className="text-4xl font-bold text-emerald-700 mb-2">
                Welcome to Closeted
              </Text>
              <Text className="text-emerald-600 text-center text-lg">
                {isSignUp ? "Create your account" : "Sign in to your account"}
              </Text>
            </View>

            <View className="space-y-4">
              <TextInput
                className="w-full bg-white text-gray-800 px-4 py-3 rounded-xl border border-emerald-200 focus:border-emerald-400 shadow-sm"
                placeholder="Email"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TextInput
                className="w-full bg-white text-gray-800 px-4 py-3 rounded-xl border border-emerald-200 focus:border-emerald-400 shadow-sm"
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {error && (
              <View className="bg-red-100 p-4 rounded-xl border border-red-200">
                <Text className="text-red-500 text-center">{error}</Text>
              </View>
            )}

            {isLoading ? (
              <View className="items-center py-4">
                <ActivityIndicator size="large" color="#25292e" />
              </View>
            ) : (
              <View className="space-y-4">
                <TouchableOpacity
                  onPress={handleAuth}
                  className="w-full bg-emerald-600 py-3 rounded-xl shadow-md shadow-emerald-200"
                >
                  <Text className="text-white text-center font-semibold text-lg">
                    {isSignUp ? "Sign Up" : "Sign In"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setIsSignUp(!isSignUp)}
                  className="w-full py-3"
                >
                  <Text className="text-emerald-600 text-center">
                    {isSignUp
                      ? "Already have an account? Sign In"
                      : "Need an account? Sign Up"}
                  </Text>
                </TouchableOpacity>

                <View className="flex-row items-center my-4">
                  <View className="flex-1 h-[1px] bg-emerald-200" />
                  <Text className="mx-4 text-emerald-500">OR</Text>
                  <View className="flex-1 h-[1px] bg-emerald-200" />
                </View>

                <TouchableOpacity
                  onPress={handleGoogleSignIn}
                  className="w-full bg-white py-3 rounded-xl flex-row items-center justify-center space-x-2 shadow-md border border-emerald-100"
                >
                  <Image
                    source={{ uri: "https://www.google.com/favicon.ico" }}
                    className="w-5 h-5"
                  />
                  <Text className="text-gray-700 font-semibold">
                    Sign in with Google
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleSkip} className="w-full py-3">
                  <Text className="text-emerald-500 text-center">
                    Skip for now
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
