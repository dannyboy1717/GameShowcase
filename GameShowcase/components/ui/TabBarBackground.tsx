import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";

export default function TabBarBackground() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  if (Platform.OS === "web") {
    return <View style={[StyleSheet.absoluteFill, isDark ? styles.webDark : styles.webLight]} />;
  }

  return (
    <BlurView
      intensity={Platform.OS === "ios" ? 90 : 60}
      tint={isDark ? "dark" : "light"}
      style={[StyleSheet.absoluteFill, isDark ? styles.dark : styles.light]}
    />
  );
}

export function useBottomTabOverflow() {
  return 0;
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
  webLight: {
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    borderRadius: 26,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(203, 213, 225, 0.8)",
  },
  webDark: {
    backgroundColor: "rgba(17, 24, 39, 0.9)",
    borderRadius: 26,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255, 255, 255, 0.14)",
  },
});
