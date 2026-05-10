/**
 * Reusable icon component wrapping lucide-react-native.
 * Usage:  <Icon name="Pause" size={22} color="#111" />
 *
 * Benefits of centralising here:
 *  - Swap icon library in one place
 *  - Consistent default size / stroke-width across the app
 *  - TypeScript safety on icon names
 */
import React from 'react';
import * as Icons from 'lucide-react-native';

export type IconName = keyof typeof Icons;

interface Props {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const Icon: React.FC<Props> = ({
  name,
  size = 22,
  color = '#111111',
  strokeWidth = 1.8,
}) => {
  const LucideIcon = Icons[name] as React.FC<{
    size?: number;
    color?: string;
    strokeWidth?: number;
  }>;

  if (!LucideIcon) return null;
  return <LucideIcon size={size} color={color} strokeWidth={strokeWidth} />;
};
