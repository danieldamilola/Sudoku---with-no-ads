import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  LayoutGrid,
  BarChart3,
  SlidersHorizontal,
  User,
} from "lucide-react-native";

import { HomeScreen } from "../screens/HomeScreen";
import { GameScreen } from "../screens/GameScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { StatisticsScreen } from "../screens/StatisticsScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import { GameHistoryScreen } from "../screens/GameHistoryScreen";
import SignInScreen from "../screens/SignInScreen";
import SignUpScreen from "../screens/SignUpScreen";
import { useTheme } from "../context/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Animation presets ────────────────────────────────────────────────────────

/**
 * TAB — used for Settings / Statistics.
 * Instant switch, no animation — matches native iOS/Android tab bar behaviour.
 */
const TAB = {
  animation: "none" as const,
  gestureEnabled: false,
};

/**
 * SLIDE UP — used only for the Game screen.
 * Signals a context shift into an immersive focused mode.
 * Dismisses by swiping down (vertical gesture).
 */
const GAME = {
  animation: "slide_from_bottom" as const,
  animationDuration: 250,
  gestureEnabled: true,
  gestureDirection: "vertical" as const,
  fullScreenGestureEnabled: true,
  customAnimationOnSwipe: true,
};

// ─── Tab Icon Component ───────────────────────────────────────────────────────
const TabIcon: React.FC<{
  LIcon: React.FC<{ size: number; color: string; strokeWidth: number }>;
  color: string;
  focused: boolean;
  size: number;
}> = ({ LIcon, color, focused, size }) => (
  <LIcon size={size} color={color} strokeWidth={focused ? 2.2 : 1.8} />
);

// ─── Tab Bar Label Component ──────────────────────────────────────────────────
const TabLabel: React.FC<{
  label: string;
  color: string;
  focused: boolean;
}> = ({ label, color, focused }) => (
  <Text
    style={{
      fontSize: 11,
      fontWeight: focused ? "700" : "400",
      color,
      letterSpacing: 0.3,
    }}
  >
    {label}
  </Text>
);

// ─── Main Tab Navigator ────────────────────────────────────────────────────────
const TAB_CONFIG = [
  { name: "Home" as const, label: "Play", LIcon: LayoutGrid },
  { name: "Statistics" as const, label: "Stats", LIcon: BarChart3 },
  { name: "Settings" as const, label: "Settings", LIcon: SlidersHorizontal },
  { name: "Profile" as const, label: "Profile", LIcon: User },
];

const MainTabNavigator: React.FC = () => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        animation: "fade",
        tabBarStyle: {
          backgroundColor: colors.bgSurface,
          borderTopWidth: isDark ? StyleSheet.hairlineWidth : 0,
          borderTopColor: colors.outlineVariant,
          shadowColor: "#000",
          shadowOpacity: isDark ? 0 : 0.07,
          shadowOffset: { width: 0, height: -3 },
          shadowRadius: 12,
          elevation: isDark ? 0 : 10,
          height: 60 + Math.max(insets.bottom, 10),
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 10),
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelPosition: "below-icon",
      }}
    >
      {TAB_CONFIG.map(({ name, label, LIcon }) => (
        <Tab.Screen
          key={name}
          name={name}
          component={
            name === "Home"
              ? HomeScreen
              : name === "Statistics"
                ? StatisticsScreen
                : name === "Settings"
                  ? SettingsScreen
                  : ProfileScreen
          }
          options={{
            tabBarLabel: ({ color, focused }) => (
              <TabLabel label={label} color={color} focused={focused} />
            ),
            tabBarIcon: ({ color, focused, size }) => (
              <TabIcon
                LIcon={LIcon}
                color={color}
                focused={focused}
                size={size}
              />
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

// ─── Root Stack Navigator ─────────────────────────────────────────────────────
export const AppNavigator: React.FC = () => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    AsyncStorage.getItem("sudoku_onboarding_completed").then((value) => {
      setHasCompletedOnboarding(value === "true");
    });
  }, []);

  if (hasCompletedOnboarding === null) {
    return null; // Loading
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={hasCompletedOnboarding ? "MainTabs" : "Onboarding"}
        screenOptions={{
          headerShown: false,
          animation: "fade",
          animationDuration: 180,
        }}
      >
        {/* ── Onboarding gate (shown once) ── */}
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ animation: "fade" }}
        />

        {/* ── Auth screens ── */}
        <Stack.Screen
          name="SignIn"
          component={SignInScreen}
          options={{ animation: "fade" }}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{ animation: "fade" }}
        />

        {/* ── Main tab navigator (Home, Stats, Settings, Profile) ── */}
        <Stack.Screen
          name="MainTabs"
          component={MainTabNavigator}
          options={{ animation: "none" }}
        />

        {/* ── Game screen — pushes on top of tabs, hides tab bar ── */}
        <Stack.Screen name="Game" component={GameScreen} options={GAME} />

        {/* ── Secondary screens ── */}
        <Stack.Screen
          name="GameHistory"
          component={GameHistoryScreen}
          options={{ animation: "fade" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
