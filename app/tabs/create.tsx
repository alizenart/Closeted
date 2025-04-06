import { View, Text, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { useState } from "react";
import { auth } from "../config/firebase";
import { uploadImage } from "../utils/firebase";
import { router } from "expo-router";

import Button from "@/components/Button";
import ImageViewer from "@/components/ImageViewer";

import * as ImagePicker from "expo-image-picker";

const PlaceholderImage = require("@/assets/images/react-logo.png");

export default function CreateScreen() {
  const [selectedImage, setSelectedImage] = useState<string | undefined>(
    undefined
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  const pickImageAsync = async () => {
    console.log("pickImageAsync");
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
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
      setUploadProgress("Preparing image...");

      setUploadProgress("Uploading to server...");
      const imageUrl = await uploadImage(selectedImage, userId);

      console.log("Image uploaded successfully:", imageUrl);
      setUploadProgress("Upload complete!");

      // Show success message and navigate to outfits tab
      setTimeout(() => {
        alert("Image uploaded successfully!");
        setSelectedImage(undefined);
        setIsUploading(false);
        setUploadProgress("");
        router.push("/tabs/outfits");
      }, 1000);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image. Please try again.");
      setIsUploading(false);
      setUploadProgress("");
    }
  };

  return (
    <View className="flex-1 bg-background items-center">
      <View className="flex-1 w-full items-center justify-center p-4">
        <Text className="text-white text-xl font-bold mb-6">
          Add New Outfit
        </Text>

        <View className="w-full aspect-square rounded-xl overflow-hidden bg-gray-800 shadow-lg mb-6">
          <ImageViewer
            imgSource={PlaceholderImage}
            selectedImage={selectedImage}
          />
        </View>

        {isUploading && (
          <View className="w-full items-center mb-4">
            <ActivityIndicator size="small" color="#4285f4" className="mb-2" />
            <Text className="text-blue-400 text-center">{uploadProgress}</Text>
          </View>
        )}

        <View className="w-full space-y-4">
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
    </View>
  );
}
