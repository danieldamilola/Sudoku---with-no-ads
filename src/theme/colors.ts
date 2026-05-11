// ─── Sudoku App Color Palette (matches desktop design) ──────────────────────
export const lightColors = {
  // Page & Surface
  bgPage:                     '#fcf8fb',
  bgSurface:                  '#ffffff',
  bgSurfaceDim:               '#f6f3f5',
  bgSurfaceBright:            '#ffffff',
  bgSurfaceContainerLowest:   '#ffffff',
  bgSurfaceContainerLow:      '#fcf8fb',
  bgSurfaceContainer:         '#f0edef',
  bgSurfaceContainerHigh:     '#f6f3f5',
  bgSurfaceContainerHighest:  '#e4e2e4',
  bgSurfaceVariant:           '#f0edef',

  // Text
  textPrimary:                '#1b1b1d',
  textSecondary:              '#444654',
  textOnSurface:              '#1b1b1d',
  textOnSurfaceVariant:       '#444654',

  // Primary – Indigo Blue
  primary:                    '#274ed5',
  onPrimary:                  '#ffffff',
  primaryContainer:           '#4669f0',
  onPrimaryContainer:         '#ffffff',
  primaryFixed:               '#dce3ff',
  primaryFixedDim:            '#c5d0ff',
  onPrimaryFixed:             '#1a3299',
  onPrimaryFixedVariant:      '#2b47c9',
  inversePrimary:             '#c5d0ff',

  // Secondary – Green
  secondary:                  '#34c759',
  onSecondary:                '#ffffff',
  secondaryContainer:         '#d1fae5',
  onSecondaryContainer:       '#137333',
  secondaryFixed:             '#d1fae5',
  secondaryFixedDim:          '#8ce99a',
  onSecondaryFixed:           '#0a3d1a',
  onSecondaryFixedVariant:    '#1e6f30',

  // Tertiary – Amber
  tertiary:                   '#845000',
  onTertiary:                 '#ffffff',
  tertiaryContainer:          '#ffddbb',
  onTertiaryContainer:        '#7d4000',
  tertiaryFixed:              '#ffddbb',
  tertiaryFixedDim:           '#ffd43b',
  onTertiaryFixed:            '#4a2400',
  onTertiaryFixedVariant:     '#7d4000',

  // Error
  error:                      '#ba1a1a',
  onError:                    '#ffffff',
  errorContainer:             '#ffdad6',
  onErrorContainer:           '#8b0000',

  // Borders
  outline:                    '#c4c5d7',
  outlineVariant:             '#dcd9dc',
  border:                     '#dcd9dc',
  borderCell:                 '#dcd9dc',
  borderBox:                  '#1a1a1a',
  borderBoard:                '#1a1a1a',

  // Surface Tint
  surfaceTint:                '#274ed5',

  // Inverse
  inverseSurface:             '#303032',
  inverseOnSurface:           '#fcf8fb',

  // Cell States
  bgCellDefault:              '#ffffff',
  bgCellGiven:                '#f3f4f6',
  bgCellSelected:             '#dbeafe',
  bgCellHighlight:            '#f0f2ff',
  bgCellError:                '#ffdad6',
  bgCellSameNumber:           '#dce3ff',

  // Text States
  textGiven:                  '#1a1a1a',
  textInput:                  '#274ed5',
  textError:                  '#ba1a1a',

  // Aliases
  accent:                     '#274ed5',
  accentDim:                  '#dce3ff',
  success:                    '#34c759',
  warning:                    '#845000',
};

export const darkColors = {
  bgPage:                     '#050505',
  bgSurface:                  '#101011',
  bgSurfaceDim:               '#151516',
  bgSurfaceBright:            '#1d1d1f',
  bgSurfaceContainerLowest:   '#050505',
  bgSurfaceContainerLow:      '#101011',
  bgSurfaceContainer:         '#1d1d1f',
  bgSurfaceContainerHigh:     '#202024',
  bgSurfaceContainerHighest:  '#29292c',
  bgSurfaceVariant:           '#343438',

  textPrimary:                '#f5f5f0',
  textSecondary:              '#c8c8ce',
  textOnSurface:              '#f5f5f0',
  textOnSurfaceVariant:       '#c8c8ce',

  primary:                    '#9db6ff',
  onPrimary:                  '#050505',
  primaryContainer:           '#2f57f0',
  onPrimaryContainer:         '#ffffff',
  primaryFixed:               '#17224b',
  primaryFixedDim:            '#23356f',
  onPrimaryFixed:             '#1a3299',
  onPrimaryFixedVariant:      '#9db6ff',
  inversePrimary:             '#274ed5',

  secondary:                  '#5ee577',
  onSecondary:                '#0a3d1a',
  secondaryContainer:         '#137333',
  onSecondaryContainer:       '#d1fae5',
  secondaryFixed:             '#d1fae5',
  secondaryFixedDim:          '#8ce99a',
  onSecondaryFixed:           '#0a3d1a',
  onSecondaryFixedVariant:    '#137333',

  tertiary:                   '#ffc779',
  onTertiary:                 '#7d4000',
  tertiaryContainer:          '#7d4000',
  onTertiaryContainer:        '#ffddbb',
  tertiaryFixed:              '#ffddbb',
  tertiaryFixedDim:           '#ffd43b',
  onTertiaryFixed:            '#4a2400',
  onTertiaryFixedVariant:     '#7d4000',

  error:                      '#ff7b7b',
  onError:                    '#4a0000',
  errorContainer:             '#3a1214',
  onErrorContainer:           '#ffdad6',

  outline:                    '#8e8e96',
  outlineVariant:             '#343438',
  border:                     '#29292c',
  borderCell:                 '#29292c',
  borderBox:                  '#58585a',
  borderBoard:                '#3a3a3d',

  surfaceTint:                '#748ffc',

  inverseSurface:             '#f5f5f0',
  inverseOnSurface:           '#050505',

  bgCellDefault:              '#0a0a0b',
  bgCellGiven:                '#101011',
  bgCellSelected:             '#2f57f0',
  bgCellHighlight:            '#0c1020',
  bgCellError:                '#3a1214',
  bgCellSameNumber:           '#141d3f',

  textGiven:                  '#f5f5f0',
  textInput:                  '#9db6ff',
  textError:                  '#ff7b7b',

  accent:                     '#9db6ff',
  accentDim:                  '#17224b',
  success:                    '#5ee577',
  warning:                    '#ffc779',
};

export const Colors = {
  // Light defaults
  bgPage:           lightColors.bgPage,
  bgSurface:        lightColors.bgSurface,
  bgCellDefault:    lightColors.bgCellDefault,
  bgCellSelected:   lightColors.bgCellSelected,
  bgCellHighlight:  lightColors.bgCellHighlight,
  bgCellGiven:      lightColors.bgCellGiven,
  bgCellError:      lightColors.bgCellError,
  textPrimary:      lightColors.textPrimary,
  textSecondary:    lightColors.textSecondary,
  textGiven:        lightColors.textGiven,
  textInput:        lightColors.textInput,
  textError:        lightColors.textError,
  accent:           lightColors.accent,
  accentDim:        lightColors.accentDim,
  success:          lightColors.success,
  error:            lightColors.error,
  warning:          lightColors.warning,
  borderCell:       lightColors.borderCell,
  borderBox:        lightColors.borderBox,
  borderBoard:      lightColors.borderBoard,

  // Difficulty colors matching desktop design
  easyColor:        '#34c759',
  easyBg:           '#d1fae5',
  mediumColor:      '#274ed5',
  mediumBg:         '#dbeafe',
  hardColor:        '#845000',
  hardBg:           '#ffddbb',
  expertColor:      '#ba1a1a',
  expertBg:         '#ffdad6',
} as const;
