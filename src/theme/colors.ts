// ─── Sudoku App Color Palette ──────────────────────────────────────────────
// Aligned with UX plan token contract (shared with desktop index.css)
// Token names: https://ux_plan.md Section 1

export const lightColors = {
  // ── Page & Surface ──────────────────────────────────────────────────────
  bgPage: "#f4f5f6", // bg-page
  bgSurface: "#ffffff", // bg-surface
  bgSurfaceDim: "#eef0f2",
  bgSurfaceBright: "#ffffff",
  bgSurfaceContainerLowest: "#ffffff",
  bgSurfaceContainerLow: "#f7f5f2",
  bgSurfaceContainer: "#e7eaee", // bg-container
  bgSurfaceContainerHigh: "#edf0f3",
  bgSurfaceContainerHighest: "#d8dde3",
  bgSurfaceVariant: "#e7eaee",

  // ── Text ────────────────────────────────────────────────────────────────
  textPrimary: "#18171a", // ink
  textSecondary: "#626874", // muted
  textOnSurface: "#18171a",
  textOnSurfaceVariant: "#52505a",

  // ── Primary – Indigo Blue (accent) ──────────────────────────────────────
  primary: "#111317", // accent
  onPrimary: "#ffffff",
  primaryContainer: "#2a2f38", // accent-strong
  onPrimaryContainer: "#ffffff",
  primaryFixed: "#eceff3", // accent-wash
  primaryFixedDim: "#d8dde3",
  onPrimaryFixed: "#111317", // accent-strong
  onPrimaryFixedVariant: "#2a2f38",
  inversePrimary: "#d8dde3",

  // ── Secondary – Green ────────────────────────────────────────────────────
  secondary: "#1a7a40", // green
  onSecondary: "#ffffff",
  secondaryContainer: "#d4f0e0",
  onSecondaryContainer: "#1a7a40",
  secondaryFixed: "#d4f0e0",
  secondaryFixedDim: "#a8e6b8",
  onSecondaryFixed: "#0d4d1a",
  onSecondaryFixedVariant: "#1a7a40",

  // ── Tertiary – Amber/Orange ──────────────────────────────────────────────
  tertiary: "#a04f00", // orange
  onTertiary: "#ffffff",
  tertiaryContainer: "#fde8cc",
  onTertiaryContainer: "#a04f00",
  tertiaryFixed: "#fde8cc",
  tertiaryFixedDim: "#fcd49d",
  onTertiaryFixed: "#5c2a00",
  onTertiaryFixedVariant: "#a04f00",

  // ── Error – Red ──────────────────────────────────────────────────────────
  error: "#c0180f", // red
  onError: "#ffffff",
  errorContainer: "#fde4e2", // red-wash
  onErrorContainer: "#c0180f",

  // ── Purple (master difficulty) ───────────────────────────────────────────
  purple: "#6b30d4",
  purpleWash: "#ede6fc",

  // ── Borders ──────────────────────────────────────────────────────────────
  outline: "#aeb5bf",
  outlineVariant: "#d8dde3", // line
  border: "#d8dde3",
  borderCell: "#d8dde3",
  borderBox: "#aeb5bf", // line-strong
  borderBoard: "#aeb5bf",

  // ── Surface Tint ─────────────────────────────────────────────────────────
  surfaceTint: "#111317",

  // ── Inverse ──────────────────────────────────────────────────────────────
  inverseSurface: "#303032",
  inverseOnSurface: "#f7f5f2",

  // ── Cell States ──────────────────────────────────────────────────────────
  bgCellDefault: "#ffffff",
  bgCellGiven: "#ffffff",
  bgCellSelected: "#3650d4", // accent
  bgCellHighlight: "#e8edfb", // accent-wash
  bgCellError: "#fde4e2", // red-wash
  bgCellSameNumber: "#c2ccf5",

  // ── Text States ──────────────────────────────────────────────────────────
  textGiven: "#18171a",
  textInput: "#3650d4",
  textError: "#c0180f",

  // ── Sematic Aliases ──────────────────────────────────────────────────────
  accent: "#111317",
  accentDim: "#eceff3",
  accentStrong: "#2a2f38",
  success: "#1a7a40",
  warning: "#a04f00",
  faint: "#7a7882",
  line: "#e0ddd9",
  lineStrong: "#bfbcba",
};

export const darkColors = {
  // ── Page & Surface ──────────────────────────────────────────────────────
  bgPage: "#0e0e0e", // bg-page
  bgSurface: "#161616", // bg-surface
  bgSurfaceDim: "#1a1a1a",
  bgSurfaceBright: "#202020",
  bgSurfaceContainerLowest: "#0e0e0e",
  bgSurfaceContainerLow: "#161616",
  bgSurfaceContainer: "#202020", // bg-container
  bgSurfaceContainerHigh: "#272727",
  bgSurfaceContainerHighest: "#303030",
  bgSurfaceVariant: "#2c2c2c",

  // ── Text ────────────────────────────────────────────────────────────────
  textPrimary: "#f2f2f2", // ink
  textSecondary: "#9a9a9a", // muted
  textOnSurface: "#f2f2f2",
  textOnSurfaceVariant: "#9a9a9a",

  // ── Primary – Indigo Blue (accent) ──────────────────────────────────────
  primary: "#f2f2f2", // accent
  onPrimary: "#0b0d10",
  primaryContainer: "#d8dde3", // accent-strong
  onPrimaryContainer: "#0b0d10",
  primaryFixed: "#202531", // accent-wash
  primaryFixedDim: "#2a3040",
  onPrimaryFixed: "#f2f2f2",
  onPrimaryFixedVariant: "#d8dde3",
  inversePrimary: "#111317",

  // ── Secondary – Green ────────────────────────────────────────────────────
  secondary: "#5ee577", // green
  onSecondary: "#0d1a0a",
  secondaryContainer: "#0d2a1a",
  onSecondaryContainer: "#d4f0e0",
  secondaryFixed: "#d4f0e0",
  secondaryFixedDim: "#8ce99a",
  onSecondaryFixed: "#0d4d1a",
  onSecondaryFixedVariant: "#5ee577",

  // ── Tertiary – Amber/Orange ──────────────────────────────────────────────
  tertiary: "#ffc779", // orange
  onTertiary: "#5c2a00",
  tertiaryContainer: "#3a2611",
  onTertiaryContainer: "#fde8cc",
  tertiaryFixed: "#fde8cc",
  tertiaryFixedDim: "#ffd43b",
  onTertiaryFixed: "#5c2a00",
  onTertiaryFixedVariant: "#ffc779",

  // ── Error – Red ──────────────────────────────────────────────────────────
  error: "#ff7b7b", // red
  onError: "#4a0000",
  errorContainer: "#3a1214", // red-wash
  onErrorContainer: "#fde4e2",

  // ── Purple (master difficulty) ───────────────────────────────────────────
  purple: "#c49dff",
  purpleWash: "#1e1030",

  // ── Borders ──────────────────────────────────────────────────────────────
  outline: "#5f6775",
  outlineVariant: "#2a3040",
  border: "#202531", // line
  borderCell: "#202531",
  borderBox: "#2a3040", // line-strong
  borderBoard: "#2a3040",

  // ── Surface Tint ─────────────────────────────────────────────────────────
  surfaceTint: "#f2f2f2",

  // ── Inverse ──────────────────────────────────────────────────────────────
  inverseSurface: "#f2f2f2",
  inverseOnSurface: "#0e0e0e",

  // ── Cell States ──────────────────────────────────────────────────────────
  bgCellDefault: "#111111",
  bgCellGiven: "#111111",
  bgCellSelected: "#5b7eff", // accent-strong
  bgCellHighlight: "#171f42", // accent-wash
  bgCellError: "#3a1214", // red-wash
  bgCellSameNumber: "#1e2d5c",

  // ── Text States ──────────────────────────────────────────────────────────
  textGiven: "#f2f2f2",
  textInput: "#a0b4ff",
  textError: "#ff7b7b",

  // ── Semantic Aliases ─────────────────────────────────────────────────────
  accent: "#f2f2f2",
  accentDim: "#202531",
  accentStrong: "#d8dde3",
  success: "#5ee577",
  warning: "#ffc779",
  faint: "#747474",
  line: "#2c2c2c",
  lineStrong: "#404040",
};

export const Colors = {
  // Light defaults
  bgPage: lightColors.bgPage,
  bgSurface: lightColors.bgSurface,
  bgCellDefault: lightColors.bgCellDefault,
  bgCellSelected: lightColors.bgCellSelected,
  bgCellHighlight: lightColors.bgCellHighlight,
  bgCellGiven: lightColors.bgCellGiven,
  bgCellError: lightColors.bgCellError,
  textPrimary: lightColors.textPrimary,
  textSecondary: lightColors.textSecondary,
  textGiven: lightColors.textGiven,
  textInput: lightColors.textInput,
  textError: lightColors.textError,
  accent: lightColors.accent,
  accentDim: lightColors.accentDim,
  success: lightColors.success,
  error: lightColors.error,
  warning: lightColors.warning,
  borderCell: lightColors.borderCell,
  borderBox: lightColors.borderBox,
  borderBoard: lightColors.borderBoard,

  // Difficulty colors matching desktop design
  easyColor: "#1a7a40",
  easyBg: "#d4f0e0",
  mediumColor: "#3650d4",
  mediumBg: "#e8edfb",
  hardColor: "#a04f00",
  hardBg: "#fde8cc",
  expertColor: "#c0180f",
  expertBg: "#fde4e2",
} as const;
