// Premium-minimal spacing + shape system (Nothing-like)
// Rule: stick to this scale for margins/padding/gaps.
export const Spacing = {
  // base grid is 8; allow 4 for micro adjustments
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,

  // layout helpers
  pageX: 20,
  boardMargin: 16,
  cellGap: 0,
} as const;

// Nothing-style: tighter radii, mostly 12/16, pills are full
export const BorderRadius = {
  sm: 10,
  md: 12,
  lg: 16,
  pill: 9999,
} as const;

// Policy: no shadows. Depth comes from tone + stroke.
export const Shadow = {
  none: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
} as const;
