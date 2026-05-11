import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LayoutGrid, BarChart3, SlidersHorizontal } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

type TabName = 'Home' | 'Statistics' | 'Settings';
interface Props { active: TabName; }

// ─── Tab configuration ────────────────────────────────────────────────────────
const TABS: {
  name: TabName;
  label: string;
  LIcon: React.FC<{ size: number; color: string; strokeWidth: number }>;
}[] = [
  { name: 'Home',       label: 'Play',     LIcon: LayoutGrid        },
  { name: 'Statistics', label: 'Stats',    LIcon: BarChart3         },
  { name: 'Settings',   label: 'Settings', LIcon: SlidersHorizontal },
];

// ─── Tab Bar ─────────────────────────────────────────────────────────────────
export const BottomTabBar: React.FC<Props> = ({ active }) => {
  const { colors, isDark } = useTheme();
  const navigation         = useNavigation();
  const insets             = useSafeAreaInsets();

  const handleTab = (name: TabName) => {
    if (name === active) return;

    if (name === 'Home') {
      if (navigation.canGoBack()) {
        navigation.dispatch(StackActions.popToTop());
      } else {
        navigation.navigate('Home' as never);
      }
      return;
    }

    if (!navigation.canGoBack()) {
      navigation.navigate(name as never);
    } else {
      navigation.dispatch(StackActions.replace(name));
    }
  };

  return (
    <View style={[
      S.bar,
      {
        backgroundColor: colors.bgSurface,
        paddingBottom:   Math.max(insets.bottom, 10),
        // Light: soft shadow lifts the bar. Dark: hairline border instead.
        borderTopWidth:  isDark ? StyleSheet.hairlineWidth : 0,
        borderTopColor:  colors.outlineVariant,
        shadowColor:     '#000',
        shadowOpacity:   isDark ? 0 : 0.07,
        elevation:       isDark ? 0 : 10,
      },
    ]}>
      {TABS.map(({ name, label, LIcon }) => {
        const isActive = active === name;
        const clr      = isActive ? colors.primary : colors.textSecondary;

        return (
          <TouchableOpacity
            key={name}
            style={S.tab}
            onPress={() => handleTab(name)}
            activeOpacity={0.7}
          >
            {/* Top indicator — always rendered to prevent layout shift */}
            <View style={[S.indicator, { backgroundColor: isActive ? colors.primary : 'transparent' }]} />

            <LIcon size={22} color={clr} strokeWidth={isActive ? 2.2 : 1.8} />
            <Text style={[S.label, { color: clr, fontWeight: isActive ? '700' : '400' }]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const S = StyleSheet.create({
  bar: {
    flexDirection:  'row',
    shadowOffset:   { width: 0, height: -3 },
    shadowRadius:   12,
  },
  tab: {
    flex:           1,
    alignItems:     'center',
    paddingTop:     10,
    paddingBottom:  4,
    gap:            6,
  },
  indicator: {
    width:          28,
    height:         2.5,
    borderRadius:   2,
    marginBottom:   4,
  },
  label: {
    fontSize:       11,
    letterSpacing:  0.3,
  },
});
