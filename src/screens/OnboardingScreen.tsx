// ─── Onboarding Screen (Mobile) ────────────────────────────────────────────────────
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Check,
  ChevronRight,
  Play as PlayIcon,
  User as UserIcon,
} from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_KEY = "sudoku_onboarding_completed";

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);

  const slides = [
    {
      title: "No Ads. No Noise.",
      subtitle: "Just the puzzle.",
      description:
        "Experience Sudoku without distractions. Clean design, focused gameplay.",
      icon: <PlayIcon size={64} color={colors.primary} strokeWidth={1.5} />,
    },
    {
      title: "6 Difficulty Levels",
      subtitle: "From Beginner to Master.",
      description:
        "Whether you want a quick break or an extreme challenge, we have the perfect puzzle for you.",
      icon: <Check size={64} color={colors.primary} strokeWidth={1.5} />,
    },
    {
      title: "Track Your Progress",
      subtitle: "Statistics & Streaks.",
      description:
        "Monitor your improvement with detailed stats, best times, and win streaks.",
      icon: <Check size={64} color={colors.primary} strokeWidth={1.5} />,
    },
    {
      title: "Play Anywhere",
      subtitle: "Your Choice.",
      description:
        "Play as a guest for instant access, or sign up to sync your progress across devices.",
      icon: <UserIcon size={64} color={colors.primary} strokeWidth={1.5} />,
    },
  ];

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "MainTabs" }] }));
  };

  const handleComplete = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "MainTabs" }] }));
  };

  return (
    <View
      style={[
        S.root,
        { backgroundColor: colors.bgPage, paddingTop: insets.top },
      ]}
    >
      {/* Skip button */}
      {currentIndex < slides.length - 1 && (
        <TouchableOpacity
          style={[S.skipBtn, { top: insets.top + 8 }]}
          onPress={handleSkip}
          accessibilityLabel="Skip onboarding"
          accessibilityRole="button"
        >
          <Text style={[S.skipText, { color: colors.textSecondary }]}>
            Skip
          </Text>
        </TouchableOpacity>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingBottom: insets.bottom,
        }}
      >
        {/* Slide content */}
        <View style={S.slideContent}>
          <View style={S.iconContainer}>{slides[currentIndex].icon}</View>

          <Text style={[S.title, { color: colors.textPrimary }]}>
            {slides[currentIndex].title}
          </Text>
          <Text style={[S.subtitle, { color: colors.primary }]}>
            {slides[currentIndex].subtitle}
          </Text>
          <Text style={[S.description, { color: colors.textSecondary }]}>
            {slides[currentIndex].description}
          </Text>
        </View>

        {/* Pagination dots */}
        <View style={S.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                S.dot,
                {
                  backgroundColor:
                    index === currentIndex
                      ? colors.primary
                      : colors.outlineVariant,
                },
              ]}
            />
          ))}
        </View>

        {/* Next/Continue button */}
        <TouchableOpacity
          style={[S.nextBtn, { backgroundColor: colors.primary }]}
          onPress={handleNext}
          accessibilityLabel={
            currentIndex === slides.length - 1 ? "Get started" : "Next"
          }
          accessibilityRole="button"
        >
          <Text style={[S.nextText, { color: colors.onPrimary }]}>
            {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
          </Text>
          <ChevronRight size={20} color={colors.onPrimary} strokeWidth={2} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1 },
  skipBtn: {
    position: "absolute",
    right: 16,
    padding: 8,
    minHeight: 44,
    justifyContent: "center",
  },
  skipText: {
    fontSize: 14,
    fontWeight: "600",
  },
  slideContent: {
    paddingHorizontal: 32,
    alignItems: "center",
    marginBottom: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    marginTop: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  nextText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
