import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Typography } from '../theme/typography';
import { Spacing, BorderRadius } from '../theme/spacing';

interface HeaderAction {
  label: string;
  onPress: () => void;
}

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  colorPrimary: string;
  colorSecondary: string;
  surface: string;
  border: string;
  leftAction?: HeaderAction;
  rightActions?: HeaderAction[];
  style?: ViewStyle;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  colorPrimary,
  colorSecondary,
  surface,
  border,
  leftAction,
  rightActions = [],
  style,
}) => {
  return (
    <View style={[S.wrap, style]}>
      <View style={S.row}>
        <View style={S.side}>
          {leftAction ? (
            <HeaderButton
              label={leftAction.label}
              onPress={leftAction.onPress}
              surface={surface}
              border={border}
              color={colorPrimary}
            />
          ) : (
            <View style={S.sideSpacer} />
          )}
        </View>

        <View style={S.center}>
          <Text style={[S.title, { color: colorPrimary }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[S.subtitle, { color: colorSecondary }]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={[S.side, S.right]}>
          {rightActions.slice(0, 2).map((a) => (
            <HeaderButton
              key={a.label}
              label={a.label}
              onPress={a.onPress}
              surface={surface}
              border={border}
              color={colorPrimary}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const HeaderButton: React.FC<{ label: string; onPress: () => void; surface: string; border: string; color: string }> = ({
  label,
  onPress,
  surface,
  border,
  color,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[S.btn, { backgroundColor: surface, borderColor: border }]}
    >
      <Text style={[S.btnText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
};

const S = StyleSheet.create({
  wrap: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  side: {
    width: 120,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  right: {
    justifyContent: 'flex-end',
  },
  sideSpacer: {
    width: 44,
    height: 36,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  title: {
    ...Typography.title3,
  },
  subtitle: {
    marginTop: 2,
    ...Typography.caption,
  },
  btn: {
    height: 36,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    ...Typography.captionBold,
  },
});

