import {
  View,
  Text,
  ActivityIndicator,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { useState, useEffect } from "react";
import { auth } from "../config/firebase";
import { uploadImage } from "../utils/firebase";
import { router } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import Slider from "@react-native-community/slider";

import Button from "@/components/Button";
import ImageViewer from "@/components/ImageViewer";

import * as ImagePicker from "expo-image-picker";

const PlaceholderImage = require("@/assets/images/react-logo.png");

const GENRES = [
  "Minimalist",
  "Classic / Timeless",
  "Streetwear",
  "Boho",
  "Edgy / Punk",
  "Academia",
  "Y2K / Retro",
  "Cottagecore",
  "Sporty / Athleisure",
  "Artsy / Eclectic",
  "Techwear / Futuristic",
  "Business Casual / Smart Chic",
  "Other"
];

export default function CreateScreen() {
  const [selectedImage, setSelectedImage] = useState<string | undefined>(
    undefined
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [rating, setRating] = useState<number>(5);
  const [genre, setGenre] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const pickImageAsync = async () => {
    console.log("pickImageAsync");
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      console.log("Image selected:", result.assets[0].uri);
      setSelectedImage(result.assets[0].uri);
    } else {
      alert("You did not select any image.");
    }
  };

  // Debug selectedImage changes
  useEffect(() => {
    console.log("selectedImage changed:", selectedImage);
  }, [selectedImage]);

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
      const imageUrl = await uploadImage(selectedImage, userId, {
        details: details.trim(),
        rating,
        genre,
        date,
      });

      console.log("Image uploaded successfully:", imageUrl);
      setUploadProgress("Upload complete!");

      // Show success message and navigate to outfits tab
      setTimeout(() => {
        alert("Image uploaded successfully!");
        setSelectedImage(undefined);
        setDetails("");
        setRating(5);
        setGenre("");
        setDate(new Date());
        setIsUploading(false);
        setUploadProgress("");
        router.push("/tabs/closet");
      }, 1000);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image. Please try again.");
      setIsUploading(false);
      setUploadProgress("");
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="w-full items-center p-4">
        <Text className="text-white text-xl font-bold mb-6">
          Add New Outfit
        </Text>

        <View className="w-48 h-48 rounded-xl overflow-hidden bg-gray-800 shadow-lg mb-6">
          {selectedImage ? (
            <Image
              source={{ uri: selectedImage }}
              className="w-full h-full"
              contentFit="cover"
              transition={200}
              onError={(error) => console.error("Image loading error:", error)}
            />
          ) : (
            <Image
              source={PlaceholderImage}
              className="w-full h-full"
              contentFit="cover"
            />
          )}
        </View>

        <View className="w-full space-y-4 mb-4">
          <TextInput
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg"
            placeholder="Add details about your outfit..."
            placeholderTextColor="#666"
            value={details}
            onChangeText={setDetails}
            multiline
            numberOfLines={3}
          />

          <View className="bg-gray-800 p-4 rounded-lg">
            <Text className="text-white mb-2">Rating: {rating}/10</Text>
            <Slider
              style={{ width: "100%", height: 40 }}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={rating}
              onValueChange={setRating}
              minimumTrackTintColor="#ffd33d"
              maximumTrackTintColor="#666"
              thumbTintColor="#ffd33d"
            />
          </View>

          <TouchableOpacity
            className="w-full bg-gray-800 px-4 py-3 rounded-lg"
            onPress={() => setShowDatePicker(true)}
          >
            <Text className="text-white">
              Date: {date.toLocaleDateString()}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}

          <View className="bg-gray-800 p-4 rounded-lg">
            <Text className="text-white mb-2">Genre</Text>
            <View className="flex-row flex-wrap gap-2">
              {GENRES.map((g) => (
                <TouchableOpacity
                  key={g}
                  className={`px-3 py-1 rounded-full ${
                    genre === g ? "bg-yellow-400" : "bg-gray-700"
                  }`}
                  onPress={() => setGenre(g)}
                >
                  <Text
                    className={`${
                      genre === g ? "text-gray-900" : "text-white"
                    }`}
                  >
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
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
    </ScrollView>
  );
}
