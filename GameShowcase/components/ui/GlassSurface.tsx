import { BlurView } from "expo-blur";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import type { PropsWithChildren } from "react";
import {
  Platform,
  StyleSheet,
  useColorScheme,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";

type GlassSurfaceProps = PropsWithChildren<
  ViewProps & {
    style?: StyleProp<ViewStyle>;
  }
>;

export default function GlassSurface({ children, style, ...rest }: GlassSurfaceProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const baseStyle = [styles.base, isDark ? styles.baseDark : styles.baseLight, style];

  if (Platform.OS === "ios" && isLiquidGlassAvailable()) {
    return (
      <GlassView
        {...rest}
        glassEffectStyle="regular"
        tintColor={isDark ? "rgba(99, 102, 241, 0.16)" : "rgba(255, 255, 255, 0.18)"}
        style={baseStyle}
      >
        {children}
      </GlassView>
    );
  }

  if (Platform.OS === "web") {
    return (
      <View {...rest} style={baseStyle}>
        {children}
      </View>
    );
  }

  return (
    <BlurView {...rest} intensity={55} tint={isDark ? "dark" : "light"} style={baseStyle}>
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
  },
  baseLight: {
    backgroundColor: "rgba(255, 255, 255, 0.40)",
    borderColor: "rgba(255, 255, 255, 0.55)",
  },
  baseDark: {
    backgroundColor: "rgba(15, 23, 42, 0.38)",
    borderColor: "rgba(255, 255, 255, 0.14)",
  },
});
