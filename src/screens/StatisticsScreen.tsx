import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Share2, Settings } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useStore } from '../store/useStore';
import { Difficulty, GameRecord } from '../types';
import { formatDuration, formatTime } from '../utils/time';
import { BottomTabBar } from '../components/BottomTabBar';

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// ─── Difficulty config ────────────────────────────────────────────────────────
const DIFF_CFG: Record<string, { barColor: string; iconBg: string; iconColor: string }> = {
  beginner: { barColor: '#34c759', iconBg: '#d1fae5', iconColor: '#34c759' },
  skill:    { barColor: '#274ed5', iconBg: '#dbeafe', iconColor: '#274ed5' },
  hard:     { barColor: '#845000', iconBg: '#ffddbb', iconColor: '#845000' },
  advanced: { barColor: '#ba1a1a', iconBg: '#ffdad6', iconColor: '#ba1a1a' },
  expert:   { barColor: '#ba1a1a', iconBg: '#ffdad6', iconColor: '#ba1a1a' },
  master:   { barColor: '#7c3aed', iconBg: '#ede9fe', iconColor: '#7c3aed' },
};

const calcPoints = (game: GameRecord) => {
  if (!game.won) return 0;
  const mult = { beginner: 1, skill: 2, hard: 3, advanced: 4, expert: 5, master: 6 }[game.difficulty] ?? 1;
  return (100 + (game.mistakes === 0 ? 50 : 0)) * mult;
};

// ─── Screen ──────────────────────────────────────────────────────────────────
export const StatisticsScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const stats = useStore((s) => s.stats);

  const getWonFor   = (d: Difficulty) => stats.recentGames.filter(g => g.difficulty === d && g.won).length;
  const getTotalFor = (d: Difficulty) => stats.recentGames.filter(g => g.difficulty === d).length;

  const onShare = async () => {
    try {
      await Share.share({
        message:
          `🧩 My Sudoku Stats\n` +
          `Puzzles Solved: ${stats.totalCompleted}\n` +
          `Current Streak: ${stats.currentStreak} 🔥\n` +
          `Best Streak: ${stats.bestStreak}\n` +
          `Think you can beat me?`,
      });
    } catch (_) {}
  };

  const DIFFS = [Difficulty.Beginner, Difficulty.Skill, Difficulty.Hard, Difficulty.Advanced, Difficulty.Expert, Difficulty.Master] as const;

  return (
    <View style={[S.root, { backgroundColor: colors.bgPage, paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <View style={[S.header, { borderBottomColor: colors.outlineVariant }]}>
        <TouchableOpacity
          onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home' as never)}
          style={S.headerBtn}
        >
          <ChevronLeft size={28} color={colors.primary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[S.headerTitle, { color: colors.textPrimary }]}>Statistics</Text>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <TouchableOpacity style={S.headerBtn} onPress={onShare}>
            <Share2 size={22} color={colors.textPrimary} strokeWidth={1.8} />
          </TouchableOpacity>
          <TouchableOpacity style={S.headerBtn} onPress={() => navigation.navigate('Settings' as never)}>
            <Settings size={22} color={colors.textPrimary} strokeWidth={1.8} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>

        {/* ── OVERALL ── */}
        <Text style={[S.sectionLbl, { color: colors.textSecondary }]}>OVERALL</Text>
        <View style={S.bentoGrid}>
          {[
            { label: 'Total Solved',    value: stats.totalCompleted.toString() },
            { label: 'Current Streak',  value: `${stats.currentStreak}`, suffix: ' 🔥' },
            { label: 'Best Streak',     value: stats.bestStreak.toString() },
            { label: 'Total Time',      value: formatDuration(stats.totalMinutesPlayed) },
          ].map(({ label, value, suffix }) => (
            <View
              key={label}
              style={[S.bentoCard, { backgroundColor: colors.bgSurfaceContainerLowest, borderColor: colors.outlineVariant }]}
            >
              <Text style={[S.bentoLbl, { color: colors.textSecondary }]}>{label}</Text>
              <Text style={[S.bentoVal, { color: colors.textPrimary }]}>
                {value}{suffix ?? ''}
              </Text>
            </View>
          ))}
        </View>

        {/* ── BY DIFFICULTY ── */}
        <Text style={[S.sectionLbl, { color: colors.textSecondary }]}>BY DIFFICULTY</Text>
        <View style={S.diffList}>
          {DIFFS.map((d) => {
            const won   = getWonFor(d);
            const total = getTotalFor(d);
            const pct   = total > 0 ? won / total : 0;
            const cfg   = DIFF_CFG[d];
            const best  = stats.bestTimes[d];
            return (
              <View key={d} style={[S.diffCard, { backgroundColor: colors.bgSurfaceContainerLowest, borderColor: colors.outlineVariant }]}>
                <View style={S.diffRow}>
                  <Text style={[S.diffName, { color: colors.textPrimary }]}>{cap(d)}</Text>
                  <Text style={[S.diffCount, { color: colors.textSecondary }]}>{won} won / {total} played</Text>
                </View>
                <View style={[S.barBg, { backgroundColor: colors.bgSurfaceContainerHighest }]}>
                  <View style={[S.barFill, { width: total > 0 ? `${Math.round(pct * 100)}%` : '0%', backgroundColor: cfg.barColor }]} />
                </View>
                <Text style={[S.diffBest, { color: colors.textSecondary }]}>
                  BEST: {best ? formatTime(best) : '--:--'}
                </Text>
              </View>
            );
          })}
        </View>

        {/* ── RECENT GAMES ── */}
        <View style={S.recentHeader}>
          <Text style={[S.sectionLbl, { color: colors.textSecondary, marginBottom: 0, marginTop: 0 }]}>RECENT GAMES</Text>
          <TouchableOpacity><Text style={[S.viewAll, { color: colors.primary }]}>VIEW ALL</Text></TouchableOpacity>
        </View>

        <View style={S.recentList}>
          {stats.recentGames.length === 0 ? (
            <Text style={[S.empty, { color: colors.textSecondary }]}>No games yet</Text>
          ) : (
            stats.recentGames.slice(0, 6).map((g, idx) => {
              const pts       = calcPoints(g);
              const cfg       = DIFF_CFG[g.difficulty] ?? DIFF_CFG.beginner;
              const ptsColor  = g.won ? '#2f9e44' : '#c92a2a';
              const date      = new Date(g.date).toLocaleDateString('en', { month: 'short', day: 'numeric' });
              const time      = g.won ? formatTime(g.durationSeconds) : 'Failed';
              return (
                <View key={idx} style={[S.recentRow, { backgroundColor: colors.bgSurfaceContainerLowest, borderColor: colors.outlineVariant }]}>
                  <View style={[S.gameIcon, { backgroundColor: cfg.iconBg }]}>
                    <Text style={{ color: cfg.iconColor, fontSize: 16, fontWeight: '800' }}>{g.won ? '✓' : '✗'}</Text>
                  </View>
                  <View style={S.gameInfo}>
                    <Text style={[S.gameDiff, { color: colors.textPrimary }]}>{cap(g.difficulty)}</Text>
                    <Text style={[S.gameDate, { color: colors.textSecondary }]}>{date} • {time}</Text>
                  </View>
                  <Text style={[S.gamePts, { color: ptsColor }]}>
                    {pts > 0 ? `+${pts} pts` : '0 pts'}
                  </Text>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <BottomTabBar active="Statistics" />
    </View>
  );
};

const S = StyleSheet.create({
  root: { flex: 1 },

  header:      {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 56, borderBottomWidth: 1,
  },
  headerBtn:   { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' },

  sectionLbl:  {
    fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase',
    paddingHorizontal: 16, marginTop: 22, marginBottom: 10,
  },

  bentoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 16 },
  bentoCard: { width: '47%', borderRadius: 12, padding: 16, borderWidth: 1 },
  bentoLbl:  { fontSize: 12, fontWeight: '600', marginBottom: 8 },
  bentoVal:  { fontSize: 26, fontWeight: '800' },

  diffList: { paddingHorizontal: 16, gap: 10 },
  diffCard: { borderRadius: 12, padding: 16, borderWidth: 1 },
  diffRow:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  diffName: { fontSize: 16, fontWeight: '700' },
  diffCount:{ fontSize: 14, fontWeight: '500' },
  barBg:    { height: 7, borderRadius: 4, marginBottom: 8, overflow: 'hidden' },
  barFill:  { height: 7, borderRadius: 4 },
  diffBest: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },

  recentHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, marginTop: 22, marginBottom: 10,
  },
  viewAll:  { fontSize: 12, fontWeight: '700' },
  recentList: { paddingHorizontal: 16, gap: 8 },
  recentRow:  { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, padding: 14, gap: 12 },
  gameIcon:   { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  gameInfo:   { flex: 1 },
  gameDiff:   { fontSize: 15, fontWeight: '700' },
  gameDate:   { fontSize: 12, marginTop: 2 },
  gamePts:    { fontSize: 15, fontWeight: '800' },
  empty:      { padding: 24, textAlign: 'center', fontSize: 14 },
});
