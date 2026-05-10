import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LayoutGrid, BarChart3, SlidersHorizontal } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

type TabName = 'Home' | 'Statistics' | 'Settings';
interface Props { active: TabName; }

const ACTIVE_GREEN = '#40c057';
const STROKE = 1.8;

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
  const { colors }  = useTheme();
  const navigation  = useNavigation();
  const insets      = useSafeAreaInsets();

  const handleTab = (name: TabName) => {
    if (name === active) return; // already here — no-op

    if (name === 'Home') {
      // Always go back to root Home
      if (navigation.canGoBack()) {
        navigation.dispatch(StackActions.popToTop());
      } else {
        navigation.navigate('Home' as never);
      }
      return;
    }

    if (!navigation.canGoBack()) {
      // We are at root (HomeScreen) — PUSH the target screen so Home stays in stack.
      // This gives us [Home, Statistics] or [Home, Settings] — back button works correctly.
      navigation.navigate(name as never);
    } else {
      // We are already one level deep (e.g. StatisticsScreen on top of Home).
      // REPLACE the current top screen so the stack stays at [Home, target] — never grows.
      navigation.dispatch(StackActions.replace(name));
    }
  };

  return (
    <View style={[
      S.bar,
      {
        backgroundColor: colors.bgSurface,
        borderTopColor:  colors.outlineVariant,
        paddingBottom:   Math.max(insets.bottom, 8),
      },
    ]}>
      {TABS.map(({ name, label, LIcon }) => {
        const isActive   = active === name;
        const iconColor  = isActive ? '#ffffff' : colors.textSecondary;
        const labelColor = isActive ? ACTIVE_GREEN : colors.textSecondary;

        return (
          <TouchableOpacity
            key={name}
            style={S.tab}
            onPress={() => handleTab(name)}
            activeOpacity={0.75}
          >
            <View style={[S.iconWrap, isActive && { backgroundColor: ACTIVE_GREEN }]}>
              <LIcon size={18} color={iconColor} strokeWidth={STROKE} />
            </View>
            <Text style={[S.label, { color: labelColor, fontWeight: isActive ? '700' : '500' }]}>
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
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
  },
  iconWrap: {
    width: 58,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.2,
  },
});
