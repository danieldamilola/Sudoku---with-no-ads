import { Difficulty, SudokuCell } from '../types';

export class SudokuGenerator {
  static generatePuzzle(difficulty: Difficulty): { cells: SudokuCell[]; solution: number[] } {
    const board = this.generateCompleteBoard();
    // Capture the solution before removing cells
    const solution: number[] = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        solution.push(board[r][c] as number);
      }
    }
    const cellsToRemove = 81 - this.getGivenCells(difficulty);
    this.removeCells(board, cellsToRemove);
    return { cells: this.convertToCells(board), solution };
  }

  private static generateCompleteBoard(): (number | null)[][] {
    const board: (number | null)[][] = Array(9).fill(null).map(() => Array(9).fill(null));
    this.fillBoard(board);
    return board;
  }

  private static fillBoard(board: (number | null)[][]): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === null) {
          const numbers = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
          
          for (const num of numbers) {
            if (this.isValidPlacement(board, row, col, num)) {
              board[row][col] = num;
              
              if (this.fillBoard(board)) {
                return true;
              }
              
              board[row][col] = null;
            }
          }
          
          return false;
        }
      }
    }
    return true;
  }

  private static isValidPlacement(board: (number | null)[][], row: number, col: number, num: number): boolean {
    for (let c = 0; c < 9; c++) {
      if (board[row][c] === num) return false;
    }

    for (let r = 0; r < 9; r++) {
      if (board[r][col] === num) return false;
    }

    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if (board[r][c] === num) return false;
      }
    }

    return true;
  }

  private static removeCells(board: (number | null)[][], count: number): void {
    let removed = 0;
    const rowRemoved = Array(9).fill(0);
    const colRemoved = Array(9).fill(0);
    const baseRowQuota = Math.floor(count / 9);
    const extraRows = count % 9;
    const shuffledRows = this.shuffleArray([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    const rowQuotas = Array(9).fill(baseRowQuota);
    const colLimit = Math.ceil(count / 9) + 1;

    for (let i = 0; i < extraRows; i++) {
      rowQuotas[shuffledRows[i]] += 1;
    }

    for (const row of shuffledRows) {
      const cols = this.shuffleArray([0, 1, 2, 3, 4, 5, 6, 7, 8]);

      for (const col of cols) {
        if (removed >= count || rowRemoved[row] >= rowQuotas[row]) break;
        if (colRemoved[col] >= colLimit || board[row][col] === null) continue;

        board[row][col] = null;
        rowRemoved[row] += 1;
        colRemoved[col] += 1;
        removed += 1;
      }
    }

    if (removed >= count) return;

    const positions: [number, number][] = [];
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        positions.push([row, col]);
      }
    }

    for (const [row, col] of this.shuffleArray(positions)) {
      if (removed >= count) break;
      if (board[row][col] !== null) {
        board[row][col] = null;
        removed++;
      }
    }
  }

  private static convertToCells(board: (number | null)[][]): SudokuCell[] {
    const cells: SudokuCell[] = [];
    
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const value = board[row][col];
        cells.push({
          row,
          col,
          value,
          isGiven: value !== null,
          notes: null,
          isError: false,
        });
      }
    }
    
    return cells;
  }

  private static shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  private static getGivenCells(difficulty: Difficulty): number {
    switch (difficulty) {
      case Difficulty.Easy: return 40;
      case Difficulty.Medium: return 32;
      case Difficulty.Hard: return 26;
      case Difficulty.Expert: return 20;
    }
  }
}

export class SudokuValidator {
  static isValidPlacement(cells: SudokuCell[], row: number, col: number, value: number): boolean {
    for (let c = 0; c < 9; c++) {
      const cell = cells[row * 9 + c];
      if (cell.value === value && cell.col !== col) return false;
    }

    for (let r = 0; r < 9; r++) {
      const cell = cells[r * 9 + col];
      if (cell.value === value && cell.row !== row) return false;
    }

    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        const cell = cells[r * 9 + c];
        if (cell.value === value && (cell.row !== row || cell.col !== col)) return false;
      }
    }

    return true;
  }

  static getRelatedCellsIndices(row: number, col: number): number[] {
    const indices = new Set<number>();

    for (let c = 0; c < 9; c++) indices.add(row * 9 + c);
    for (let r = 0; r < 9; r++) indices.add(r * 9 + col);

    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        indices.add(r * 9 + c);
      }
    }

    return Array.from(indices);
  }

  static getSameNumberCells(cells: SudokuCell[], value: number): number[] {
    return cells
      .filter((cell) => cell.value === value)
      .map((cell) => cell.row * 9 + cell.col);
  }

  static isBoardComplete(cells: SudokuCell[]): boolean {
    if (cells.some((cell) => cell.value === null)) return false;
    
    for (let i = 0; i < 9; i++) {
      if (!this.isRowComplete(cells, i) || !this.isColComplete(cells, i)) return false;
    }
    
    for (let br = 0; br < 3; br++) {
      for (let bc = 0; bc < 3; bc++) {
        if (!this.isBoxComplete(cells, br, bc)) return false;
      }
    }
    
    return true;
  }

  private static isRowComplete(cells: SudokuCell[], row: number): boolean {
    const rowCells = cells.filter((cell) => cell.row === row);
    if (rowCells.some((cell) => cell.value === null)) return false;
    const values = new Set(rowCells.map((cell) => cell.value!));
    return values.size === 9;
  }

  private static isColComplete(cells: SudokuCell[], col: number): boolean {
    const colCells = cells.filter((cell) => cell.col === col);
    if (colCells.some((cell) => cell.value === null)) return false;
    const values = new Set(colCells.map((cell) => cell.value!));
    return values.size === 9;
  }

  private static isBoxComplete(cells: SudokuCell[], boxRow: number, boxCol: number): boolean {
    const startRow = boxRow * 3;
    const startCol = boxCol * 3;
    const boxCells: SudokuCell[] = [];
    
    for (let r = startRow; r < startRow + 3; r++) {
      for (let c = startCol; c < startCol + 3; c++) {
        boxCells.push(cells[r * 9 + c]);
      }
    }
    
    if (boxCells.some((cell) => cell.value === null)) return false;
    const values = new Set(boxCells.map((cell) => cell.value!));
    return values.size === 9;
  }

  static getCandidates(cells: SudokuCell[], row: number, col: number): number[] {
    const candidates: number[] = [];
    for (let num = 1; num <= 9; num++) {
      if (this.isValidPlacement(cells, row, col, num)) candidates.push(num);
    }
    return candidates;
  }
}
