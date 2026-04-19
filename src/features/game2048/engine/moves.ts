import type { Board, MoveResult, TileTransition } from '../models/types';
import { Direction } from '../models/types';
import { BOARD_SIZE } from '../models/constants';
import { cloneBoard } from './board';

/**
 * Slides and merges a single row to the left.
 * Each tile can merge only once per move.
 * Returns the new row and score gained.
 */
export const mergeRowLeft = (
  row: number[],
): { merged: number[]; scoreGain: number } => {
  const filtered = row.filter(v => v !== 0);
  const merged: number[] = [];
  let scoreGain = 0;
  let skip = false;

  for (let i = 0; i < filtered.length; i++) {
    if (skip) {
      skip = false;
      continue;
    }
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      const value = filtered[i] * 2;
      merged.push(value);
      scoreGain += value;
      skip = true;
    } else {
      merged.push(filtered[i]);
    }
  }

  while (merged.length < BOARD_SIZE) {
    merged.push(0);
  }

  return { merged, scoreGain };
};

const reverseRow = (row: number[]): number[] => [...row].reverse();

const getColumn = (board: Board, col: number): number[] =>
  board.map(r => r[col]);

const setColumn = (board: Board, col: number, column: number[]): void => {
  for (let r = 0; r < BOARD_SIZE; r++) {
    board[r][col] = column[r];
  }
};

const rowsEqual = (a: number[], b: number[]): boolean =>
  a.every((val, idx) => val === b[idx]);

interface IndexedTile {
  value: number;
  index: number;
}

interface LineTransition {
  from: number[];
  to: number;
  value: number;
  isMerge: boolean;
}

const mergeRowLeftWithTransitions = (
  row: number[],
): { merged: number[]; scoreGain: number; transitions: LineTransition[] } => {
  const filtered: IndexedTile[] = row
    .map((value, index) => ({ value, index }))
    .filter(entry => entry.value !== 0);

  const mergedValues: number[] = [];
  const transitions: LineTransition[] = [];
  let scoreGain = 0;

  let i = 0;
  while (i < filtered.length) {
    const current = filtered[i];
    const next = filtered[i + 1];

    if (current.value === next?.value) {
      const value = current.value * 2;
      scoreGain += value;
      mergedValues.push(value);
      transitions.push({
        from: [current.index, next.index],
        to: mergedValues.length - 1,
        value,
        isMerge: true,
      });
      i += 2;
      continue;
    }

    mergedValues.push(current.value);
    transitions.push({
      from: [current.index],
      to: mergedValues.length - 1,
      value: current.value,
      isMerge: false,
    });
    i += 1;
  }

  while (mergedValues.length < BOARD_SIZE) {
    mergedValues.push(0);
  }

  return { merged: mergedValues, scoreGain, transitions };
};

const processLine = (
  line: number[],
  reverse: boolean,
): { result: number[]; scoreGain: number; transitions: LineTransition[] } => {
  const input = reverse ? reverseRow(line) : line;
  const { merged, scoreGain, transitions } = mergeRowLeftWithTransitions(input);
  const result = reverse ? reverseRow(merged) : merged;

  const mapIndex = (index: number): number =>
    reverse ? BOARD_SIZE - 1 - index : index;

  return {
    result,
    scoreGain,
    transitions: transitions.map(transition => ({
      ...transition,
      from: transition.from.map(mapIndex),
      to: mapIndex(transition.to),
    })),
  };
};

const applyToRows = (
  board: Board,
  reverse: boolean,
): { scoreGain: number; hasMoved: boolean; transitions: TileTransition[] } => {
  let scoreGain = 0;
  let hasMoved = false;
  const transitions: TileTransition[] = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    const {
      result,
      scoreGain: gain,
      transitions: rowTransitions,
    } = processLine(board[r], reverse);
    if (!rowsEqual(board[r], result)) {
      hasMoved = true;
    }

    transitions.push(
      ...rowTransitions.map(transition => ({
        from: transition.from.map(col => ({ row: r, col })),
        to: { row: r, col: transition.to },
        value: transition.value,
        isMerge: transition.isMerge,
        isSpawn: false,
      })),
    );

    board[r] = result;
    scoreGain += gain;
  }
  return { scoreGain, hasMoved, transitions };
};

const applyToColumns = (
  board: Board,
  reverse: boolean,
): { scoreGain: number; hasMoved: boolean; transitions: TileTransition[] } => {
  let scoreGain = 0;
  let hasMoved = false;
  const transitions: TileTransition[] = [];

  for (let c = 0; c < BOARD_SIZE; c++) {
    const column = getColumn(board, c);
    const {
      result,
      scoreGain: gain,
      transitions: colTransitions,
    } = processLine(column, reverse);
    if (!rowsEqual(column, result)) {
      hasMoved = true;
    }

    transitions.push(
      ...colTransitions.map(transition => ({
        from: transition.from.map(row => ({ row, col: c })),
        to: { row: transition.to, col: c },
        value: transition.value,
        isMerge: transition.isMerge,
        isSpawn: false,
      })),
    );

    setColumn(board, c, result);
    scoreGain += gain;
  }
  return { scoreGain, hasMoved, transitions };
};

export const applyMove = (board: Board, direction: Direction): MoveResult => {
  const newBoard = cloneBoard(board);

  const directionHandlers: Record<
    Direction,
    (b: Board) => {
      scoreGain: number;
      hasMoved: boolean;
      transitions: TileTransition[];
    }
  > = {
    [Direction.LEFT]: b => applyToRows(b, false),
    [Direction.RIGHT]: b => applyToRows(b, true),
    [Direction.UP]: b => applyToColumns(b, false),
    [Direction.DOWN]: b => applyToColumns(b, true),
  };

  const { scoreGain, hasMoved, transitions } =
    directionHandlers[direction](newBoard);
  return {
    board: newBoard,
    scoreGain,
    hasMoved,
    transitions: hasMoved ? transitions : [],
  };
};
