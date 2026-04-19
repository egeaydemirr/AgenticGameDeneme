import { mergeRowLeft, applyMove } from '../engine/moves';
import { Direction } from '../models/types';

describe('mergeRowLeft', () => {
  it('merges two adjacent equal tiles', () => {
    const { merged, scoreGain } = mergeRowLeft([2, 2, 0, 0]);
    expect(merged).toEqual([4, 0, 0, 0]);
    expect(scoreGain).toBe(4);
  });

  it('slides tiles to the left', () => {
    const { merged } = mergeRowLeft([0, 0, 2, 0]);
    expect(merged).toEqual([2, 0, 0, 0]);
  });

  it('merges only once per tile per move', () => {
    const { merged, scoreGain } = mergeRowLeft([2, 2, 2, 2]);
    expect(merged).toEqual([4, 4, 0, 0]);
    expect(scoreGain).toBe(8);
  });

  it('does not merge tiles that are not adjacent after slide', () => {
    const { merged, scoreGain } = mergeRowLeft([2, 0, 0, 2]);
    expect(merged).toEqual([4, 0, 0, 0]);
    expect(scoreGain).toBe(4);
  });

  it('handles triple with first two merging', () => {
    const { merged, scoreGain } = mergeRowLeft([2, 2, 4, 0]);
    expect(merged).toEqual([4, 4, 0, 0]);
    expect(scoreGain).toBe(4);
  });

  it('does not merge already-merged result with next', () => {
    const { merged, scoreGain } = mergeRowLeft([4, 2, 2, 0]);
    expect(merged).toEqual([4, 4, 0, 0]);
    expect(scoreGain).toBe(4);
  });

  it('handles empty row', () => {
    const { merged, scoreGain } = mergeRowLeft([0, 0, 0, 0]);
    expect(merged).toEqual([0, 0, 0, 0]);
    expect(scoreGain).toBe(0);
  });

  it('handles full row with no merges', () => {
    const { merged, scoreGain } = mergeRowLeft([2, 4, 8, 16]);
    expect(merged).toEqual([2, 4, 8, 16]);
    expect(scoreGain).toBe(0);
  });

  it('handles single tile', () => {
    const { merged } = mergeRowLeft([0, 0, 0, 8]);
    expect(merged).toEqual([8, 0, 0, 0]);
  });
});

describe('applyMove', () => {
  it('moves tiles left', () => {
    const board = [
      [0, 2, 0, 0],
      [0, 0, 4, 0],
      [0, 0, 0, 8],
      [0, 0, 0, 0],
    ];
    const { board: result, hasMoved } = applyMove(board, Direction.LEFT);
    expect(result[0]).toEqual([2, 0, 0, 0]);
    expect(result[1]).toEqual([4, 0, 0, 0]);
    expect(result[2]).toEqual([8, 0, 0, 0]);
    expect(hasMoved).toBe(true);
  });

  it('moves tiles right', () => {
    const board = [
      [2, 0, 0, 0],
      [0, 4, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const { board: result, hasMoved } = applyMove(board, Direction.RIGHT);
    expect(result[0]).toEqual([0, 0, 0, 2]);
    expect(result[1]).toEqual([0, 0, 0, 4]);
    expect(hasMoved).toBe(true);
  });

  it('moves tiles up', () => {
    const board = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [2, 0, 0, 0],
      [4, 0, 0, 0],
    ];
    const { board: result, hasMoved } = applyMove(board, Direction.UP);
    expect(result[0][0]).toBe(2);
    expect(result[1][0]).toBe(4);
    expect(result[2][0]).toBe(0);
    expect(result[3][0]).toBe(0);
    expect(hasMoved).toBe(true);
  });

  it('moves tiles down', () => {
    const board = [
      [2, 0, 0, 0],
      [4, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const { board: result, hasMoved } = applyMove(board, Direction.DOWN);
    expect(result[0][0]).toBe(0);
    expect(result[1][0]).toBe(0);
    expect(result[2][0]).toBe(2);
    expect(result[3][0]).toBe(4);
    expect(hasMoved).toBe(true);
  });

  it('merges tiles when moving left', () => {
    const board = [
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const { board: result, scoreGain } = applyMove(board, Direction.LEFT);
    expect(result[0]).toEqual([4, 0, 0, 0]);
    expect(scoreGain).toBe(4);
  });

  it('merges tiles when moving up', () => {
    const board = [
      [2, 0, 0, 0],
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const { board: result, scoreGain } = applyMove(board, Direction.UP);
    expect(result[0][0]).toBe(4);
    expect(result[1][0]).toBe(0);
    expect(scoreGain).toBe(4);
  });

  it('returns hasMoved false when no tiles can move', () => {
    const board = [
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const { hasMoved } = applyMove(board, Direction.LEFT);
    expect(hasMoved).toBe(false);
  });

  it('does not mutate the original board', () => {
    const board = [
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const original = board.map(r => [...r]);
    applyMove(board, Direction.LEFT);
    expect(board).toEqual(original);
  });

  it('handles chain scenario — single merge per tile', () => {
    const board = [
      [2, 2, 4, 4],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const { board: result, scoreGain } = applyMove(board, Direction.LEFT);
    expect(result[0]).toEqual([4, 8, 0, 0]);
    expect(scoreGain).toBe(12);
  });
});
