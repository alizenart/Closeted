import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useState } from "react";
import { auth } from "../config/firebase";
import { uploadImage } from "../utils/firebase";

import Button from "@/components/Button";
import ImageViewer from "@/components/ImageViewer";

import * as ImagePicker from "expo-image-picker";

const PlaceholderImage = require("@/assets/images/react-logo.png");

export default function Index() {
  const [selectedImage, setSelectedImage] = useState<string | undefined>(
    undefined
  );
  const [isUploading, setIsUploading] = useState(false);

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

  const handleUpload = async () => {
    if (!selectedImage) {
      alert("Please select an image first");
      return;
    }

    const userId = auth.currentUser?.uid;
    if (!userId) {
      alert("Please sign in to upload images");
      return;
    }

    try {
      setIsUploading(true);
      const imageUrl = await uploadImage(selectedImage, userId);
      console.log("Image uploaded successfully:", imageUrl);
      alert("Image uploaded successfully!");
      setSelectedImage(undefined);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <ImageViewer
          imgSource={PlaceholderImage}
          selectedImage={selectedImage}
        />
      </View>
      <View style={styles.footerContainer}>
        <Button
          theme="primary"
          label="Choose a photo"
          onPress={pickImageAsync}
          disabled={isUploading}
        />
        <Button
          label={isUploading ? "Uploading..." : "Use this photo"}
          onPress={handleUpload}
          disabled={!selectedImage || isUploading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    alignItems: "center",
  },
  imageContainer: {
    flex: 1,
  },
  image: {
    width: 320,
    height: 440,
    borderRadius: 18,
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: "center",
  },
});
