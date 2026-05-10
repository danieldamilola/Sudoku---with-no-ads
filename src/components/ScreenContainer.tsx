import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenContainerProps extends ViewProps {
  children: React.ReactNode;
  backgroundColor: string;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({ children, backgroundColor, style, ...rest }) => {
  return (
    <SafeAreaView style={[styles.root, { backgroundColor }]}>
      <View style={[styles.content, style]} {...rest}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1, width: '100%' },
});

