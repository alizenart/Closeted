// landing.tsx
import React, { useState, useCallback } from "react";
import {
  Button,
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useRouter } from "expo-router";


WebBrowser.maybeCompleteAuthSession();

export default function LandingScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId:
      "990901503386-br1v68ijcidvh70t3kdb5bdc15r2tp00.apps.googleusercontent.com",
    iosClientId:
      "990901503386-br1v68ijcidvh70t3kdb5bdc15r2tp00.apps.googleusercontent.com",
    webClientId:
      "990901503386-br1v68ijcidvh70t3kdb5bdc15r2tp00.apps.googleusercontent.com",
    redirectUri: "http://localhost:8081",
    scopes: ["openid", "profile", "email"],
    responseType: "token",
  });

  const handleAuthResponse = useCallback(async () => {
    if (response?.type === "success") {
      try {
        const { authentication } = response;

        if (!authentication) {
          throw new Error("No authentication data received");
        }

        console.log("Authentication response type:", response.type);
        console.log(
          "Full response:",
          JSON.stringify(
            {
              type: response.type,
              url: response.url,
              error: response.error,
              params: response.params,
            },
            null,
            2
          )
        );
        console.log(
          "Authentication data:",
          JSON.stringify(
            {
              accessToken: authentication.accessToken,
              expiresIn: authentication.expiresIn,
              scope: authentication.scope,
              state: authentication.state,
            },
            null,
            2
          )
        );

        // For now, just navigate to tabs
        router.replace("/tabs");
      } catch (err) {
        console.error("Error processing authentication:", err);
        setError("Failed to process authentication. Please try again.");
        setIsLoading(false);
      }
    } else if (response?.type === "error") {
      console.error("Authentication error details:", {
        error: response.error,
        errorCode: response.error?.code,
        errorMessage: response.error?.message,
        fullResponse: JSON.stringify(response, null, 2),
      });
      setError(`Auth Error: ${response.error?.message || "Please try again."}`);
      setIsLoading(false);
    } else if (response?.type === "dismiss") {
      console.log("Auth flow dismissed by user");
      setIsLoading(false);
    }
  }, [response, router]);

  React.useEffect(() => {
    handleAuthResponse();
  }, [handleAuthResponse]);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Starting OAuth flow...");
      console.log("Auth request config:", {
        clientId: request?.clientId,
        redirectUri: request?.redirectUri,
        responseType: request?.responseType,
        scopes: request?.scopes,
      });

      const result = await promptAsync();
      console.log("Sign in result:", JSON.stringify(result, null, 2));

      if (result.type !== "success") {
        console.error("Sign in failed:", {
          type: result.type,
        });
        setError("Sign in was not completed. Please try again.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Sign in error:", JSON.stringify(err, null, 2));
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const retrySignIn = () => {
    setError(null);
    setIsLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Closeted</Text>
      <Text style={styles.subtitle}>Please sign in to continue</Text>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.error}>{error}</Text>
          <Button title="Try Again" onPress={retrySignIn} color="#4285f4" />
        </View>
      )}
      {isLoading ? (
        <ActivityIndicator size="large" color="#4285f4" />
      ) : (
        !error && (
          <Button
            disabled={!request}
            title="Sign in with Google"
            onPress={handleSignIn}
            color="#4285f4"
          />
        )
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
});
