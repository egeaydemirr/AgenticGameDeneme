import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Board, GameStatus } from '../models/types';

const STORAGE_KEY = 'game2048.state.v1';

export interface PersistedGameState {
  board: Board;
  score: number;
  bestScore: number;
  moveCount: number;
  status: GameStatus;
  hasWonBefore: boolean;
  rngSeed: number;
}

const isValidBoard = (board: unknown): board is Board => {
  if (!Array.isArray(board)) {
    return false;
  }
  return board.every(
    row => Array.isArray(row) && row.every(cell => typeof cell === 'number'),
  );
};

const isPersistedGameState = (value: unknown): value is PersistedGameState => {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<PersistedGameState>;
  return (
    isValidBoard(candidate.board) &&
    typeof candidate.score === 'number' &&
    typeof candidate.bestScore === 'number' &&
    typeof candidate.moveCount === 'number' &&
    typeof candidate.status === 'string' &&
    typeof candidate.hasWonBefore === 'boolean' &&
    typeof candidate.rngSeed === 'number'
  );
};

export const loadPersistedGameState =
  async (): Promise<PersistedGameState | null> => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw === null) {
        return null;
      }

      const parsed: unknown = JSON.parse(raw);
      return isPersistedGameState(parsed) ? parsed : null;
    } catch {
      return null;
    }
  };

export const savePersistedGameState = async (
  state: PersistedGameState,
): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Best-effort persistence.
  }
};
