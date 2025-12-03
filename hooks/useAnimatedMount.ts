import { useEffect } from "react";
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { AnimationConfig } from "@/constants/theme";

interface UseAnimatedMountOptions {
  delay?: number;
  duration?: number;
  translateY?: number;
  useSpring?: boolean;
}

export function useAnimatedMount(options: UseAnimatedMountOptions = {}) {
  const {
    delay = 0,
    duration = AnimationConfig.fade.duration,
    translateY = 20,
    useSpring: useSpringAnimation = false,
  } = options;

  const opacity = useSharedValue(0);
  const translateYValue = useSharedValue(translateY);

  useEffect(() => {
    const animateValue = useSpringAnimation
      ? withDelay(
          delay,
          withSpring(1, {
            damping: AnimationConfig.spring.damping,
            stiffness: AnimationConfig.spring.stiffness,
          })
        )
      : withDelay(
          delay,
          withTiming(1, {
            duration,
            easing: Easing.out(Easing.ease),
          })
        );

    opacity.value = animateValue;
    translateYValue.value = useSpringAnimation
      ? withDelay(
          delay,
          withSpring(0, {
            damping: AnimationConfig.spring.damping,
            stiffness: AnimationConfig.spring.stiffness,
          })
        )
      : withDelay(
          delay,
          withTiming(0, {
            duration,
            easing: Easing.out(Easing.ease),
          })
        );
  }, [delay, duration, opacity, translateYValue, useSpringAnimation]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateYValue.value }],
  }));

  return animatedStyle;
}

export function useStaggeredMount(itemCount: number, baseDelay: number = 50) {
  const delays = Array.from({ length: itemCount }, (_, i) => i * baseDelay);
  return delays;
}
