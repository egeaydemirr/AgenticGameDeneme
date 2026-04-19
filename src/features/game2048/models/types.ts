export enum Direction {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
}

export type GameStatus = 'idle' | 'playing' | 'won' | 'gameOver';

export type Board = number[][];

export interface Position {
  row: number;
  col: number;
}

export interface TileData {
  id: string;
  value: number;
  row: number;
  col: number;
  isNew: boolean;
  isMerged: boolean;
  previousRow: number | null;
  previousCol: number | null;
}

export interface TileTransition {
  from: Position[];
  to: Position;
  value: number;
  isMerge: boolean;
  isSpawn: boolean;
}

export interface MoveResult {
  board: Board;
  scoreGain: number;
  hasMoved: boolean;
  transitions: TileTransition[];
}

export interface GameState {
  board: Board;
  score: number;
  bestScore: number;
  moveCount: number;
  status: GameStatus;
  hasWonBefore: boolean;
  tiles: TileData[];
}

export type RandomProvider = () => number;
