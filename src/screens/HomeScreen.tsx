import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ChevronDown,
  ChevronRight,
  BarChart3,
  Settings,
  Lock,
} from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { useStore } from "../store/useStore";
import { Difficulty, SudokuCell } from "../types";
import { formatTime } from "../utils/time";
import { BrandMark } from "../components/BrandMark";
import { Surface } from "../components/ui/Surface";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Spacing, BorderRadius } from "../theme/spacing";

// ─── Difficulty metadata ────────────────────────────────────────────────────
const DIFF: Record<
  Difficulty,
  {
    tag: string;
    tier: string;
    desc: string;
    tagColor: string;
    tagBg: string;
  }
> = {
  [Difficulty.Beginner]: {
    tag: "BEGINNER",
    tier: "Beginner",
    desc: "Gentle logic for a quick mental break.",
    tagColor: "#1a7a40",
    tagBg: "#d4f0e0",
  },
  [Difficulty.Skill]: {
    tag: "SKILL",
    tier: "Skill",
    desc: "Balanced puzzles for daily focus.",
    tagColor: "#3650d4",
    tagBg: "#e8edfb",
  },
  [Difficulty.Hard]: {
    tag: "HARD",
    tier: "Hard",
    desc: "Complex patterns and deep strategy.",
    tagColor: "#a04f00",
    tagBg: "#fde8cc",
  },
  [Difficulty.Advanced]: {
    tag: "ADVANCED",
    tier: "Advanced",
    desc: "Challenging for experienced players.",
    tagColor: "#c0180f",
    tagBg: "#fde4e2",
  },
  [Difficulty.Expert]: {
    tag: "EXPERT",
    tier: "Expert",
    desc: "Extreme challenges for the dedicated.",
    tagColor: "#c0180f",
    tagBg: "#fde4e2",
  },
  [Difficulty.Master]: {
    tag: "MASTER",
    tier: "Master",
    desc: "Ultimate challenge for Sudoku masters.",
    tagColor: "#6b30d4",
    tagBg: "#ede6fc",
  },
};

// ─── Screen ──────────────────────────────────────────────────────────────────
export const HomeScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const cells = useStore((s) => s.cells);
  const difficulty = useStore((s) => s.difficulty);
  const elapsed = useStore((s) => s.elapsedSeconds);
  const completed = useStore((s) => s.isCompleted);
  const stats = useStore((s) => s.stats);
  const settings = useStore((s) => s.settings);

  const hasActive =
    cells.some((c: SudokuCell) => c.value !== null) && !completed;
  const filled = cells.filter((c: SudokuCell) => c.value !== null).length;
  const completion = hasActive ? Math.round((filled / 81) * 100) : 0;
  const [showAllDifficulties, setShowAllDifficulties] = React.useState(false);

  const startGame = (d: Difficulty) => {
    useStore.getState().startNewGame(d);
    // Navigate to Game in the parent stack (above the tab navigator)
    navigation.getParent()?.navigate("Game" as never);
  };

  const allBestTimes = (
    Object.values(stats.bestTimes) as (number | undefined)[]
  ).filter((t): t is number => !!t);
  const bestTime = allBestTimes.length > 0 ? Math.min(...allBestTimes) : null;

  const getUnlockRequirement = (d: Difficulty): string | null => {
    if (settings.unlockedDifficulties.includes(d)) return null;
    switch (d) {
      case Difficulty.Hard: {
        const wins = stats.winsByDifficulty[Difficulty.Skill] ?? 0;
        return `Win ${Math.max(0, 4 - wins)} more in Skill`;
      }
      case Difficulty.Advanced: {
        const wins = stats.winsByDifficulty[Difficulty.Hard] ?? 0;
        return `Win ${Math.max(0, 8 - wins)} more in Hard`;
      }
      case Difficulty.Expert:
      case Difficulty.Master: {
        const wins = stats.winsByDifficulty[Difficulty.Advanced] ?? 0;
        return `Win ${Math.max(0, 16 - wins)} more in Advanced`;
      }
      default:
        return null;
    }
  };

  const visibleDifficulties = showAllDifficulties
    ? ([
        Difficulty.Beginner,
        Difficulty.Skill,
        Difficulty.Hard,
        Difficulty.Advanced,
        Difficulty.Expert,
        Difficulty.Master,
      ] as const)
    : ([
        Difficulty.Beginner,
        Difficulty.Skill,
        Difficulty.Hard,
        Difficulty.Advanced,
      ] as const);

  return (
    <View
      style={[
        S.root,
        { backgroundColor: colors.bgPage, paddingTop: insets.top },
      ]}
    >
      {/* ── Top bar ── */}
      <View style={S.topBar}>
        <BrandMark size={30} color={colors.textPrimary} />
        <View style={{ flexDirection: "row", gap: 4, alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Statistics" as never)}
            style={S.topIconBtn}
            accessibilityLabel="View statistics"
            accessibilityRole="button"
          >
            <BarChart3 size={22} color={colors.textPrimary} strokeWidth={1.8} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("Settings" as never)}
            style={S.topIconBtn}
            accessibilityLabel="Open settings"
            accessibilityRole="button"
          >
            <Settings size={22} color={colors.textPrimary} strokeWidth={1.8} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Spacing.lg }}
      >
        {/* ── Hero ── */}
        <View style={{ paddingHorizontal: Spacing.pageX, paddingTop: Spacing.xs }}>
          <Text style={[S.heroTitle, { color: colors.textPrimary }]}>Sudoku</Text>
          <Text style={[S.heroSub, { color: colors.textSecondary }]}>
            No ads. No noise. Just the puzzle.
          </Text>
        </View>

        {/* ── Continue banner ── */}
        {hasActive && (
          <TouchableOpacity
            onPress={() => navigation.getParent()?.navigate("Game" as never)}
            activeOpacity={0.88}
            accessibilityLabel={`Continue ${difficulty} puzzle — ${completion}% complete`}
            accessibilityRole="button"
            style={{ marginHorizontal: Spacing.pageX, marginTop: Spacing.md }}
          >
            <Surface tone="container" radius="lg" style={{ padding: Spacing.md }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.md }}>
                <View style={{ flex: 1 }}>
                  <Text style={[S.continueTitle, { color: colors.textPrimary }]}>
                    Continue
                  </Text>
                  <Text style={[S.continueSub, { color: colors.textSecondary }]}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    {settings.showTimer ? ` • ${formatTime(elapsed)}` : ""}
                    {` • ${completion}%`}
                  </Text>
                </View>
                <ChevronRight size={22} color={colors.textSecondary} strokeWidth={2} />
              </View>
              <View
                style={{
                  height: 3,
                  borderRadius: 2,
                  backgroundColor: colors.outlineVariant,
                  marginTop: Spacing.sm,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    height: "100%",
                    width: `${completion}%`,
                    backgroundColor: colors.primary,
                  }}
                />
              </View>
            </Surface>
          </TouchableOpacity>
        )}

        {/* ── New Game heading ── */}
        <SectionHeader
          title="New game"
          right={
            <Text style={{ fontSize: 11, fontWeight: "800", letterSpacing: 1, color: colors.textSecondary }}>
              Select difficulty
            </Text>
          }
        />

        {/* ── Difficulty grid ── */}
        <View
          style={S.diffGrid}
          accessibilityLabel="Difficulty selection"
          accessibilityRole="menu"
        >
          {visibleDifficulties.map((d) => {
            const m = DIFF[d];
            const isUnlocked = settings.unlockedDifficulties.includes(d);
            const unlockReq = getUnlockRequirement(d);
            return (
              <TouchableOpacity
                key={d}
                style={[
                  S.diffCard,
                  {
                    width: "48.5%",
                    backgroundColor: colors.bgSurface,
                    borderColor: colors.outlineVariant,
                  },
                  !isUnlocked && { opacity: 0.5 },
                ]}
                onPress={() => isUnlocked && startGame(d)}
                activeOpacity={isUnlocked ? 0.75 : 1}
                disabled={!isUnlocked}
                accessibilityLabel={`Start ${m.tier} difficulty`}
                accessibilityHint={unlockReq || undefined}
                accessibilityRole="button"
              >
                <View
                  style={[
                    S.diffTag,
                    { borderColor: isUnlocked ? m.tagColor : colors.outlineVariant },
                  ]}
                >
                  <Text
                    style={[
                      S.diffTagText,
                      { color: isUnlocked ? m.tagColor : colors.textSecondary },
                    ]}
                  >
                    {m.tag}
                  </Text>
                </View>
                <Text style={[S.diffTier, { color: colors.textPrimary }]}>{m.tier}</Text>
                <Text style={[S.diffDesc, { color: colors.textSecondary }]}>{m.desc}</Text>
                {unlockReq && (
                  <Text style={[S.unlockReq, { color: colors.textSecondary }]}>
                    {unlockReq}
                  </Text>
                )}
                {!isUnlocked && (
                  <View
                    style={[
                      S.lockOverlay,
                      { backgroundColor: "rgba(0,0,0,0.3)" },
                    ]}
                  >
                    <Lock size={24} color="#fff" strokeWidth={2} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {showAllDifficulties ? (
          <TouchableOpacity
            style={S.seeMoreBtn}
            onPress={() => setShowAllDifficulties(false)}
            activeOpacity={0.75}
            accessibilityLabel="Show fewer difficulties"
            accessibilityRole="button"
          >
            <Text style={[S.seeMoreText, { color: colors.primary }]}>
              Show Less
            </Text>
            <ChevronDown
              size={20}
              color={colors.primary}
              strokeWidth={2}
              style={{ transform: [{ rotate: "180deg" }] }}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={S.seeMoreBtn}
            onPress={() => setShowAllDifficulties(true)}
            activeOpacity={0.75}
            accessibilityLabel="Show more difficulties"
            accessibilityRole="button"
          >
            <Text style={[S.seeMoreText, { color: colors.primary }]}>
              See More
            </Text>
            <ChevronDown size={20} color={colors.primary} strokeWidth={2} />
          </TouchableOpacity>
        )}

        {/* ── Progress strip ── */}
        <SectionHeader title="Your progress" />
        <View style={[S.statsRow, { paddingHorizontal: Spacing.pageX }]}>
          {[
            {
              val: bestTime ? formatTime(bestTime) : "--:--",
              label: "BEST TIME",
              color: colors.textPrimary,
            },
            {
              val: stats.currentStreak.toString(),
              label: "DAY STREAK",
              color: colors.textPrimary,
            },
            {
              val: stats.totalCompleted.toString(),
              label: "SOLVED",
              color: colors.textPrimary,
            },
          ].map(({ val, label, color }) => (
            <Surface
              key={label}
              tone="surface"
              radius="md"
              style={[S.statCard, { borderColor: colors.outlineVariant }]}
            >
              <Text style={[S.statVal, { color }]}>{val}</Text>
              <Text style={[S.statLbl, { color: colors.textSecondary }]}>{label}</Text>
            </Surface>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const S = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.pageX,
    height: 56,
  },
  topIconBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  heroTitle: {
    fontSize: 30,
    fontWeight: "900",
    textAlign: "left",
    letterSpacing: -0.4,
  },
  heroSub: {
    fontSize: 14,
    textAlign: "left",
    marginTop: 8,
  },

  continueTitle: { fontSize: 16, fontWeight: "800", letterSpacing: 0.2 },
  continueSub: { fontSize: 13, marginTop: 2, fontWeight: "600" },

  diffGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.pageX,
    marginBottom: Spacing.lg,
  },
  diffCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  diffTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  diffTagText: { fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  diffTier: { fontSize: 20, fontWeight: "900", marginBottom: 6, letterSpacing: -0.2 },
  diffDesc: { fontSize: 12, lineHeight: 18, fontWeight: "600" },
  unlockReq: { fontSize: 11, marginTop: 10, fontWeight: "700" },
  lockOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  lockText: { fontSize: 24 },

  seeMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.xl,
  },
  seeMoreText: { fontSize: 14, fontWeight: "600" },

  statsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    padding: Spacing.md,
    alignItems: "center",
  },
  statVal: { fontSize: 20, fontWeight: "900", letterSpacing: -0.2 },
  statLbl: {
    fontSize: 10,
    marginTop: 6,
    fontWeight: "800",
    letterSpacing: 0.8,
    textAlign: "center",
  },
});
