import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useStore } from '../store/useStore';

type C = ReturnType<typeof import('../theme/theme').createTheme>['colors'];

// ─── Row with toggle ─────────────────────────────────────────────────────────
const ToggleRow: React.FC<{ label: string; sub: string; value: boolean; onChange: (v: boolean) => void; colors: C }> =
  ({ label, sub, value, onChange, colors }) => (
    <View style={S.row}>
      <View style={S.rowTxt}>
        <Text style={[S.rowLbl, { color: colors.textPrimary }]}>{label}</Text>
        <Text style={[S.rowSub, { color: colors.textSecondary }]}>{sub}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.outlineVariant, true: '#3b5bdb' }}
        thumbColor="#ffffff"
        ios_backgroundColor={colors.outlineVariant}
      />
    </View>
  );

// ─── Row with chevron ──────────────────────────────────────────────────────────────────
const ChevronRow: React.FC<{ label: string; sub: string; colors: C; onPress?: () => void }> =
  ({ label, sub, colors, onPress }) => (
    <TouchableOpacity style={S.row} onPress={onPress} activeOpacity={0.7}>
      <View style={S.rowTxt}>
        <Text style={[S.rowLbl, { color: colors.textPrimary }]}>{label}</Text>
        <Text style={[S.rowSub, { color: colors.textSecondary }]}>{sub}</Text>
      </View>
      <ChevronRight size={18} color={colors.textSecondary} strokeWidth={1.8} />
    </TouchableOpacity>
  );

// ─── Divider ─────────────────────────────────────────────────────────────────
const Div: React.FC<{ colors: C }> = ({ colors }) => (
  <View style={[S.divider, { backgroundColor: colors.outlineVariant }]} />
);

const ThemeSegment: React.FC<{ value: boolean; onChange: (value: boolean) => void; colors: C }> =
  ({ value, onChange, colors }) => (
    <View style={[S.segment, { backgroundColor: colors.bgSurfaceContainer }]}>
      {[
        { label: 'Light', value: false },
        { label: 'Dark', value: true },
      ].map((item) => {
        const active = value === item.value;
        return (
          <TouchableOpacity
            key={item.label}
            style={[S.segmentBtn, active && { backgroundColor: colors.bgSurfaceContainerLowest }]}
            onPress={() => onChange(item.value)}
            activeOpacity={0.75}
          >
            <Text style={[S.segmentText, { color: active ? colors.textPrimary : colors.textSecondary }]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

// ─── Screen ──────────────────────────────────────────────────────────────────
export const SettingsScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const settings = useStore((s) => s.settings);
  const set = (key: keyof typeof settings, value: boolean | number) =>
    useStore.getState().updateSettings({ [key]: value });

  return (
    <View style={[S.root, { backgroundColor: colors.bgPage, paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <View style={[S.header, { borderBottomColor: colors.outlineVariant }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={S.headerBtn}>
          <ChevronLeft size={28} color={colors.primary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[S.headerTitle, { color: colors.textPrimary }]}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <Text style={[S.pageTitle, { color: colors.textPrimary }]}>Settings</Text>

        {/* ── APPEARANCE ── */}
        <Text style={[S.sectionLbl, { color: colors.textSecondary }]}>APPEARANCE</Text>
        <View style={[S.card, { backgroundColor: colors.bgSurfaceContainerLowest, borderColor: colors.outlineVariant }]}>
          <View style={S.row}>
            <View style={S.rowTxt}>
              <Text style={[S.rowLbl, { color: colors.textPrimary }]}>Color Theme</Text>
              <Text style={[S.rowSub, { color: colors.textSecondary }]}>Match the quiet ink design.</Text>
            </View>
            <ThemeSegment value={settings.darkMode} onChange={(v) => set('darkMode', v)} colors={colors} />
          </View>
        </View>

        {/* ── GAMEPLAY ── */}
        <Text style={[S.sectionLbl, { color: colors.textSecondary }]}>GAMEPLAY</Text>
        <View style={[S.card, { backgroundColor: colors.bgSurfaceContainerLowest, borderColor: colors.outlineVariant }]}>
          <ToggleRow
            label="Mistake Limit" sub="Game ends after 3 mistakes"
            value={settings.mistakeLimit > 0} onChange={(v) => set('mistakeLimit', v ? 3 : 0)} colors={colors}
          />
          <Div colors={colors} />
          <ToggleRow
            label="Highlight Identical Numbers" sub="Show same digits on selection"
            value={settings.highlightDuplicates} onChange={(v) => set('highlightDuplicates', v)} colors={colors}
          />
          <Div colors={colors} />
          <ToggleRow
            label="Show Timer" sub="Track your solution speed"
            value={settings.showTimer} onChange={(v) => set('showTimer', v)} colors={colors}
          />
        </View>

        {/* ── SOUND & HAPTICS ── */}
        <Text style={[S.sectionLbl, { color: colors.textSecondary }]}>SOUND & HAPTICS</Text>
        <View style={[S.card, { backgroundColor: colors.bgSurfaceContainerLowest, borderColor: colors.outlineVariant }]}>
          <ToggleRow
            label="Sound Effects" sub="Play sounds on actions"
            value={settings.soundEffects} onChange={(v) => set('soundEffects', v)} colors={colors}
          />
          <Div colors={colors} />
          <ToggleRow
            label="Haptic Feedback" sub="Vibration on interactions"
            value={settings.hapticFeedback} onChange={(v) => set('hapticFeedback', v)} colors={colors}
          />
        </View>

        {/* ── DATA ── */}
        <Text style={[S.sectionLbl, { color: colors.textSecondary }]}>DATA</Text>
        <View style={[S.card, { backgroundColor: colors.bgSurfaceContainerLowest, borderColor: colors.outlineVariant }]}>
          <TouchableOpacity
            style={S.row}
            onPress={() =>
              Alert.alert(
                'Reset Game Data',
                'This will permanently clear all your stats and progress. This cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Reset', style: 'destructive', onPress: () => useStore.getState().resetStats() },
                ],
              )
            }
            activeOpacity={0.7}
          >
            <View style={S.rowTxt}>
              <Text style={[S.rowLbl, { color: colors.error }]}>Reset Game Data</Text>
              <Text style={[S.rowSub, { color: colors.textSecondary }]}>Clear stats and all progress</Text>
            </View>
            <Text style={{ fontSize: 18, color: colors.error }}>✕</Text>
          </TouchableOpacity>
          <Div colors={colors} />
          <TouchableOpacity
            style={S.row}
            onPress={() => Alert.alert('Privacy Policy', 'All your game data is stored locally on your device only. No data is collected or shared with third parties.')}
            activeOpacity={0.7}
          >
            <View style={S.rowTxt}>
              <Text style={[S.rowLbl, { color: colors.textPrimary }]}>Privacy Policy</Text>
            </View>
            <Text style={[S.chevron, { color: colors.textSecondary }]}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={[S.version, { color: colors.textSecondary }]}>Sudoku 1.4.0</Text>
      </ScrollView>
    </View>
  );
};

const S = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 56, borderBottomWidth: 1,
  },
  headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' },

  pageTitle: { fontSize: 28, fontWeight: '800', paddingHorizontal: 16, marginTop: 20, marginBottom: 8 },
  sectionLbl: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase',
    paddingHorizontal: 16, marginTop: 22, marginBottom: 8,
  },
  card: { marginHorizontal: 16, borderRadius: 12, borderWidth: 1, overflow: 'hidden' },

  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 15 },
  rowTxt: { flex: 1, paddingRight: 12 },
  rowLbl: { fontSize: 16, fontWeight: '500' },
  rowSub: { fontSize: 13, marginTop: 2 },
  chevron: { fontSize: 24, fontWeight: '300' },
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: 16 },
  segment: { flexDirection: 'row', borderRadius: 8, padding: 3 },
  segmentBtn: { minWidth: 64, height: 34, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  segmentText: { fontSize: 13, fontWeight: '800' },

  version: { fontSize: 13, textAlign: 'center', marginTop: 28 },
});
