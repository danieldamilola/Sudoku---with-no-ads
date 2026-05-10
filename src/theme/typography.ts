import { TextStyle } from 'react-native';

// Calm Logic Sudoku Typography System
export const Typography = {
  // Titles (DM Sans)
  title1: {
    fontFamily: 'DM Sans',
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
  } as TextStyle,
  title2: {
    fontFamily: 'DM Sans',
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 28,
  } as TextStyle,
  title3: {
    fontFamily: 'DM Sans',
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 22,
  } as TextStyle,

  // Body (DM Sans)
  body: {
    fontFamily: 'DM Sans',
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 20,
  } as TextStyle,
  bodyEmphasized: {
    fontFamily: 'DM Sans',
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 20,
  } as TextStyle,

  // Labels (DM Sans)
  labelCaps: {
    fontFamily: 'DM Sans',
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 0.05,
    lineHeight: 16,
  } as TextStyle,
  caption: {
    fontFamily: 'DM Sans',
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  } as TextStyle,
  captionBold: {
    fontFamily: 'DM Sans',
    fontSize: 13,
    fontWeight: '700' as const,
    lineHeight: 18,
  } as TextStyle,

  // Board Numbers (DM Mono)
  boardNumberGiven: {
    fontFamily: 'DM Mono',
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 22,
  } as TextStyle,
  boardNumberInput: {
    fontFamily: 'DM Mono',
    fontSize: 22,
    fontWeight: '400' as const,
    lineHeight: 22,
  } as TextStyle,

  // Numpad Numbers (DM Mono)
  numpadNumber: {
    fontFamily: 'DM Mono',
    fontSize: 26,
    fontWeight: '500' as const,
    lineHeight: 26,
  } as TextStyle,

  // Notes (DM Mono)
  note: {
    fontFamily: 'DM Mono',
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 18,
  } as TextStyle,
} as const;
