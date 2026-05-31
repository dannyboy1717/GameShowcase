import type { PropsWithChildren } from "react";
import { Pressable, type StyleProp, type ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import GlassSurface from "@/components/ui/GlassSurface";

type InteractiveGlassProps = PropsWithChildren<{
  onPress?: () => void;
  disabled?: boolean;
  /**
   * Allow the surface to follow the finger with a rubber-band drag before
   * springing back. Disable for chips inside a horizontal ScrollView so the
   * scroll gesture wins. Defaults to true.
   */
  draggable?: boolean;
  tintColor?: string;
  /** Style for the animated wrapper (positioning, margins, shadows). */
  containerStyle?: StyleProp<ViewStyle>;
  /** Style for the glass surface itself (padding, radius, sizing). */
  style?: StyleProp<ViewStyle>;
  pressedScale?: number;
}>;

// Snappy, slightly under-damped so it has a touch of bounce on release.
const SPRING = { damping: 15, stiffness: 240, mass: 0.6 };
// How far the surface is allowed to slide under the finger.
const MAX_DRAG = 7;
// Finger travel beyond this counts as a drag, not a tap.
const TAP_SLOP = 12;

function rubberBand(value: number, max: number) {
  "worklet";
  const sign = value < 0 ? -1 : 1;
  const distance = Math.abs(value);
  return sign * (1 - 1 / ((distance / max) * 0.6 + 1)) * max;
}

export default function InteractiveGlass({
  children,
  onPress,
  disabled,
  draggable = true,
  tintColor,
  containerStyle,
  style,
  pressedScale = 0.95,
}: InteractiveGlassProps) {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  function pressIn() {
    "worklet";
    scale.value = withSpring(pressedScale, SPRING);
  }

  function release() {
    "worklet";
    scale.value = withSpring(1, SPRING);
    translateX.value = withSpring(0, SPRING);
    translateY.value = withSpring(0, SPRING);
  }

  const surface = (
    <GlassSurface interactive tintColor={tintColor} style={style}>
      {children}
    </GlassSurface>
  );

  if (!draggable) {
    // Plain Pressable so an enclosing ScrollView keeps its scroll gesture.
    return (
      <Pressable
        disabled={disabled}
        onPress={onPress}
        onPressIn={() => (scale.value = withSpring(pressedScale, SPRING))}
        onPressOut={() => (scale.value = withSpring(1, SPRING))}
        style={containerStyle}
      >
        <Animated.View style={animatedStyle}>{surface}</Animated.View>
      </Pressable>
    );
  }

  const tap = Gesture.Tap()
    .enabled(!disabled)
    .maxDistance(TAP_SLOP)
    .onEnd((_event, success) => {
      if (success && onPress) {
        runOnJS(onPress)();
      }
    });

  const pan = Gesture.Pan()
    .enabled(!disabled)
    .minDistance(0)
    .onBegin(pressIn)
    .onChange((event) => {
      translateX.value = rubberBand(event.translationX, MAX_DRAG);
      translateY.value = rubberBand(event.translationY, MAX_DRAG);
    })
    .onFinalize(release);

  const gesture = Gesture.Simultaneous(tap, pan);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[containerStyle, animatedStyle]}>{surface}</Animated.View>
    </GestureDetector>
  );
}
