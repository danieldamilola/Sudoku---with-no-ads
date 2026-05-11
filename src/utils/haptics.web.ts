/**
 * Web stub for expo-haptics.
 * Haptic feedback doesn't exist on desktop — all calls are no-ops.
 * Metro resolves this file first on web (*.web.ts > *.ts) automatically.
 */
export const ImpactFeedbackStyle = {
  Light: 'light',
  Medium: 'medium',
  Heavy: 'heavy',
} as const;

export const NotificationFeedbackType = {
  Success: 'success',
  Warning: 'warning',
  Error: 'error',
} as const;

export const impactAsync = (_style?: unknown): Promise<void> =>
  Promise.resolve();

export const notificationAsync = (_type?: unknown): Promise<void> =>
  Promise.resolve();

export const selectionAsync = (): Promise<void> => Promise.resolve();
