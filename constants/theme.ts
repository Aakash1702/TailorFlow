import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#1A1A1A",
    textSecondary: "#666666",
    buttonText: "#FFFFFF",
    tabIconDefault: "#999999",
    tabIconSelected: "#D4AF37",
    link: "#D4AF37",
    primary: "#1A1A1A",
    primaryDark: "#000000",
    accent: "#D4AF37",
    accentLight: "#E5C76B",
    backgroundRoot: "#F7F7F7",
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#F7F7F7",
    backgroundTertiary: "#EFEFEF",
    border: "#E5E5E5",
    borderLight: "#F0F0F0",
    success: "#059669",
    warning: "#D97706",
    error: "#DC2626",
    info: "#2563EB",
    pending: "#D97706",
    inProgress: "#2563EB",
    completed: "#059669",
    delivered: "#7C3AED",
    overlay: "rgba(26, 26, 26, 0.6)",
  },
  dark: {
    text: "#F5F5F5",
    textSecondary: "#A0A0A0",
    buttonText: "#FFFFFF",
    tabIconDefault: "#666666",
    tabIconSelected: "#D4AF37",
    link: "#D4AF37",
    primary: "#FFFFFF",
    primaryDark: "#F5F5F5",
    accent: "#D4AF37",
    accentLight: "#E5C76B",
    backgroundRoot: "#0A0A0A",
    backgroundDefault: "#141414",
    backgroundSecondary: "#1E1E1E",
    backgroundTertiary: "#2A2A2A",
    border: "#2A2A2A",
    borderLight: "#1E1E1E",
    success: "#34D399",
    warning: "#FBBF24",
    error: "#F87171",
    info: "#60A5FA",
    pending: "#FBBF24",
    inProgress: "#60A5FA",
    completed: "#34D399",
    delivered: "#A78BFA",
    overlay: "rgba(0, 0, 0, 0.7)",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  "4xl": 48,
  "5xl": 56,
  inputHeight: 52,
  buttonHeight: 52,
  iconButtonSize: 44,
};

export const BorderRadius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  full: 9999,
};

export const Typography = {
  display: {
    fontSize: 36,
    fontWeight: "300" as const,
    letterSpacing: -0.5,
    lineHeight: 44,
  },
  h1: {
    fontSize: 28,
    fontWeight: "300" as const,
    letterSpacing: -0.3,
    lineHeight: 36,
  },
  h2: {
    fontSize: 22,
    fontWeight: "400" as const,
    letterSpacing: -0.2,
    lineHeight: 30,
  },
  h3: {
    fontSize: 18,
    fontWeight: "400" as const,
    letterSpacing: 0,
    lineHeight: 26,
  },
  h4: {
    fontSize: 16,
    fontWeight: "500" as const,
    letterSpacing: 0.1,
    lineHeight: 22,
  },
  body: {
    fontSize: 15,
    fontWeight: "400" as const,
    letterSpacing: 0.2,
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: 15,
    fontWeight: "500" as const,
    letterSpacing: 0.2,
    lineHeight: 24,
  },
  small: {
    fontSize: 13,
    fontWeight: "400" as const,
    letterSpacing: 0.3,
    lineHeight: 20,
  },
  smallMedium: {
    fontSize: 13,
    fontWeight: "500" as const,
    letterSpacing: 0.3,
    lineHeight: 20,
  },
  caption: {
    fontSize: 11,
    fontWeight: "400" as const,
    lineHeight: 16,
    letterSpacing: 0.8,
    textTransform: "uppercase" as const,
  },
  label: {
    fontSize: 12,
    fontWeight: "400" as const,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  link: {
    fontSize: 15,
    fontWeight: "400" as const,
    letterSpacing: 0.2,
    lineHeight: 24,
  },
  stat: {
    fontSize: 32,
    fontWeight: "300" as const,
    letterSpacing: -0.5,
    lineHeight: 40,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "System",
    serif: "Georgia",
    rounded: "System",
    mono: "Menlo",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI', sans-serif",
    serif: "'Playfair Display', Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', -apple-system, BlinkMacSystemFont, sans-serif",
    mono: "'SF Mono', SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});

export const Shadows = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  level1: {
    shadowColor: "#1A1A1A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  level2: {
    shadowColor: "#1A1A1A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  level3: {
    shadowColor: "#1A1A1A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  fab: {
    shadowColor: "#1A1A1A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 2,
    elevation: 6,
  },
  sm: {
    shadowColor: "#1A1A1A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  md: {
    shadowColor: "#1A1A1A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: "#1A1A1A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
};

export const AnimationConfig = {
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 0.8,
  },
  fade: {
    duration: 200,
  },
  press: {
    scale: 0.97,
    opacity: 0.9,
    duration: 120,
  },
};

export type ThemeColors = typeof Colors.light;
export type ThemeType = "light" | "dark";
