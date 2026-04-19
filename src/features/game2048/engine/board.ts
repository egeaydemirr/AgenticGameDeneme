import type { Board, Position, RandomProvider } from '../models/types';
import {
  BOARD_SIZE,
  INITIAL_TILE_COUNT,
  SPAWN_PROBABILITY_TWO,
} from '../models/constants';

export interface SpawnTileResult {
  board: Board;
  spawned: {
    position: Position;
    value: number;
  } | null;
}

export const createEmptyBoard = (): Board =>
  Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => 0),
  );

export const cloneBoard = (board: Board): Board => board.map(row => [...row]);

export const getEmptyCells = (board: Board): Position[] => {
  const cells: Position[] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === 0) {
        cells.push({ row, col });
      }
    }
  }
  return cells;
};

export const spawnTile = (
  board: Board,
  random: RandomProvider = Math.random,
): Board => {
  return spawnTileWithMeta(board, random).board;
};

export const spawnTileWithMeta = (
  board: Board,
  random: RandomProvider = Math.random,
): SpawnTileResult => {
  const emptyCells = getEmptyCells(board);
  if (emptyCells.length === 0) {
    return { board, spawned: null };
  }
  const newBoard = cloneBoard(board);
  const cell = emptyCells[Math.floor(random() * emptyCells.length)];
  const value = random() < SPAWN_PROBABILITY_TWO ? 2 : 4;
  newBoard[cell.row][cell.col] = value;

  return {
    board: newBoard,
    spawned: {
      position: cell,
      value,
    },
  };
};

export const initializeBoard = (
  random: RandomProvider = Math.random,
): Board => {
  let board = createEmptyBoard();
  for (let i = 0; i < INITIAL_TILE_COUNT; i++) {
    board = spawnTile(board, random);
  }
  return board;
};
