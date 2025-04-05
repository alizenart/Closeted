import { Stack } from "expo-router";

export default function RootLayout() {
  const isSignedIn = false;

  return (
    <Stack>
      {isSignedIn ? (
        <>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </>
      ) : (
        <Stack.Screen name="index" options={{ headerShown: false }} />
      )}
    </Stack>
  );
}
