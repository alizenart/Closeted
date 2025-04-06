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

interface ButtonProps {
  label: string;
  onPress?: () => void;
  style?: ViewStyle; // Allow the style prop
}

const Button = ({ label, onPress, style }: ButtonProps) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, style]}>
      <Text style={styles.label}>{label}</Text>
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

  return (
    <View style={styles.container}>
      {/* recommendations section */}
      <View style={styles.recommendationsContainer}>
        <Text style={styles.recommendationsTitle}>RECOMMENDATIONS</Text>
        <Text style={styles.recommendationsSubtitle}>
          based on your wishlist
        </Text>

        {/* Rows of Objects */}
        <View style={styles.row}>
          {/* First Row */}
          <View style={styles.objectContainer}>
            <Image
              source={{
                uri: "https://saltymom.net/wp-content/uploads/2016/08/diy-sew-a-square-linen-japanese-dress-saltymom-net.png?w=640",
              }}
              style={styles.squareImage}
            />
            <View style={styles.buttonsContainer}>
              <Button label="A" style={styles.circularButton} />
              <Button label="B" style={styles.circularButton} />
              <Button label="C" style={styles.circularButton} />
            </View>
          </View>
        </View>

        <View style={styles.row}>
          {/* Second Row */}
          <View style={styles.objectContainer}>
            <Image
              source={{
                uri: "https://saltymom.net/wp-content/uploads/2016/08/diy-sew-a-square-linen-japanese-dress-saltymom-net.png?w=640",
              }}
              style={styles.squareImage}
            />
            <View style={styles.buttonsContainer}>
              <Button label="A" style={styles.circularButton} />
              <Button label="B" style={styles.circularButton} />
              <Button label="C" style={styles.circularButton} />
            </View>
          </View>
        </View>
      </View>
      <View style={styles.footerContainer}>
        <Text style={styles.recommendationsTitle}>YOUR OUTFITS</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          style={styles.scrollContainer}
        >
          {/* Pictures of Already Uploaded Outfits */}
          <View style={styles.columnContainer}>
            {loading ? (
              <Text style={styles.loadingText}>Loading outfits...</Text>
            ) : outfits.length > 0 ? (
              <>
                {outfits.slice(0, 5).map((outfit) => (
                  <Image
                    key={outfit.id}
                    source={{ uri: outfit.imageUrl }}
                    style={styles.outfitimage}
                  />
                ))}
                <TouchableOpacity
                  style={styles.seeAllCard}
                  onPress={navigateToOutfits}
                >
                  <Text style={styles.seeAllText}>See all outfits →</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.noOutfitsText}>No outfits yet</Text>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const screenHeight = Dimensions.get("window").height;

const styles = StyleSheet.create({
  scrollContainer: {
    width: "100%",
  },
  columnContainer: {
    flexDirection: "row",
  },
  outfitimage: {
    width: 100,
    height: 250,
    borderRadius: 18,
    marginHorizontal: 10,
    marginVertical: 15,
  },
  seeAllCard: {
    width: 100,
    height: 250,
    borderRadius: 18,
    marginHorizontal: 10,
    marginVertical: 15,
    backgroundColor: "#FFFDD0",
    justifyContent: "center",
    alignItems: "center",
  },
  seeAllText: {
    color: "#406e5e",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  loadingText: {
    color: "white",
    fontSize: 16,
    marginVertical: 15,
    marginHorizontal: 10,
  },
  noOutfitsText: {
    color: "white",
    fontSize: 16,
    marginVertical: 15,
    marginHorizontal: 10,
  },
  container: {
    flex: 1,
    alignItems: "flex-start",
  },
  recommendationsContainer: {
    alignItems: "flex-start",
    padding: 20,
    backgroundColor: "#25292e",
    width: "100%",
    height: screenHeight / 3,
  },
  recommendationsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  recommendationsSubtitle: {
    fontSize: 16,
    color: "gray",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 5,
  },
  objectContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 5,
  },
  squareImage: {
    width: 60,
    height: 60,
    marginRight: 25,
    marginLeft: 25,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 160,
  },
  circularButton: {
    width: 60,
    height: 60,
    borderRadius: 25,
    margin: 5,
    backgroundColor: "#555",
    justifyContent: "center",
    alignItems: "center",
  },
  footerContainer: {
    backgroundColor: "#406e5e",
    width: "100%",
    height: (screenHeight * 2) / 3,
    padding: 20,
  },
  imageContainer: {
    flex: 1,
  },
  image: {
    width: 320,
    height: 440,
    borderRadius: 18,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  label: {
    color: "#fff",
    fontSize: 16,
  },
});
