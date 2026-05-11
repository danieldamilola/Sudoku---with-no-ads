import React from 'react';
import { StyleSheet, View } from 'react-native';

interface BrandMarkProps {
  size?: number;
  color?: string;
}

const CELLS = [
  [20, 4],
  [10, 12],
  [30, 12],
  [20, 22],
  [10, 32],
  [30, 32],
  [20, 40],
] as const;

export const BrandMark: React.FC<BrandMarkProps> = ({ size = 28, color = '#111111' }) => {
  const scale = size / 48;
  const cellSize = 8 * scale;

  return (
    <View style={[styles.root, { width: size, height: size }]} accessibilityRole="image" accessibilityLabel="Sudoku">
      {CELLS.map(([x, y]) => (
        <View
          key={`${x}-${y}`}
          style={[
            styles.cell,
            {
              width: cellSize,
              height: cellSize,
              borderRadius: Math.max(1, 1.2 * scale),
              backgroundColor: color,
              left: x * scale,
              top: y * scale,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    position: 'relative',
  },
  cell: {
    position: 'absolute',
  },
});
