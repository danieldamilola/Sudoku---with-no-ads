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
 * TAB — used for Settings / Statistics.
 * Instant switch, no animation — matches native iOS/Android tab bar behaviour.
 */
const TAB = {
  animation: 'none' as const,
  gestureEnabled: false,
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

        {/* Settings — instant: tab-bar switch */}
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={TAB}
        />

        {/* Statistics — instant: tab-bar switch */}
        <Stack.Screen
          name="Statistics"
          component={StatisticsScreen}
          options={TAB}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
