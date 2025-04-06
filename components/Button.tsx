import React from "react";
import { TouchableOpacity, Text, ViewStyle } from "react-native";

interface Props {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export default function Button({
  label,
  onPress,
  disabled = false,
  style,
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        {
          height: 56,
          backgroundColor: disabled ? "#E5E7EB" : "#25292e",
          borderRadius: 12,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#25292e",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 4,
        },
        style,
      ]}
    >
      <Text
        style={{
          color: disabled ? "#9CA3AF" : "#FFFFFF",
          fontSize: 16,
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
