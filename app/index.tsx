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
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      router.replace("/tabs");
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
      className="flex-1 bg-background"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1 px-6"
      >
        <View className="flex-1 justify-center items-center">
          <View className="w-full max-w-sm space-y-8">
            <View className="items-center">
              <Text className="text-3xl font-bold text-text mb-2">
                Welcome to Closeted
              </Text>
              <Text className="text-text-secondary text-center">
                {isSignUp ? "Create your account" : "Sign in to your account"}
              </Text>
            </View>

            <View className="space-y-4">
              <TextInput
                className="w-full bg-background-light text-text px-4 py-3 rounded-lg"
                placeholder="Email"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TextInput
                className="w-full bg-background-light text-text px-4 py-3 rounded-lg"
                placeholder="Password"
                placeholderTextColor="#666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {error && (
              <View className="bg-red-500/10 p-4 rounded-lg">
                <Text className="text-red-500 text-center">{error}</Text>
              </View>
            )}

            {isLoading ? (
              <View className="items-center py-4">
                <ActivityIndicator size="large" color="#4285f4" />
              </View>
            ) : (
              <View className="space-y-4">
                <TouchableOpacity
                  onPress={handleAuth}
                  className="w-full bg-primary py-3 rounded-lg"
                >
                  <Text className="text-white text-center font-semibold">
                    {isSignUp ? "Sign Up" : "Sign In"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setIsSignUp(!isSignUp)}
                  className="w-full py-3"
                >
                  <Text className="text-text-secondary text-center">
                    {isSignUp
                      ? "Already have an account? Sign In"
                      : "Need an account? Sign Up"}
                  </Text>
                </TouchableOpacity>

                <View className="flex-row items-center my-4">
                  <View className="flex-1 h-[1px] bg-gray-600" />
                  <Text className="mx-4 text-text-secondary">OR</Text>
                  <View className="flex-1 h-[1px] bg-gray-600" />
                </View>

                <TouchableOpacity
                  onPress={handleGoogleSignIn}
                  className="w-full bg-white py-3 rounded-lg flex-row items-center justify-center space-x-2"
                >
                  <Image
                    source={{ uri: "https://www.google.com/favicon.ico" }}
                    className="w-5 h-5"
                  />
                  <Text className="text-gray-800 font-semibold">
                    Sign in with Google
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleSkip} className="w-full py-3">
                  <Text className="text-text-secondary text-center">
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
