// landing.tsx
import React, { useState, useEffect } from "react";
import {
  Button,
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { auth } from "./config/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export default function LandingScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log("User signed in:", result.user);
      router.replace("/tabs");
    } catch (err) {
      console.error("Sign in error:", err);
      setError("An error occurred during sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.replace("/tabs");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Closeted</Text>
      <Text style={styles.subtitle}>Please sign in to continue</Text>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.error}>{error}</Text>
          <Button
            title="Try Again"
            onPress={() => setError(null)}
            color="#4285f4"
          />
        </View>
      )}
      {isLoading ? (
        <ActivityIndicator size="large" color="#4285f4" />
      ) : (
        <>
          <Button
            title="Sign in with Google"
            onPress={handleSignIn}
            color="#4285f4"
          />
          <View style={styles.skipButton}>
            <Button title="Skip" onPress={handleSkip} color="#4285f4" />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 32,
    opacity: 0.8,
  },
  errorContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  error: {
    color: "#ff6b6b",
    marginBottom: 12,
    textAlign: "center",
  },
  skipButton: {
    marginTop: 16,
  },
});
