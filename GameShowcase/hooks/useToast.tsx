"use client";

import Ionicons from "@expo/vector-icons/Ionicons";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import GlassSurface from "@/components/ui/GlassSurface";

const VISIBLE_MS = 2400;
const FADE_MS = 200;

type ToastContextType = {
    showToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * App-level so a toast survives navigation — "Game added" is shown as the add
 * screen pops, and needs to land on the games list rather than disappear with
 * the screen that triggered it.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
    const [message, setMessage] = useState<string | null>(null);
    const insets = useSafeAreaInsets();
    const isDark = useColorScheme() === "dark";

    const opacity = useSharedValue(0);
    const translateY = useSharedValue(-16);
    const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showToast = useCallback(
        (nextMessage: string) => {
            if (hideTimer.current) {
                clearTimeout(hideTimer.current);
            }

            setMessage(nextMessage);
            opacity.value = withTiming(1, { duration: FADE_MS });
            translateY.value = withTiming(0, { duration: FADE_MS });

            hideTimer.current = setTimeout(() => {
                opacity.value = withTiming(0, { duration: FADE_MS });
                translateY.value = withTiming(-16, { duration: FADE_MS });

                // Clear the text only once it has faded, so it doesn't blink out.
                hideTimer.current = setTimeout(() => setMessage(null), FADE_MS);
            }, VISIBLE_MS);
        },
        [opacity, translateY]
    );

    useEffect(() => {
        return () => {
            if (hideTimer.current) {
                clearTimeout(hideTimer.current);
            }
        };
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    const value = useMemo<ToastContextType>(() => ({ showToast }), [showToast]);

    return (
        <ToastContext.Provider value={value}>
            {children}

            {message ? (
                <Animated.View
                    // Sits below the account button, which occupies the top-right
                    // corner. pointerEvents none so it never eats a tap.
                    style={[{ position: "absolute", top: insets.top + 60, left: 24, right: 24, zIndex: 50 }, animatedStyle]}
                    pointerEvents="none"
                    accessibilityLiveRegion="polite"
                >
                    <GlassSurface style={styles.surface}>
                        <View style={styles.content}>
                            <Ionicons name="checkmark-circle" size={20} color={isDark ? "#a5b4fc" : "#4f46e5"} />
                            <Text style={[styles.label, { color: isDark ? "#eef2ff" : "#1e1b4b" }]} numberOfLines={2}>
                                {message}
                            </Text>
                        </View>
                    </GlassSurface>
                </Animated.View>
            ) : null}
        </ToastContext.Provider>
    );
}

export function useToast(): ToastContextType {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }

    return context;
}

const styles = StyleSheet.create({
    surface: {
        borderRadius: 999,
        paddingHorizontal: 18,
        paddingVertical: 12,
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.14,
        shadowRadius: 20,
        elevation: 6,
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
    },
    label: {
        fontSize: 15,
        fontWeight: "600",
        flexShrink: 1,
    },
});
