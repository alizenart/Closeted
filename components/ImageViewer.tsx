import { Image, type ImageSource } from "expo-image";
import { useEffect } from "react";

type Props = {
  imgSource: ImageSource;
  selectedImage?: string;
};

export default function ImageViewer({ imgSource, selectedImage }: Props) {
  // Debug props
  useEffect(() => {
    console.log("ImageViewer props:", { imgSource, selectedImage });
  }, [imgSource, selectedImage]);

  // Determine the image source
  const imageSource = selectedImage ? { uri: selectedImage } : imgSource;
  console.log("Using image source:", imageSource);

  return (
    <Image
      source={imageSource}
      className="w-full h-full"
      contentFit="cover"
      transition={200}
      onError={(error) => console.error("Image loading error:", error)}
    />
  );
}
