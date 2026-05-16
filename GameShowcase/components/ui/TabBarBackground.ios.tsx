import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { StyleSheet, useColorScheme } from "react-native";

export default function BlurTabBarBackground() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <BlurView
      tint={isDark ? "dark" : "light"}
      intensity={90}
      style={[StyleSheet.absoluteFill, isDark ? styles.dark : styles.light]}
    />
  );
}

export function useBottomTabOverflow() {
  return useBottomTabBarHeight();
}

const styles = StyleSheet.create({
  light: {
    backgroundColor: "rgba(255, 255, 255, 0.72)",
    borderRadius: 26,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255, 255, 255, 0.65)",
  },
  dark: {
    backgroundColor: "rgba(17, 24, 39, 0.72)",
    borderRadius: 26,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255, 255, 255, 0.14)",
  },
});
