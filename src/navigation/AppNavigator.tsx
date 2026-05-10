import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen }       from '../screens/HomeScreen';
import { GameScreen }       from '../screens/GameScreen';
import { SettingsScreen }   from '../screens/SettingsScreen';
import { StatisticsScreen } from '../screens/StatisticsScreen';

const Stack = createNativeStackNavigator();

// ─── Animation presets ────────────────────────────────────────────────────────

/**
 * FADE — used for Settings / Statistics.
 * Fast (220ms), no direction, no chrome sliding around.
 * Content simply appears and disappears — minimal, premium, calm.
 * Used by: iA Writer, Linear, Craft, Apple Notes.
 */
const FADE = {
  animation: 'fade' as const,
  animationDuration: 220,
  gestureEnabled: false,   // fade has no meaningful swipe gesture
};

/**
 * SLIDE UP — used only for the Game screen.
 * Signals a context shift into an immersive focused mode.
 * Dismisses by swiping down (vertical gesture).
 * Duration slightly longer so the transition feels weighty and intentional.
 */
const GAME = {
  animation: 'slide_from_bottom' as const,
  animationDuration: 380,
  gestureEnabled: true,
  gestureDirection: 'vertical' as const,
  fullScreenGestureEnabled: true,
  customAnimationOnSwipe: true,
};

// ─── Navigator ────────────────────────────────────────────────────────────────
export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          animationDuration: 220,
        }}
      >
        {/* Root — no animation */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ animation: 'none' }}
        />

        {/* Game — slides up: entering a focused immersive mode */}
        <Stack.Screen
          name="Game"
          component={GameScreen}
          options={GAME}
        />

        {/* Settings — clean fade: same-level content switch */}
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={FADE}
        />

        {/* Statistics — clean fade: same-level content switch */}
        <Stack.Screen
          name="Statistics"
          component={StatisticsScreen}
          options={FADE}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
