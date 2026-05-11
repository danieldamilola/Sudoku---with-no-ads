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
  bgCellGiven:                '#ffffff',
  bgCellSelected:             '#4669f0',
  bgCellHighlight:            '#dfe5ff',
  bgCellError:                '#ffdad6',
  bgCellSameNumber:           '#ccd6ff',

  // Text States
  textGiven:                  '#1b1b1d',
  textInput:                  '#1b1b1d',
  textError:                  '#ba1a1a',

  // Aliases
  accent:                     '#274ed5',
  accentDim:                  '#dce3ff',
  success:                    '#34c759',
  warning:                    '#845000',
};

export const darkColors = {
  bgPage:                     '#0e0e0e',
  bgSurface:                  '#161616',
  bgSurfaceDim:               '#1a1a1a',
  bgSurfaceBright:            '#202020',
  bgSurfaceContainerLowest:   '#0e0e0e',
  bgSurfaceContainerLow:      '#161616',
  bgSurfaceContainer:         '#202020',
  bgSurfaceContainerHigh:     '#272727',
  bgSurfaceContainerHighest:  '#303030',
  bgSurfaceVariant:           '#404040',

  textPrimary:                '#f2f2f2',
  textSecondary:              '#9a9a9a',
  textOnSurface:              '#f2f2f2',
  textOnSurfaceVariant:       '#9a9a9a',

  primary:                    '#a0b4ff',
  onPrimary:                  '#0e0e0e',
  primaryContainer:           '#5b7eff',
  onPrimaryContainer:         '#f2f2f2',
  primaryFixed:               '#171f42',
  primaryFixedDim:            '#202a5a',
  onPrimaryFixed:             '#a0b4ff',
  onPrimaryFixedVariant:      '#a0b4ff',
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

  outline:                    '#747474',
  outlineVariant:             '#404040',
  border:                     '#2c2c2c',
  borderCell:                 '#2c2c2c',
  borderBox:                  '#5a5a5a',
  borderBoard:                '#404040',

  surfaceTint:                '#748ffc',

  inverseSurface:             '#f2f2f2',
  inverseOnSurface:           '#0e0e0e',

  bgCellDefault:              '#111111',
  bgCellGiven:                '#111111',
  bgCellSelected:             '#5b7eff',
  bgCellHighlight:            '#1a1a1a',
  bgCellError:                '#3a1214',
  bgCellSameNumber:           '#202020',

  textGiven:                  '#f2f2f2',
  textInput:                  '#a0b4ff',
  textError:                  '#ff7b7b',

  accent:                     '#a0b4ff',
  accentDim:                  '#171f42',
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
