import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BarChart3, Settings, ChevronRight } from 'lucide-react-native';
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
  [Difficulty.Easy]:   { tag: 'EASY',   tier: 'Beginner', desc: 'Gentle logic for a quick mental break.',   tagColor: '#2f9e44', tagBg: '#d3f9d8' },
  [Difficulty.Medium]: { tag: 'MEDIUM', tier: 'Skilled',  desc: 'Balanced puzzles for daily focus.',        tagColor: '#3b5bdb', tagBg: '#dbe4ff' },
  [Difficulty.Hard]:   { tag: 'HARD',   tier: 'Advanced', desc: 'Complex patterns and deep strategy.',      tagColor: '#e67700', tagBg: '#fff3cd' },
  [Difficulty.Expert]: { tag: 'EXPERT', tier: 'Master',   desc: 'Extreme challenges for the dedicated.',    tagColor: '#c92a2a', tagBg: '#ffe3e3' },
};

// Static sudoku grid snapshot — never re-renders with random values
const HERO_CLUES: Record<number, number> = {
   0:5,  1:3,  4:7,  9:6, 12:1, 13:9, 14:5,
  18:9, 19:8, 22:6, 27:8, 31:6, 35:3,
  36:4, 40:8, 44:3, 45:7, 51:2, 53:6,
  54:6, 58:2, 63:1, 67:8, 68:6, 72:8,
  76:7, 77:9, 80:5,
};

const HeroGrid: React.FC = () => {
  const cells = useMemo(() => Array.from({ length: 81 }, (_, i) => i), []);
  return (
    <View style={hero.grid}>
      {cells.map(i => {
        const r = Math.floor(i / 9);
        const c = i % 9;
        const rW = (c + 1) % 3 === 0 ? 2 : StyleSheet.hairlineWidth;
        const bW = (r + 1) % 3 === 0 ? 2 : StyleSheet.hairlineWidth;
        const num = HERO_CLUES[i];
        return (
          <View key={i} style={{
            width: '11.11%', aspectRatio: 1,
            borderRightWidth: rW, borderBottomWidth: bW,
            borderRightColor: rW === 2 ? '#555' : '#ccc',
            borderBottomColor: bW === 2 ? '#555' : '#ccc',
            alignItems: 'center', justifyContent: 'center',
            backgroundColor: '#fafaf8',
          }}>
            {num ? (
              <Text style={{ fontSize: 9, color: '#333', fontWeight: '700', includeFontPadding: false }}>
                {num}
              </Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
};

const hero = StyleSheet.create({
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    borderTopWidth: 2, borderLeftWidth: 2, borderColor: '#555',
    borderRadius: 3, overflow: 'hidden',
    width: 132, height: 132,
    backgroundColor: '#fafaf8',
  },
});

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

  const startGame = (d: Difficulty) => {
    useStore.getState().startNewGame(d);
    navigation.navigate('Game' as never);
  };

  const cardW = (width - 16 - 16 - 12) / 2;

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

        {/* ── Hero image card ── */}
        <View style={[S.heroCard, { backgroundColor: '#d6c8b4' }]}>
          <View style={S.heroInner}>
            <View style={{ flex: 1, justifyContent: 'center', paddingLeft: 20 }}>
              <HeroGrid />
            </View>
            {/* decorative right side */}
            <View style={{ width: 80, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 16 }}>
              <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#8bac7a', opacity: 0.7, marginBottom: 8 }} />
              <View style={{ width: 6, height: 80, borderRadius: 3, backgroundColor: '#5a4a3a', opacity: 0.5, marginRight: 12 }} />
            </View>
          </View>
        </View>

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
          {([Difficulty.Easy, Difficulty.Medium, Difficulty.Hard, Difficulty.Expert] as const).map((d) => {
            const m = DIFF[d];
            return (
              <TouchableOpacity
                key={d}
                style={[S.diffCard, { width: cardW, backgroundColor: colors.bgSurfaceContainerLowest, borderColor: colors.outlineVariant }]}
                onPress={() => startGame(d)}
                activeOpacity={0.75}
              >
                <View style={[S.diffTag, { backgroundColor: m.tagBg }]}>
                  <Text style={[S.diffTagText, { color: m.tagColor }]}>{m.tag}</Text>
                </View>
                <Text style={[S.diffTier, { color: colors.textPrimary }]}>{m.tier}</Text>
                <Text style={[S.diffDesc, { color: colors.textSecondary }]}>{m.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Progress strip ── */}
        <Text style={[S.progressLbl, { color: colors.textSecondary }]}>YOUR PROGRESS</Text>
        <View style={S.statsRow}>
          {[
            { val: stats.bestTimes[Difficulty.Medium] ? formatTime(stats.bestTimes[Difficulty.Medium]) : '--:--', label: 'BEST TIME', color: '#3b5bdb' },
            { val: stats.currentStreak.toString(), label: 'DAY STREAK', color: '#2f9e44' },
            { val: stats.totalCompleted.toString(), label: 'SOLVED', color: '#e67700' },
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

  heroCard:     { marginHorizontal: 16, borderRadius: 16, overflow: 'hidden', height: 180, marginBottom: 20 },
  heroInner:    { flex: 1, flexDirection: 'row' },

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

  progressLbl:  { fontSize: 11, fontWeight: '700', letterSpacing: 1, textAlign: 'center', marginBottom: 12 },
  statsRow:     { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 8 },
  statCard:     { flex: 1, padding: 14, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  statVal:      { fontSize: 20, fontWeight: '700' },
  statLbl:      { fontSize: 10, marginTop: 4, fontWeight: '600', letterSpacing: 0.3, textAlign: 'center' },
});
