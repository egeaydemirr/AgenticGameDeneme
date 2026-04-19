import {
  hasWon,
  isGameOver,
  getMaxTile,
  getAvailableMoves,
  canMove,
} from '../engine/gameStatus';
import { Direction } from '../models/types';
import type { Board } from '../models/types';

describe('gameStatus', () => {
  describe('getMaxTile', () => {
    it('returns the highest value on the board', () => {
      const board: Board = [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, 2, 4],
        [8, 16, 32, 64],
      ];
      expect(getMaxTile(board)).toBe(1024);
    });

    it('returns 0 for empty board', () => {
      const board: Board = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
      expect(getMaxTile(board)).toBe(0);
    });
  });

  describe('hasWon', () => {
    it('returns true when 2048 tile exists', () => {
      const board: Board = [
        [2048, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
      expect(hasWon(board)).toBe(true);
    });

    it('returns true when tile exceeds 2048', () => {
      const board: Board = [
        [4096, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
      expect(hasWon(board)).toBe(true);
    });

    it('returns false when max is less than 2048', () => {
      const board: Board = [
        [1024, 512, 256, 128],
        [64, 32, 16, 8],
        [4, 2, 0, 0],
        [0, 0, 0, 0],
      ];
      expect(hasWon(board)).toBe(false);
    });
  });

  describe('isGameOver', () => {
    it('returns true for a full board with no possible merges', () => {
      const board: Board = [
        [2, 4, 8, 16],
        [16, 8, 4, 2],
        [2, 4, 8, 16],
        [16, 8, 4, 2],
      ];
      expect(isGameOver(board)).toBe(true);
    });

    it('returns false when there are empty cells', () => {
      const board: Board = [
        [2, 4, 8, 16],
        [16, 8, 4, 2],
        [2, 4, 8, 16],
        [16, 8, 4, 0],
      ];
      expect(isGameOver(board)).toBe(false);
    });

    it('returns false when adjacent tiles can merge horizontally', () => {
      const board: Board = [
        [2, 2, 8, 16],
        [16, 8, 4, 2],
        [2, 4, 8, 16],
        [16, 8, 4, 2],
      ];
      expect(isGameOver(board)).toBe(false);
    });

    it('returns false when adjacent tiles can merge vertically', () => {
      const board: Board = [
        [2, 4, 8, 16],
        [2, 8, 4, 2],
        [4, 16, 8, 16],
        [16, 8, 4, 2],
      ];
      expect(isGameOver(board)).toBe(false);
    });
  });

  describe('canMove', () => {
    it('returns true when move is valid', () => {
      const board: Board = [
        [0, 2, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
      expect(canMove(board, Direction.LEFT)).toBe(true);
    });

    it('returns false when move would not change board', () => {
      const board: Board = [
        [2, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
      expect(canMove(board, Direction.LEFT)).toBe(false);
    });
  });

  describe('getAvailableMoves', () => {
    it('returns all 4 directions for a board with space', () => {
      const board: Board = [
        [0, 2, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
      const moves = getAvailableMoves(board);
      expect(moves).toContain(Direction.LEFT);
      expect(moves).toContain(Direction.RIGHT);
      expect(moves).toContain(Direction.DOWN);
    });

    it('returns empty array for game over board', () => {
      const board: Board = [
        [2, 4, 8, 16],
        [16, 8, 4, 2],
        [2, 4, 8, 16],
        [16, 8, 4, 2],
      ];
      const moves = getAvailableMoves(board);
      expect(moves).toHaveLength(0);
    });
  });
});
