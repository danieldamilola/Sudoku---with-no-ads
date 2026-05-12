import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { BorderRadius, Spacing } from "../../theme/spacing";
import { Typography } from "../../theme/typography";

type Props = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
  disabled?: boolean;
  left?: React.ReactNode;
  accessibilityLabel?: string;
};

export const Button: React.FC<Props> = ({
  label,
  onPress,
  variant = "primary",
  loading,
  disabled,
  left,
  accessibilityLabel,
}) => {
  const { colors } = useTheme();

  const isDisabled = Boolean(disabled || loading);
  const bg =
    variant === "primary"
      ? colors.primary
      : variant === "secondary"
        ? colors.bgSurface
        : "transparent";
  const fg =
    variant === "primary" ? colors.onPrimary : colors.textPrimary;
  const brd =
    variant === "ghost" ? "transparent" : colors.outlineVariant;

  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={[
        S.base,
        {
          backgroundColor: bg,
          borderColor: brd,
          opacity: isDisabled ? 0.55 : 1,
        },
      ]}
    >
      {left ? <Text style={{ marginRight: 10 }}>{left}</Text> : null}
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text style={[S.label, { color: fg }]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

const S = StyleSheet.create({
  base: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: Spacing.md,
  },
  label: {
    ...Typography.bodyEmphasized,
    fontWeight: "700",
  },
});

