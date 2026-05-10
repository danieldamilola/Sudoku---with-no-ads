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
        <TouchableOpacity
          onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home' as never)}
          style={S.headerBtn}
        >
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
          <ChevronRow
            label="Theme" sub="System default" colors={colors}
            onPress={() => Alert.alert('Theme', 'Light and dark theme options coming in a future update.')}
          />
          <Div colors={colors} />
          <ChevronRow
            label="Board Style" sub="Classic Ink" colors={colors}
            onPress={() => Alert.alert('Board Style', 'Additional board styles coming in a future update.')}
          />
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

        {/* ── Footer ── */}
        <Text style={[S.version, { color: colors.textSecondary }]}>Sudoku Premium Version 2.4.0</Text>
        <View style={S.footerLinks}>
          <TouchableOpacity><Text style={[S.footerLink, { color: colors.textSecondary }]}>TERMS</Text></TouchableOpacity>
          <TouchableOpacity><Text style={[S.footerLink, { color: colors.textSecondary }]}>SUPPORT</Text></TouchableOpacity>
        </View>

        {/* ── Bento promo cards ── */}
        <View style={S.bentoRow}>
          <View style={[S.bentoCard, { backgroundColor: '#d3f9d8' }]}>
            <Text style={S.bentoIco}>✦✦</Text>
            <Text style={[S.bentoTitle, { color: '#2f9e44' }]}>Brain Training</Text>
            <Text style={[S.bentoCopy, { color: '#1e6f30' }]}>Settings optimized for cognitive focus.</Text>
          </View>
          <View style={[S.bentoCard, { backgroundColor: '#fff3cd' }]}>
            <Text style={S.bentoIco}>🏆</Text>
            <Text style={[S.bentoTitle, { color: '#e67700' }]}>Premium Quality</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const S = StyleSheet.create({
  root:       { flex: 1 },
  header:     {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 56, borderBottomWidth: 1,
  },
  headerBtn:  { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle:{ fontSize: 18, fontWeight: '700' },

  pageTitle:  { fontSize: 28, fontWeight: '800', paddingHorizontal: 16, marginTop: 20, marginBottom: 8 },
  sectionLbl: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase',
    paddingHorizontal: 16, marginTop: 22, marginBottom: 8,
  },
  card:       { marginHorizontal: 16, borderRadius: 12, borderWidth: 1, overflow: 'hidden' },

  row:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 15 },
  rowTxt:     { flex: 1, paddingRight: 12 },
  rowLbl:     { fontSize: 16, fontWeight: '500' },
  rowSub:     { fontSize: 13, marginTop: 2 },
  chevron:    { fontSize: 24, fontWeight: '300' },
  divider:    { height: StyleSheet.hairlineWidth, marginHorizontal: 16 },

  version:    { fontSize: 13, textAlign: 'center', marginTop: 28 },
  footerLinks:{ flexDirection: 'row', justifyContent: 'center', gap: 24, marginTop: 6, marginBottom: 24 },
  footerLink: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },

  bentoRow:   { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 8 },
  bentoCard:  { flex: 1, borderRadius: 14, padding: 18 },
  bentoIco:   { fontSize: 22, marginBottom: 8 },
  bentoTitle: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  bentoCopy:  { fontSize: 12, lineHeight: 17 },
});
