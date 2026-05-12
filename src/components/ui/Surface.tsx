import React from "react";
import { View, StyleSheet, ViewProps } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { BorderRadius } from "../../theme/spacing";

type Props = ViewProps & {
  tone?: "surface" | "container";
  radius?: keyof typeof BorderRadius;
  stroke?: boolean;
};

export const Surface: React.FC<Props> = ({
  tone = "surface",
  radius = "md",
  stroke = true,
  style,
  ...rest
}) => {
  const { colors } = useTheme();
  const bg =
    tone === "container" ? colors.bgSurfaceContainerLowest : colors.bgSurface;

  return (
    <View
      style={[
        S.base,
        {
          backgroundColor: bg,
          borderColor: stroke ? colors.outlineVariant : "transparent",
          borderRadius: BorderRadius[radius],
        },
        style,
      ]}
      {...rest}
    />
  );
};

const S = StyleSheet.create({
  base: {
    borderWidth: 1,
  },
});

