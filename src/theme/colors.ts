// ─── Sudoku App Color Palette (matches reference design) ──────────────────────
export const lightColors = {
  // Page & Surface
  bgPage:                     '#f5f2ee',  // warm off-white background
  bgSurface:                  '#ffffff',
  bgSurfaceDim:               '#e8e4e0',
  bgSurfaceBright:            '#ffffff',
  bgSurfaceContainerLowest:   '#ffffff',
  bgSurfaceContainerLow:      '#f5f2ee',
  bgSurfaceContainer:         '#ece9e5',
  bgSurfaceContainerHigh:     '#e3e0dc',
  bgSurfaceContainerHighest:  '#d9d6d2',
  bgSurfaceVariant:           '#e3e0dc',

  // Text
  textPrimary:                '#1a1a1a',
  textSecondary:              '#6b7280',
  textOnSurface:              '#1a1a1a',
  textOnSurfaceVariant:       '#6b7280',

  // Primary – Indigo Blue (buttons, selected, action)
  primary:                    '#3b5bdb',
  onPrimary:                  '#ffffff',
  primaryContainer:           '#4c6ef5',
  onPrimaryContainer:         '#ffffff',
  primaryFixed:               '#e0e7ff',
  primaryFixedDim:            '#c5d0ff',
  onPrimaryFixed:             '#1a3299',
  onPrimaryFixedVariant:      '#2b47c9',
  inversePrimary:             '#c5d0ff',

  // Secondary – Green (streak, success)
  secondary:                  '#2f9e44',
  onSecondary:                '#ffffff',
  secondaryContainer:         '#d3f9d8',
  onSecondaryContainer:       '#1e6f30',
  secondaryFixed:             '#d3f9d8',
  secondaryFixedDim:          '#8ce99a',
  onSecondaryFixed:           '#0a3d1a',
  onSecondaryFixedVariant:    '#1e6f30',

  // Tertiary – Amber (hard/warning)
  tertiary:                   '#e67700',
  onTertiary:                 '#ffffff',
  tertiaryContainer:          '#fff3cd',
  onTertiaryContainer:        '#7d4000',
  tertiaryFixed:              '#fff3cd',
  tertiaryFixedDim:           '#ffd43b',
  onTertiaryFixed:            '#4a2400',
  onTertiaryFixedVariant:     '#7d4000',

  // Error
  error:                      '#c92a2a',
  onError:                    '#ffffff',
  errorContainer:             '#ffe3e3',
  onErrorContainer:           '#8b0000',

  // Borders
  outline:                    '#adb5bd',
  outlineVariant:             '#dee2e6',
  border:                     '#dee2e6',
  borderCell:                 '#dee2e6',
  borderBox:                  '#1a1a1a',
  borderBoard:                '#1a1a1a',

  // Surface Tint
  surfaceTint:                '#3b5bdb',

  // Inverse
  inverseSurface:             '#2e2e2e',
  inverseOnSurface:           '#f5f2ee',

  // Cell States
  bgCellDefault:              '#ffffff',
  bgCellGiven:                '#f5f2ee',
  bgCellSelected:             '#dbe4ff',
  bgCellHighlight:            '#f0f2ff',
  bgCellError:                '#ffe3e3',
  bgCellSameNumber:           '#e0e7ff',

  // Text States
  textGiven:                  '#1a1a1a',
  textInput:                  '#3b5bdb',
  textError:                  '#c92a2a',

  // Aliases
  accent:                     '#3b5bdb',
  accentDim:                  '#e0e7ff',
  success:                    '#2f9e44',
  warning:                    '#e67700',
};

export const darkColors = {
  bgPage:                     '#050505',
  bgSurface:                  '#101011',
  bgSurfaceDim:               '#151516',
  bgSurfaceBright:            '#1d1d1f',
  bgSurfaceContainerLowest:   '#0b0b0c',
  bgSurfaceContainerLow:      '#101011',
  bgSurfaceContainer:         '#18181a',
  bgSurfaceContainerHigh:     '#202024',
  bgSurfaceContainerHighest:  '#29292c',
  bgSurfaceVariant:           '#343438',

  textPrimary:                '#f5f5f0',
  textSecondary:              '#b9b9c0',
  textOnSurface:              '#f5f5f0',
  textOnSurfaceVariant:       '#b9b9c0',

  primary:                    '#9db6ff',
  onPrimary:                  '#050505',
  primaryContainer:           '#2f57f0',
  onPrimaryContainer:         '#ffffff',
  primaryFixed:               '#17224b',
  primaryFixedDim:            '#23356f',
  onPrimaryFixed:             '#1a3299',
  onPrimaryFixedVariant:      '#9db6ff',
  inversePrimary:             '#3b5bdb',

  secondary:                  '#69db7c',
  onSecondary:                '#0a3d1a',
  secondaryContainer:         '#1e6f30',
  onSecondaryContainer:       '#d3f9d8',
  secondaryFixed:             '#d3f9d8',
  secondaryFixedDim:          '#8ce99a',
  onSecondaryFixed:           '#0a3d1a',
  onSecondaryFixedVariant:    '#1e6f30',

  tertiary:                   '#ffd43b',
  onTertiary:                 '#4a2400',
  tertiaryContainer:          '#7d4000',
  onTertiaryContainer:        '#fff3cd',
  tertiaryFixed:              '#fff3cd',
  tertiaryFixedDim:           '#ffd43b',
  onTertiaryFixed:            '#4a2400',
  onTertiaryFixedVariant:     '#7d4000',

  error:                      '#ff6b6b',
  onError:                    '#4a0000',
  errorContainer:             '#8b0000',
  onErrorContainer:           '#ffe3e3',

  outline:                    '#6f6f78',
  outlineVariant:             '#343438',
  border:                     '#343438',
  borderCell:                 '#343438',
  borderBox:                  '#f5f5f0',
  borderBoard:                '#f5f5f0',

  surfaceTint:                '#748ffc',

  inverseSurface:             '#f5f5f0',
  inverseOnSurface:           '#050505',

  bgCellDefault:              '#050505',
  bgCellGiven:                '#101011',
  bgCellSelected:             '#2f57f0',
  bgCellHighlight:            '#11182e',
  bgCellError:                '#4a0000',
  bgCellSameNumber:           '#192453',

  textGiven:                  '#f5f5f0',
  textInput:                  '#9db6ff',
  textError:                  '#ff6b6b',

  accent:                     '#9db6ff',
  accentDim:                  '#17224b',
  success:                    '#69db7c',
  warning:                    '#ffd43b',
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

  // Difficulty colors matching reference design
  easyColor:        '#2f9e44',
  easyBg:           '#d3f9d8',
  mediumColor:      '#3b5bdb',
  mediumBg:         '#dbe4ff',
  hardColor:        '#e67700',
  hardBg:           '#fff3cd',
  expertColor:      '#c92a2a',
  expertBg:         '#ffe3e3',
} as const;
