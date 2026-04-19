import {
  createEmptyBoard,
  cloneBoard,
  getEmptyCells,
  spawnTile,
  initializeBoard,
} from '../engine/board';
import { BOARD_SIZE, INITIAL_TILE_COUNT } from '../models/constants';

describe('board', () => {
  describe('createEmptyBoard', () => {
    it('creates a 4x4 board of zeros', () => {
      const board = createEmptyBoard();
      expect(board).toHaveLength(BOARD_SIZE);
      for (const row of board) {
        expect(row).toHaveLength(BOARD_SIZE);
        expect(row.every(v => v === 0)).toBe(true);
      }
    });
  });

  describe('cloneBoard', () => {
    it('creates a deep copy', () => {
      const board = createEmptyBoard();
      board[0][0] = 2;
      const cloned = cloneBoard(board);
      expect(cloned[0][0]).toBe(2);
      cloned[0][0] = 4;
      expect(board[0][0]).toBe(2);
    });
  });

  describe('getEmptyCells', () => {
    it('returns all 16 cells for empty board', () => {
      const board = createEmptyBoard();
      const cells = getEmptyCells(board);
      expect(cells).toHaveLength(BOARD_SIZE * BOARD_SIZE);
    });

    it('returns correct count when cells are filled', () => {
      const board = createEmptyBoard();
      board[0][0] = 2;
      board[1][1] = 4;
      const cells = getEmptyCells(board);
      expect(cells).toHaveLength(BOARD_SIZE * BOARD_SIZE - 2);
    });

    it('returns empty array for full board', () => {
      const board = Array.from({ length: BOARD_SIZE }, () =>
        Array.from({ length: BOARD_SIZE }, () => 2),
      );
      const cells = getEmptyCells(board);
      expect(cells).toHaveLength(0);
    });
  });

  describe('spawnTile', () => {
    it('spawns a 2 when random < 0.9', () => {
      const board = createEmptyBoard();
      const random = jest
        .fn()
        .mockReturnValueOnce(0) // cell selection
        .mockReturnValueOnce(0.5); // value: < 0.9 => 2
      const result = spawnTile(board, random);
      const nonZero = result.flat().filter(v => v !== 0);
      expect(nonZero).toHaveLength(1);
      expect(nonZero[0]).toBe(2);
    });

    it('spawns a 4 when random >= 0.9', () => {
      const board = createEmptyBoard();
      const random = jest.fn().mockReturnValueOnce(0).mockReturnValueOnce(0.95);
      const result = spawnTile(board, random);
      const nonZero = result.flat().filter(v => v !== 0);
      expect(nonZero).toHaveLength(1);
      expect(nonZero[0]).toBe(4);
    });

    it('does not modify original board', () => {
      const board = createEmptyBoard();
      spawnTile(board);
      expect(board.flat().every(v => v === 0)).toBe(true);
    });

    it('returns same board if no empty cells', () => {
      const board = Array.from({ length: BOARD_SIZE }, () =>
        Array.from({ length: BOARD_SIZE }, () => 2),
      );
      const result = spawnTile(board);
      expect(result).toBe(board);
    });
  });

  describe('initializeBoard', () => {
    it('creates a board with 2 initial tiles', () => {
      const board = initializeBoard();
      const nonZero = board.flat().filter(v => v !== 0);
      expect(nonZero).toHaveLength(INITIAL_TILE_COUNT);
    });

    it('is deterministic with seeded random', () => {
      let seed = 42;
      const seededRandom = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };

      seed = 42;
      const board1 = initializeBoard(seededRandom);
      seed = 42;
      const board2 = initializeBoard(seededRandom);
      expect(board1).toEqual(board2);
    });
  });
});
