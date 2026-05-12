import React from "react";
import { StyleSheet, Text, View, ViewProps } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { Spacing } from "../../theme/spacing";

type Props = ViewProps & {
  title: string;
  right?: React.ReactNode;
};

export const SectionHeader: React.FC<Props> = ({ title, right, style, ...rest }) => {
  const { colors } = useTheme();
  return (
    <View style={[S.row, style]} {...rest}>
      <Text style={[S.title, { color: colors.textSecondary }]}>{title}</Text>
      {right ? <View style={S.right}>{right}</View> : null}
    </View>
  );
};

const S = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.pageX,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  right: { marginLeft: Spacing.md },
});

