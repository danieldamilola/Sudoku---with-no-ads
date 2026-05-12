import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

interface BrandMarkProps {
  size?: number;
  color?: string;
}

const BRAND_LOGO = require('../../Sudoku logo 2.jpg');

export const BrandMark: React.FC<BrandMarkProps> = ({ size = 28, color = '#111111' }) => {
  void color;
  return (
    <View style={[styles.root, { width: size, height: size }]} accessibilityRole="image" accessibilityLabel="Sudoku logo">
      <Image
        source={BRAND_LOGO}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
