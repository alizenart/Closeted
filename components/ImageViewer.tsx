import { Image, type ImageSource } from "expo-image";

type Props = {
  imgSource: ImageSource;
  selectedImage?: string;
};

export default function ImageViewer({ imgSource, selectedImage }: Props) {
  const imageSource = selectedImage ? { uri: selectedImage } : imgSource;
  return (
    <Image
      source={imageSource}
      className="w-full h-full rounded-xl"
      contentFit="cover"
    />
  );
}
