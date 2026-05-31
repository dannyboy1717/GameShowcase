import type { ReactNode } from "react";
import {
  StyleSheet,
  Text,
  useColorScheme,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import InteractiveGlass from "@/components/ui/InteractiveGlass";

type GlassButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  leading?: ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export default function GlassButton({
  label,
  onPress,
  disabled,
  leading,
  style,
  textStyle,
}: GlassButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <InteractiveGlass
      draggable={false}
      disabled={disabled}
      onPress={onPress}
      containerStyle={style}
      style={[
        styles.surface,
        isDark ? styles.surfaceDark : styles.surfaceLight,
        disabled ? styles.surfaceDisabled : null,
      ]}
    >
      <View style={styles.content}>
        {leading ? <View style={styles.leading}>{leading}</View> : null}
        <Text style={[styles.label, isDark ? styles.labelDark : styles.labelLight, textStyle]}>{label}</Text>
      </View>
    </InteractiveGlass>
  );
}

const styles = StyleSheet.create({
  surface: {
    minHeight: 44,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  surfaceLight: {
    backgroundColor: "rgba(255, 255, 255, 0.36)",
  },
  surfaceDark: {
    backgroundColor: "rgba(15, 23, 42, 0.30)",
  },
  surfaceDisabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 24,
  },
  leading: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 18,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  labelLight: {
    color: "#1e1b4b",
  },
  labelDark: {
    color: "#eef2ff",
  },
});
