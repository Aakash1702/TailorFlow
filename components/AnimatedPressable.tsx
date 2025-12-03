import React, { useCallback } from "react";
import { Pressable, PressableProps, ViewStyle, StyleProp } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Easing,
} from "react-native-reanimated";
import { AnimationConfig } from "@/constants/theme";

const AnimatedPressableComponent = Animated.createAnimatedComponent(Pressable);

interface AnimatedPressableProps extends Omit<PressableProps, "style"> {
  style?: StyleProp<ViewStyle>;
  scaleValue?: number;
  opacityValue?: number;
  useSpring?: boolean;
}

export function AnimatedPressable({
  children,
  style,
  onPressIn,
  onPressOut,
  scaleValue = AnimationConfig.press.scale,
  opacityValue = AnimationConfig.press.opacity,
  useSpring: useSpringAnimation = true,
  ...props
}: AnimatedPressableProps) {
  const pressed = useSharedValue(0);

  const handlePressIn = useCallback(
    (e: any) => {
      if (useSpringAnimation) {
        pressed.value = withSpring(1, {
          damping: AnimationConfig.spring.damping,
          stiffness: AnimationConfig.spring.stiffness,
          mass: AnimationConfig.spring.mass,
        });
      } else {
        pressed.value = withTiming(1, {
          duration: AnimationConfig.press.duration,
          easing: Easing.out(Easing.ease),
        });
      }
      onPressIn?.(e);
    },
    [onPressIn, pressed, useSpringAnimation]
  );

  const handlePressOut = useCallback(
    (e: any) => {
      if (useSpringAnimation) {
        pressed.value = withSpring(0, {
          damping: AnimationConfig.spring.damping,
          stiffness: AnimationConfig.spring.stiffness,
          mass: AnimationConfig.spring.mass,
        });
      } else {
        pressed.value = withTiming(0, {
          duration: AnimationConfig.press.duration,
          easing: Easing.out(Easing.ease),
        });
      }
      onPressOut?.(e);
    },
    [onPressOut, pressed, useSpringAnimation]
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: interpolate(pressed.value, [0, 1], [1, scaleValue]) },
      ],
      opacity: interpolate(pressed.value, [0, 1], [1, opacityValue]),
    };
  });

  return (
    <AnimatedPressableComponent
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, style]}
      {...props}
    >
      {children}
    </AnimatedPressableComponent>
  );
}
