import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown, ChevronRight, BarChart3, Settings } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useStore } from '../store/useStore';
import { Difficulty, SudokuCell } from '../types';
import { formatTime } from '../utils/time';
import { BottomTabBar } from '../components/BottomTabBar';
import { BrandMark } from '../components/BrandMark';

// ─── Difficulty metadata ────────────────────────────────────────────────────
const DIFF: Record<Difficulty, {
  tag: string; tier: string; desc: string;
  tagColor: string; tagBg: string;
}> = {
  [Difficulty.Beginner]: { tag: 'BEGINNER', tier: 'Beginner', desc: 'Gentle logic for a quick mental break.',   tagColor: '#34c759', tagBg: '#d1fae5' },
  [Difficulty.Skill]:    { tag: 'SKILL',    tier: 'Skilled',  desc: 'Balanced puzzles for daily focus.',        tagColor: '#274ed5', tagBg: '#dbeafe' },
  [Difficulty.Hard]:     { tag: 'HARD',     tier: 'Advanced', desc: 'Complex patterns and deep strategy.',      tagColor: '#845000', tagBg: '#ffddbb' },
  [Difficulty.Advanced]: { tag: 'ADVANCED', tier: 'Expert',   desc: 'Challenging for experienced players.',     tagColor: '#ba1a1a', tagBg: '#ffdad6' },
  [Difficulty.Expert]:   { tag: 'EXPERT',   tier: 'Master',   desc: 'Extreme challenges for the dedicated.',    tagColor: '#ba1a1a', tagBg: '#ffdad6' },
  [Difficulty.Master]:   { tag: 'MASTER',   tier: 'Grandmaster', desc: 'Ultimate challenge for Sudoku masters.', tagColor: '#7c3aed', tagBg: '#ede9fe' },
};

// ─── Screen ──────────────────────────────────────────────────────────────────
export const HomeScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const cells     = useStore((s) => s.cells);
  const difficulty = useStore((s) => s.difficulty);
  const elapsed   = useStore((s) => s.elapsedSeconds);
  const completed = useStore((s) => s.isCompleted);
  const stats     = useStore((s) => s.stats);
  const settings  = useStore((s) => s.settings);

  const hasActive = cells.some((c: SudokuCell) => c.value !== null) && !completed;
  const [showAllDifficulties, setShowAllDifficulties] = React.useState(false);

  const startGame = (d: Difficulty) => {
    useStore.getState().startNewGame(d);
    navigation.navigate('Game' as never);
  };

  const cardW = (width - 16 - 16 - 12) / 2;

  const allBestTimes = (Object.values(stats.bestTimes) as (number | undefined)[]).filter((t): t is number => !!t);
  const bestTime     = allBestTimes.length > 0 ? Math.min(...allBestTimes) : null;

  const getUnlockRequirement = (d: Difficulty): string | null => {
    if (settings.unlockedDifficulties.includes(d)) return null;
    switch (d) {
      case Difficulty.Hard: {
        const wins = stats.recentGames.filter(g => g.difficulty === Difficulty.Skill && g.won).length;
        return `Win ${Math.max(0, 4 - wins)} more in Skill`;
      }
      case Difficulty.Advanced: {
        const wins = stats.recentGames.filter(g => g.difficulty === Difficulty.Hard && g.won).length;
        return `Win ${Math.max(0, 8 - wins)} more in Hard`;
      }
      case Difficulty.Expert:
      case Difficulty.Master: {
        const wins = stats.recentGames.filter(g => g.difficulty === Difficulty.Advanced && g.won).length;
        return `Win ${Math.max(0, 16 - wins)} more in Advanced`;
      }
      default:
        return null;
    }
  };

  const visibleDifficulties = showAllDifficulties 
    ? [Difficulty.Beginner, Difficulty.Skill, Difficulty.Hard, Difficulty.Advanced, Difficulty.Expert, Difficulty.Master] as const
    : [Difficulty.Beginner, Difficulty.Skill, Difficulty.Hard, Difficulty.Advanced] as const;

  return (
    <View style={[S.root, { backgroundColor: colors.bgPage, paddingTop: insets.top }]}>
      {/* ── Top bar ── */}
      <View style={S.topBar}>
        <BrandMark size={30} color={colors.textPrimary} />
        <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.navigate('Statistics' as never)} style={S.topIconBtn}>
            <BarChart3 size={22} color={colors.textPrimary} strokeWidth={1.8} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Settings' as never)} style={S.topIconBtn}>
            <Settings size={22} color={colors.textPrimary} strokeWidth={1.8} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
        {/* ── Hero ── */}
        <Text style={[S.heroTitle, { color: colors.textPrimary }]}>Sudoku</Text>
        <Text style={[S.heroSub, { color: colors.textSecondary }]}>No ads. No noise. Just the puzzle.</Text>


        {/* ── Continue banner ── */}
        {hasActive && (
          <TouchableOpacity
            style={[S.continueBanner, { backgroundColor: colors.primaryFixed, borderColor: colors.primary }]}
            onPress={() => navigation.navigate('Game' as never)}
            activeOpacity={0.85}
          >
            <View style={{ flex: 1 }}>
              <Text style={[S.continueTitle, { color: colors.primary }]}>Continue Game</Text>
              <Text style={[S.continueSub, { color: colors.textSecondary }]}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                {settings.showTimer ? ` • ${formatTime(elapsed)}` : ''}
              </Text>
            </View>
            <ChevronRight size={22} color={colors.primary} strokeWidth={2} />
          </TouchableOpacity>
        )}

        {/* ── New Game heading ── */}
        <View style={S.sectionHeader}>
          <Text style={[S.sectionTitle, { color: colors.textPrimary }]}>New Game</Text>
          <Text style={[S.sectionRight, { color: colors.textSecondary }]}>SELECT DIFFICULTY</Text>
        </View>

        {/* ── Difficulty grid ── */}
        <View style={S.diffGrid}>
          {visibleDifficulties.map((d) => {
            const m = DIFF[d];
            const isUnlocked = settings.unlockedDifficulties.includes(d);
            const unlockReq = getUnlockRequirement(d);
            return (
              <TouchableOpacity
                key={d}
                style={[
                  S.diffCard, 
                  { width: cardW, backgroundColor: colors.bgSurfaceContainerLowest, borderColor: colors.outlineVariant },
                  !isUnlocked && { opacity: 0.5 }
                ]}
                onPress={() => isUnlocked && startGame(d)}
                activeOpacity={isUnlocked ? 0.75 : 1}
                disabled={!isUnlocked}
              >
                <View style={[S.diffTag, { backgroundColor: m.tagBg }]}>
                  <Text style={[S.diffTagText, { color: m.tagColor }]}>{m.tag}</Text>
                </View>
                <Text style={[S.diffTier, { color: colors.textPrimary }]}>{m.tier}</Text>
                <Text style={[S.diffDesc, { color: colors.textSecondary }]}>{m.desc}</Text>
                {unlockReq && (
                  <Text style={[S.unlockReq, { color: colors.textSecondary }]}>{unlockReq}</Text>
                )}
                {!isUnlocked && (
                  <View style={[S.lockOverlay, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
                    <Text style={[S.lockText, { color: '#fff' }]}>🔒</Text>
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
          >
            <Text style={[S.seeMoreText, { color: colors.primary }]}>Show Less</Text>
            <ChevronDown size={20} color={colors.primary} strokeWidth={2} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={S.seeMoreBtn} 
            onPress={() => setShowAllDifficulties(true)}
            activeOpacity={0.75}
          >
            <Text style={[S.seeMoreText, { color: colors.primary }]}>See More</Text>
            <ChevronDown size={20} color={colors.primary} strokeWidth={2} />
          </TouchableOpacity>
        )}

        {/* ── Progress strip ── */}
        <Text style={[S.progressLbl, { color: colors.textSecondary }]}>YOUR PROGRESS</Text>
        <View style={S.statsRow}>
          {[
            { val: bestTime ? formatTime(bestTime) : '--:--', label: 'BEST TIME', color: '#274ed5' },
            { val: stats.currentStreak.toString(), label: 'DAY STREAK', color: '#34c759' },
            { val: stats.totalCompleted.toString(), label: 'SOLVED', color: '#845000' },
          ].map(({ val, label, color }) => (
            <View key={label} style={[S.statCard, { backgroundColor: colors.bgSurfaceContainerLowest, borderColor: colors.outlineVariant }]}>
              <Text style={[S.statVal, { color }]}>{val}</Text>
              <Text style={[S.statLbl, { color: colors.textSecondary }]}>{label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <BottomTabBar active="Home" />
    </View>
  );
};

const S = StyleSheet.create({
  root:         { flex: 1 },
  topBar:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 56 },
  topIconBtn:   { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },

  heroTitle:    { fontSize: 28, fontWeight: '800', textAlign: 'center', marginTop: 8 },
  heroSub:      { fontSize: 14, textAlign: 'center', marginBottom: 20, marginTop: 4 },

  continueBanner: { marginHorizontal: 16, marginBottom: 20, borderRadius: 12, borderWidth: 1.5, padding: 16, flexDirection: 'row', alignItems: 'center' },
  continueTitle:  { fontSize: 16, fontWeight: '700' },
  continueSub:    { fontSize: 13, marginTop: 2 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 12 },
  sectionTitle:  { fontSize: 20, fontWeight: '700' },
  sectionRight:  { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },

  diffGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 16, marginBottom: 32 },
  diffCard:     { padding: 16, borderRadius: 12, borderWidth: 1 },
  diffTag:      { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5, marginBottom: 10 },
  diffTagText:  { fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  diffTier:     { fontSize: 20, fontWeight: '800', marginBottom: 6 },
  diffDesc:     { fontSize: 12, lineHeight: 18, fontWeight: '400' },
  unlockReq:    { fontSize: 11, marginTop: 8, fontWeight: '600', color: '#888' },
  lockOverlay:  { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  lockText:     { fontSize: 24 },

  seeMoreBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, marginBottom: 32 },
  seeMoreText:  { fontSize: 14, fontWeight: '600' },

  progressLbl:  { fontSize: 11, fontWeight: '700', letterSpacing: 1, textAlign: 'center', marginBottom: 12 },
  statsRow:     { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 8 },
  statCard:     { flex: 1, padding: 14, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  statVal:      { fontSize: 20, fontWeight: '700' },
  statLbl:      { fontSize: 10, marginTop: 4, fontWeight: '600', letterSpacing: 0.3, textAlign: 'center' },
});
