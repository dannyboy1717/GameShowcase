import React from "react";
import { StyleSheet, View } from "react-native";

interface TabBarBackgroundProps {
  colorScheme: "light" | "dark" | null;
}

const TabBarBackground: React.FC<TabBarBackgroundProps> = ({ colorScheme }) => {
  const isDark = colorScheme === "dark";

  // For Android and other platforms, use a solid color View
  return (
    <View
      style={[
        StyleSheet.absoluteFillObject,
        {
          // Black/dark gray for dark mode, white for light mode
          backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
        },
      ]}
    />
  );
};

export default TabBarBackground;
