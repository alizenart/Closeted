import React from "react";
import { Text, View, StyleSheet } from "react-native";

export default function SocialScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Social</Text>
      <Text style={styles.subtitle}>
        Connect with other fashion enthusiasts
      </Text>

      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>Social features coming soon!</Text>
        <Text style={styles.emptySubtext}>Follow us for updates</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    padding: 20,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    color: "#aaa",
    fontSize: 16,
    marginBottom: 30,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 8,
  },
  emptySubtext: {
    color: "#aaa",
    fontSize: 14,
  },
});
