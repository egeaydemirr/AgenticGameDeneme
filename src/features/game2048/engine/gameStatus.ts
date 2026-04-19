import type { Board } from '../models/types';
import { Direction } from '../models/types';
import { BOARD_SIZE, WINNING_TILE } from '../models/constants';
import { applyMove } from './moves';

export const getMaxTile = (board: Board): number => {
  let max = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] > max) {
        max = board[r][c];
      }
    }
  }
  return max;
};

export const hasWon = (board: Board): boolean =>
  getMaxTile(board) >= WINNING_TILE;

export const canMove = (board: Board, direction: Direction): boolean => {
  const { hasMoved } = applyMove(board, direction);
  return hasMoved;
};

export const getAvailableMoves = (board: Board): Direction[] =>
  [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT].filter(dir =>
    canMove(board, dir),
  );

export const isGameOver = (board: Board): boolean =>
  getAvailableMoves(board).length === 0;
