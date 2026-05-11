import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated, AppState, AppStateStatus, Modal, StyleSheet,
  Text, TouchableOpacity, useWindowDimensions, View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Pause, Play, Eraser, PencilLine,
  Lightbulb, RotateCcw, User, Home,
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useStore } from '../store/useStore';
import { SudokuValidator } from '../utils/sudoku';
import { Difficulty, SudokuCell } from '../types';
import { formatTime } from '../utils/time';
import type { lightColors } from '../theme/colors';

type ThemeColors = typeof lightColors;

const MAX_SECOND_CHANCES = 3;


// ─── Design tokens ────────────────────────────────────────────────────────────
const D = {
  boardBorder : '#111111',
  boxLine     : '#111111',
  cellLine    : '#d0d0d0',
  sel         : '#c5d3f7',
  related     : '#ebeef8',
  sameNum     : '#d2dcf5',
  errBg       : '#fde8e8',
  numGiven    : '#111111',
  numUser     : '#3b5bdb',
  numErr      : '#c92a2a',
  noteClr     : '#8492b0',
  actClr      : '#6b7280',
  actActive   : '#3b5bdb',
  actActiveBg : '#e8edff',
  numPadBg    : '#ffffff',
  numPadBdr   : '#e2e2e2',
  primary     : '#3b5bdb',
  success     : '#40c057',
};

// ─── Reusable action button ───────────────────────────────────────────────────────────────────
const Btn = ({
  LIcon, label, active, onPress, disabled, themeColors,
}: {
  LIcon: React.FC<{ size: number; color: string; strokeWidth: number }>;
  label: string;
  active?: boolean;
  onPress: () => void;
  disabled?: boolean;
  themeColors: { accent: string; accentDim: string; textSecondary: string };
}) => (
  <TouchableOpacity
    onPress={onPress} disabled={disabled} activeOpacity={0.65}
    style={[S.actBtn, active && { backgroundColor: themeColors.accentDim }, disabled && { opacity: 0.3 }]}
  >
    <LIcon size={22} color={active ? themeColors.accent : themeColors.textSecondary} strokeWidth={1.8} />
    <Text style={[S.actLbl, { color: active ? themeColors.accent : themeColors.textSecondary }]}>{label}</Text>
  </TouchableOpacity>
);

// ─── Board ────────────────────────────────────────────────────────────────────
// Uses absolute-positioned overlay lines so borders are always pixel-perfect.
const BOARD_OUTER = 2.5;  // outer frame thickness
const BOX_LINE    = 2;    // 3×3 box separator
const CELL_LINE   = 0.5;  // individual cell line

interface BoardProps {
  cells: SudokuCell[];
  dim: number;          // board pixel size (exact)
  cellSize: number;
  colors: ThemeColors;
  selectedIdx: number | null;
  related: Set<number>;
  sameNum: Set<number>;
  isPaused: boolean;
  showMistakes: boolean;
  isDark: boolean;
  anims:      React.MutableRefObject<Record<number, Animated.Value>>;
  shakeAnims: React.MutableRefObject<Record<number, Animated.Value>>;
  onCell: (idx: number) => void;
}

const Board = React.memo(({
  cells, dim, cellSize, colors, selectedIdx, related, sameNum,
  isPaused, showMistakes, anims, shakeAnims, onCell, isDark,
}: BoardProps) => {
  const getAnim = (i: number) => {
    if (!anims.current[i]) anims.current[i] = new Animated.Value(1);
    return anims.current[i];
  };

  const getShake = (i: number) => {
    if (!shakeAnims.current[i]) shakeAnims.current[i] = new Animated.Value(0);
    return shakeAnims.current[i];
  };

  const getCellBg = (cell: SudokuCell, idx: number) => {
    if (cell.isError && showMistakes) return colors.bgCellError;
    if (idx === selectedIdx)          return colors.bgCellSelected;
    if (sameNum.has(idx))             return colors.bgCellSameNumber;
    if (related.has(idx))             return colors.bgCellHighlight;
    return cell.isGiven ? colors.bgCellGiven : colors.bgCellDefault;
  };

  const noteSize = Math.max(7, Math.floor(cellSize * 0.22));

  const getCellBorders = (idx: number) => {
    const col = idx % 9;
    const row = Math.floor(idx / 9);
    const rightIsBox  = col === 2 || col === 5;
    const bottomIsBox = row === 2 || row === 5;
    return {
      borderRightWidth:  col === 8 ? 0 : rightIsBox  ? BOX_LINE  : CELL_LINE,
      borderBottomWidth: row === 8 ? 0 : bottomIsBox ? BOX_LINE  : CELL_LINE,
      borderRightColor:  rightIsBox  ? colors.borderBox  : colors.borderCell,
      borderBottomColor: bottomIsBox ? colors.borderBox  : colors.borderCell,
    };
  };

  return (
    <View style={[S.boardOuter, {
      width: dim + BOARD_OUTER * 2,
      height: dim + BOARD_OUTER * 2,
      borderColor: colors.borderBoard,
      backgroundColor: colors.borderBoard,
      shadowOpacity: isDark ? 0 : 0.10,
      elevation: isDark ? 0 : 4,
    }]}>
      {/* ── Cells ── */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: dim, height: dim }}>
        {cells.map((cell, idx) => {
          const isSelected = idx === selectedIdx;
          const numClr = (cell.isError && showMistakes) ? colors.textError
            : isSelected                               ? colors.onPrimary
            : cell.isGiven                            ? colors.textGiven
            : colors.textInput;
          return (
            <Animated.View key={idx} style={{ transform: [{ scale: getAnim(idx) }, { translateX: getShake(idx) }] }}>
              <TouchableOpacity
                onPress={() => !isPaused && onCell(idx)}
                activeOpacity={0.7}
                style={{
                  width: cellSize, height: cellSize,
                  backgroundColor: getCellBg(cell, idx),
                  alignItems: 'center', justifyContent: 'center',
                  ...getCellBorders(idx),
                }}
              >
                {cell.value !== null ? (
                  <Text style={{
                    fontSize: Math.floor(cellSize * 0.52),
                    color: numClr,
                    fontWeight: cell.isGiven ? '700' : '600',
                    includeFontPadding: false,
                  }}>
                    {cell.value}
                  </Text>
                ) : cell.notes && cell.notes.length > 0 ? (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: cellSize }}>
                    {[1,2,3,4,5,6,7,8,9].map(n => (
                      <Text key={n} style={{
                        width: '33.33%', textAlign: 'center',
                        fontSize: noteSize, lineHeight: noteSize + 4,
                        color: colors.textSecondary, includeFontPadding: false,
                      }}>
                        {cell.notes?.includes(n) ? n : ''}
                      </Text>
                    ))}
                  </View>
                ) : null}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

    </View>
  );
});

// ─── Screen ───────────────────────────────────────────────────────────────────
export const GameScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const navigation        = useNavigation();
  const insets            = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const cells         = useStore(s => s.cells);
  const difficulty    = useStore(s => s.difficulty);
  const elapsed       = useStore(s => s.elapsedSeconds);
  const mistakes      = useStore(s => s.mistakes);
  const hintsUsed     = useStore(s => s.hintsUsed);
  const isPaused      = useStore(s => s.isPaused);
  const isCompleted   = useStore(s => s.isCompleted);
  const isFailed      = useStore(s => s.isFailed);
  const secondChancesUsed = useStore(s => s.secondChancesUsed);
  const livePoints    = useStore(s => s.livePoints);
  const selectedIdx   = useStore(s => s.selectedCellIndex);
  const notesMode     = useStore(s => s.notesMode);
  const settings      = useStore(s => s.settings);

  // ── Layout: compute cellSize so board never overflows ─────────────────────
  // Fixed heights (approx) – used to carve out space for board
  const H_HEADER  = 50;
  const H_STATS   = 54;
  const H_ACTIONS = 62;
  const H_MARGINS = 20;
  const PAD       = 16; // numpad horizontal padding
  const GAP       = 8;  // numpad gap

  const numBtnW    = Math.floor((width - PAD * 2 - GAP * 2) / 3);
  const numBtnH    = Math.floor(numBtnW * 0.68);
  const H_NUMPAD   = numBtnH * 3 + GAP * 2 + 10;

  const totalReserved = insets.top + insets.bottom + H_HEADER + H_STATS + H_ACTIONS + H_NUMPAD + H_MARGINS;
  const boardAvailH   = height - totalReserved;

  const cellFromW  = Math.floor((width - 24) / 9);   // 12px margin each side
  const cellFromH  = Math.floor(boardAvailH / 9);
  const cellSize   = Math.min(cellFromW, cellFromH);
  const boardDim   = cellSize * 9;

  const noUndo         = difficulty === Difficulty.Expert || difficulty === Difficulty.Master;
  const mistakeLimit   = settings.mistakeLimit;
  const mistakeText    = mistakeLimit > 0 ? `${mistakes}/${mistakeLimit}` : `${mistakes}`;
  const remainingHints = Math.max(0, settings.hintsPerGame - hintsUsed);
  const diffLabel      = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

  // ── Singleton timer ────────────────────────────────────────────────────────────────
  // Start once on mount, stop on unmount. Safe against StrictMode double-mount
  // because the store guards with `if (_timerInterval) return`.
  useEffect(() => {
    useStore.getState().startTimer();
    return () => useStore.getState().stopTimer();
  }, []);

  // ── Auto-pause on navigation blur (phone back / tab switch) ─────────────────────
  useFocusEffect(
    React.useCallback(() => {
      // Screen gained focus — nothing to do, user taps Resume themselves
      return () => {
        // Screen lost focus (navigated away, phone home button, etc.)
        useStore.getState().pauseGame();
      };
    }, [])
  );

  // ── Auto-pause when app goes to background ─────────────────────────────────
  useEffect(() => {
    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === 'background' || nextState === 'inactive') {
        useStore.getState().pauseGame();
      }
    };
    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, []);


  const selectedCell = selectedIdx !== null ? cells[selectedIdx] : null;

  const related = useMemo(() => {
    if (!selectedCell) return new Set<number>();
    return new Set(SudokuValidator.getRelatedCellsIndices(selectedCell.row, selectedCell.col));
  }, [selectedCell]);

  const sameNum = useMemo(() => {
    if (!selectedCell?.value || !settings.highlightDuplicates) return new Set<number>();
    return new Set(SudokuValidator.getSameNumberCells(cells, selectedCell.value));
  }, [cells, selectedCell, settings.highlightDuplicates]);

  // Which digits 1-9 are fully placed (9 correct cells) — hide those from numpad
  const completedNumbers = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const cell of cells) {
      if (cell.value && !cell.isError) counts[cell.value] = (counts[cell.value] ?? 0) + 1;
    }
    const done = new Set<number>();
    for (let n = 1; n <= 9; n++) { if ((counts[n] ?? 0) >= 9) done.add(n); }
    return done;
  }, [cells]);

  const anims      = useRef<Record<number, Animated.Value>>({});
  const shakeAnims  = useRef<Record<number, Animated.Value>>({});

  const animCell = (idx: number) => {
    if (!anims.current[idx]) anims.current[idx] = new Animated.Value(1);
    Animated.sequence([
      Animated.timing(anims.current[idx], { toValue: 0.88, duration: 55, useNativeDriver: true }),
      Animated.spring(anims.current[idx],  { toValue: 1, friction: 4, tension: 180, useNativeDriver: true }),
    ]).start();
  };

  const shakeCell = (idx: number) => {
    if (!shakeAnims.current[idx]) shakeAnims.current[idx] = new Animated.Value(0);
    const a = shakeAnims.current[idx];
    a.setValue(0);
    Animated.sequence([
      Animated.timing(a, { toValue:  7, duration: 45, useNativeDriver: true }),
      Animated.timing(a, { toValue: -7, duration: 45, useNativeDriver: true }),
      Animated.timing(a, { toValue:  5, duration: 40, useNativeDriver: true }),
      Animated.timing(a, { toValue: -5, duration: 40, useNativeDriver: true }),
      Animated.timing(a, { toValue:  0, duration: 35, useNativeDriver: true }),
    ]).start();
  };

  // ── Detect number-entry outcomes and trigger matching animations ──────────
  const prevCellsRef = useRef<typeof cells>([]);
  useEffect(() => {
    const prev = prevCellsRef.current;
    if (prev.length > 0 && prev.length === cells.length && selectedIdx !== null) {
      const cell     = cells[selectedIdx];
      const prevCell = prev[selectedIdx];
      if (cell.isError && !prevCell?.isError) {
        shakeCell(selectedIdx);                            // wrong — shake
      } else if (cell.value !== null && cell.value !== prevCell?.value && !cell.isError) {
        animCell(selectedIdx);                             // correct — pulse
      }
    }
    prevCellsRef.current = cells;
  }, [cells, selectedIdx]);

  // ── Diagonal wave sweep on puzzle completion ──────────────────────────────
  useEffect(() => {
    if (!isCompleted || isFailed) return;
    cells.forEach((_, idx) => {
      const delay = (Math.floor(idx / 9) + idx % 9) * 18;
      setTimeout(() => animCell(idx), delay);
    });
  }, [isCompleted, isFailed]);

  if (!cells.length) {
    return (
      <View style={[S.root, { backgroundColor: colors.bgPage, paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={[{ fontSize: 18, fontWeight: '600', marginBottom: 20, color: colors.textPrimary }]}>No puzzle loaded</Text>
        <TouchableOpacity
          style={[S.primaryBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home' as never)}
        >
          <Text style={[S.primaryBtnTxt, { color: colors.onPrimary }]}>Go to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[S.root, { backgroundColor: colors.bgPage, paddingTop: insets.top }]}>

      {/* HEADER */}
      <View style={[S.header, { height: H_HEADER }]}>
        {/* Pause / Resume toggle */}
        <TouchableOpacity onPress={() => useStore.getState().togglePause()} style={S.iconBtn}>
          {isPaused
            ? <Play size={24} color={colors.textPrimary} strokeWidth={2} />
            : <Pause size={24} color={colors.textPrimary} strokeWidth={2} />}
        </TouchableOpacity>
        {/* Difficulty badge */}
        <View style={[S.diffBadge, { borderColor: colors.outlineVariant, backgroundColor: colors.bgSurface }]}>
          <Text style={[S.diffBadgeTxt, { color: colors.textPrimary }]}>{diffLabel}</Text>
        </View>
        {/* Navigate to Statistics */}
        <TouchableOpacity onPress={() => navigation.navigate('Statistics' as never)} style={S.iconBtn}>
          <User size={24} color={colors.textPrimary} strokeWidth={1.8} />
        </TouchableOpacity>
      </View>

      {/* STATS */}
      <View style={[S.statsRow, { height: H_STATS }]}>
        <View style={S.statCell}>
          <Text style={[S.statLbl, { color: colors.textSecondary }]}>MISTAKES</Text>
          <Text style={[S.statVal, { color: (mistakeLimit > 0 && mistakes >= mistakeLimit) ? colors.textError : colors.textPrimary }]}>
            {mistakeText}
          </Text>
        </View>
        <View style={[S.statCell, S.statMid, { borderColor: colors.outlineVariant }]}>
          <Text style={[S.statLbl, { color: colors.textSecondary }]}>TIMER</Text>
          <Text style={[S.statValMono, { color: colors.textPrimary }]}>
            {settings.showTimer ? formatTime(elapsed) : '--:--'}
          </Text>
        </View>
        <View style={S.statCell}>
          <Text style={[S.statLbl, { color: colors.textSecondary }]}>POINTS</Text>
          <Text style={[S.statVal, { color: colors.accent }]}>{livePoints}</Text>
        </View>
      </View>

      {/* BOARD */}
      <View style={{ alignItems: 'center', marginBottom: 8 }}>
        <Board
          cells={cells} dim={boardDim} cellSize={cellSize}
          colors={colors}
          isDark={isDark}
          selectedIdx={selectedIdx} related={related} sameNum={sameNum}
          isPaused={isPaused} showMistakes={settings.showMistakes}
          anims={anims}
          shakeAnims={shakeAnims}
          onCell={(idx) => { useStore.getState().selectCell(idx); animCell(idx); }}
        />
      </View>

      {/* ACTIONS */}
      <View style={[S.actRow, { height: H_ACTIONS }]}>
        <Btn LIcon={Eraser}     label="Erase" onPress={() => useStore.getState().eraseCell()}       disabled={isPaused} themeColors={colors} />
        <Btn LIcon={PencilLine} label="Notes" onPress={() => useStore.getState().toggleNotesMode()} disabled={isPaused} active={notesMode} themeColors={colors} />
        <Btn LIcon={Lightbulb}  label={`Hint (${remainingHints})`} onPress={() => useStore.getState().useHint()} disabled={isPaused || remainingHints === 0} themeColors={colors} />
        <Btn LIcon={RotateCcw}  label="Undo"  onPress={() => useStore.getState().undoMove()}        disabled={isPaused || noUndo} themeColors={colors} />
      </View>

      {/* NUMBER PAD — completed digits are hidden, keeping grid stable */}
      <View style={[S.numPad, { paddingHorizontal: PAD }]}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => {
          const done = completedNumbers.has(n);
          return (
            <View key={n} style={{ width: numBtnW, height: numBtnH }}>
              {!done && (
                <TouchableOpacity
                  onPress={() => useStore.getState().enterNumber(n)}
                  disabled={isPaused} activeOpacity={0.6}
                  style={[S.numBtn, { width: numBtnW, height: numBtnH, backgroundColor: colors.bgSurfaceContainerLowest, borderColor: colors.outlineVariant }]}
                >
                  <Text style={[S.numTxt, { color: colors.textPrimary }]}>{n}</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </View>

      {/* PAUSE MODAL */}
      <Modal visible={isPaused && !isCompleted} transparent animationType="fade">
        <View style={S.overlay}>
          <View style={[S.pauseCard, { backgroundColor: colors.bgSurface }]}>
            {/* Icon ring */}
            <View style={[S.pauseIconRing, { backgroundColor: colors.bgSurfaceContainerHighest }]}>
              <Pause size={32} color={colors.primary} strokeWidth={2} />
            </View>

            <Text style={[S.pauseTitle, { color: colors.textPrimary }]}>Game Paused</Text>
            <Text style={[S.pauseTime, { color: colors.textSecondary }]}>{formatTime(elapsed)}</Text>

            {/* Difficulty pill */}
            <View style={[S.pauseDiffPill, { borderColor: colors.outlineVariant }]}>
              <Text style={[S.pauseDiffTxt, { color: colors.textSecondary }]}>
                {difficulty.toUpperCase()} • {mistakeText} mistakes
              </Text>
            </View>

            <View style={S.pauseBtnStack}>
              {/* Resume */}
              <TouchableOpacity
                style={[S.pauseBtn, { backgroundColor: colors.primary }]}
                onPress={() => useStore.getState().togglePause()}
              >
                <Play size={18} color={colors.onPrimary} strokeWidth={2} />
                <Text style={[S.pauseBtnTxt, { color: colors.onPrimary }]}>Resume</Text>
              </TouchableOpacity>

              {/* Go Home */}
              <TouchableOpacity
                style={[S.pauseBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.outlineVariant }]}
                onPress={() => {
                  useStore.getState().togglePause();
                  if (navigation.canGoBack()) navigation.goBack();
                  else navigation.navigate('Home' as never);
                }}
              >
                <Home size={18} color={colors.textPrimary} strokeWidth={1.8} />
                <Text style={[S.pauseBtnTxt, { color: colors.textPrimary }]}>Go to Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* FAILURE SHEET */}
      <Modal visible={isCompleted && isFailed} transparent animationType="slide">
        <View style={S.sheetOverlay}>
          <View style={[S.sheet, { backgroundColor: colors.bgSurface, paddingBottom: insets.bottom + 24 }]}>
            <View style={[S.dragHandle, { backgroundColor: colors.outlineVariant }]} />

            {/* Red X icon */}
            <View style={[S.successIcon, { backgroundColor: '#c92a2a', marginBottom: 16 }]}>
              <Text style={S.successCheck}>✕</Text>
            </View>

            <Text style={[S.sheetTitle, { color: colors.textPrimary }]}>Puzzle Failed</Text>
            <View style={[S.diffPill, { borderColor: colors.outlineVariant }]}>
              <Text style={[S.diffPillTxt, { color: colors.textSecondary }]}>{difficulty.toUpperCase()} DIFFICULTY</Text>
            </View>

            {/* Stats */}
            <View style={S.resultRow}>
              {[
                { label: 'TIME',     value: formatTime(elapsed) },
                { label: 'MISTAKES', value: mistakeText },
                { label: 'POINTS',   value: `${livePoints}` },
              ].map(({ label, value }) => (
                <View key={label} style={[S.resultCard, { borderColor: colors.outlineVariant }]}>
                  <Text style={[S.resultLbl, { color: colors.textSecondary }]}>{label}</Text>
                  <Text style={[S.resultVal, { color: colors.textPrimary }]}>{value}</Text>
                </View>
              ))}
            </View>

            {/* Second chance remaining indicator */}
            {(secondChancesUsed < MAX_SECOND_CHANCES) && (
              <View style={S.chancePillRow}>
                {Array.from({ length: MAX_SECOND_CHANCES }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      S.chanceDot,
                      i < MAX_SECOND_CHANCES - secondChancesUsed
                        ? { backgroundColor: '#40c057' }
                        : { backgroundColor: colors.outlineVariant },
                    ]}
                  />
                ))}
                <Text style={[S.chanceTxt, { color: colors.textSecondary }]}>
                  {MAX_SECOND_CHANCES - secondChancesUsed} chance{MAX_SECOND_CHANCES - secondChancesUsed !== 1 ? 's' : ''} left
                </Text>
              </View>
            )}

            {/* Second Chance button (if available) */}
            {(secondChancesUsed < MAX_SECOND_CHANCES) ? (
              <TouchableOpacity
                style={[S.primaryBtn, { backgroundColor: '#40c057', width: '100%', marginBottom: 10 }]}
                onPress={() => useStore.getState().useSecondChance()}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <RotateCcw size={18} color="#fff" strokeWidth={2} />
                  <Text style={S.primaryBtnTxt}>Second Chance</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <View style={[S.noChanceBanner, { borderColor: colors.outlineVariant }]}>
                <Text style={[S.noChanceTxt, { color: colors.textSecondary }]}>No more second chances</Text>
              </View>
            )}

            <TouchableOpacity
              style={[S.primaryBtn, {
                backgroundColor: secondChancesUsed < MAX_SECOND_CHANCES ? colors.bgSurfaceContainerLowest : colors.primary,
                borderWidth: secondChancesUsed < MAX_SECOND_CHANCES ? 1 : 0,
                borderColor: colors.outlineVariant,
                width: '100%',
              }]}
              onPress={() => useStore.getState().startNewGame(difficulty)}
            >
              <Text style={[S.primaryBtnTxt, {
                color: secondChancesUsed < MAX_SECOND_CHANCES ? colors.textPrimary : colors.onPrimary,
              }]}>New Game</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={S.txtBtn}
              onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home' as never)}
            >
              <Text style={{ color: colors.textSecondary, fontSize: 15, fontWeight: '500' }}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* SUCCESS SHEET */}
      <Modal visible={isCompleted && !isFailed} transparent animationType="slide">
        <View style={S.sheetOverlay}>
          <View style={[S.sheet, { backgroundColor: colors.bgSurface, paddingBottom: insets.bottom + 24 }]}>
            <View style={[S.dragHandle, { backgroundColor: colors.outlineVariant }]} />
            <View style={[S.successIcon, { backgroundColor: colors.success }]}>
              <Text style={S.successCheck}>✓</Text>
            </View>
            <Text style={[S.sheetTitle, { color: colors.textPrimary }]}>Puzzle Complete</Text>
            <View style={[S.diffPill, { borderColor: colors.outlineVariant }]}>
              <Text style={[S.diffPillTxt, { color: colors.textSecondary }]}>{difficulty.toUpperCase()} DIFFICULTY</Text>
            </View>
            <View style={S.resultRow}>
              {[
                { label: 'TIME',     value: formatTime(elapsed) },
                { label: 'MISTAKES', value: mistakeText },
                { label: 'POINTS',   value: `${livePoints}` },
              ].map(({ label, value }) => (
                <View key={label} style={[S.resultCard, { borderColor: colors.outlineVariant }]}>
                  <Text style={[S.resultLbl, { color: colors.textSecondary }]}>{label}</Text>
                  <Text style={[S.resultVal, { color: colors.textPrimary }]}>{value}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={[S.primaryBtn, { backgroundColor: colors.primary, width: '100%' }]}
              onPress={() => useStore.getState().startNewGame(difficulty)}>
              <Text style={[S.primaryBtnTxt, { color: colors.onPrimary }]}>New Game</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={S.txtBtn}
              onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home' as never)}
            >
              <Text style={{ color: colors.accent, fontSize: 16, fontWeight: '500' }}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  root:         { flex: 1 },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  iconBtn:      { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }, // enlarged touch target
  diffBadge:    { paddingHorizontal: 24, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  diffBadgeTxt: { fontSize: 15, fontWeight: '600' },

  statsRow:     { flexDirection: 'row', paddingHorizontal: 20, alignItems: 'center' },
  statCell:     { flex: 1, paddingHorizontal: 4 },
  statMid:      { borderLeftWidth: 1, borderRightWidth: 1 },
  statLbl:      { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 3 },
  statVal:      { fontSize: 17, fontWeight: '700' },
  statValMono:  { fontSize: 17, fontWeight: '700', fontFamily: 'monospace' },

  // Pause modal
  pauseIconRing: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  pauseDiffPill: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, marginBottom: 20 },
  pauseDiffTxt:  { fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  pauseBtnStack: { width: '100%', gap: 10 },
  pauseBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 14 },
  pauseBtnTxt:   { fontSize: 16, fontWeight: '700' },

  boardWell: {
    padding: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  // Board outer frame – cells live inside, lines overlay on top
  boardOuter: {
    borderWidth: BOARD_OUTER,
    borderColor: '#111111',
    backgroundColor: '#ffffff',
    position: 'relative',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 5,
    elevation: 4,
  },

  actRow:   { flexDirection: 'row', paddingHorizontal: 12, alignItems: 'center' },
  actBtn:   { flex: 1, marginHorizontal: 3, paddingVertical: 8, borderRadius: 12, alignItems: 'center', gap: 5 },
  actLbl:   { fontSize: 11, fontWeight: '600', letterSpacing: 0.2 },

  numPad:   { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 },
  numBtn:   {
    borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
  numTxt:   { fontSize: 30, fontWeight: '400', includeFontPadding: false },

  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.48)', alignItems: 'center', justifyContent: 'center' },
  pauseCard:  { width: '82%', borderRadius: 24, padding: 28, alignItems: 'center', gap: 8 },
  pauseTitle: { fontSize: 22, fontWeight: '700' },
  pauseTime:  { fontSize: 30, fontFamily: 'monospace', marginBottom: 8 },

  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.48)', justifyContent: 'flex-end' },
  sheet:        { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingTop: 12, alignItems: 'center' },
  dragHandle:   { width: 40, height: 4, borderRadius: 2, marginBottom: 22 },
  successIcon:  { width: 72, height: 72, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  successCheck: { fontSize: 38, color: '#fff', fontWeight: '700', includeFontPadding: false },
  sheetTitle:   { fontSize: 28, fontWeight: '800', marginBottom: 10 },
  diffPill:     { borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 5, marginBottom: 22 },
  diffPillTxt:  { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  resultRow:    { flexDirection: 'row', gap: 10, marginBottom: 22, width: '100%' },
  resultCard:   { flex: 1, borderWidth: 1, borderRadius: 10, padding: 14, alignItems: 'center' },
  resultLbl:    { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, marginBottom: 6 },
  resultVal:    { fontSize: 20, fontWeight: '700' },

  primaryBtn:    { borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginBottom: 4 },
  primaryBtnTxt: { fontSize: 17, fontWeight: '700', color: '#fff' },
  txtBtn:        { paddingVertical: 12, alignItems: 'center' },

  chancePillRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  chanceDot:     { width: 10, height: 10, borderRadius: 5 },
  chanceTxt:     { fontSize: 12, fontWeight: '600', marginLeft: 4 },

  noChanceBanner: { width: '100%', borderWidth: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginBottom: 10 },
  noChanceTxt:    { fontSize: 14, fontWeight: '600' },
});
