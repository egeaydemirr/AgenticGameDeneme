import { useReducer, useCallback, useEffect, useRef } from 'react';
import type {
  Board,
  GameState,
  GameStatus,
  TileData,
  TileTransition,
} from '../models/types';
import { Direction } from '../models/types';
import {
  initializeBoard,
  applyMove,
  spawnTileWithMeta,
  hasWon,
  isGameOver,
  createSeededRandom,
  nextRandom,
} from '../engine';
import {
  buildInitialTileTransitions,
  buildTilesFromTransitions,
  resetTileIdCounter,
} from '../engine/tiles';
import {
  loadPersistedGameState,
  savePersistedGameState,
  type PersistedGameState,
} from '../services/persistence';

const INITIAL_RNG_SEED = 123456789;

type GameAction =
  | { type: 'MOVE'; direction: Direction }
  | { type: 'NEW_GAME' }
  | { type: 'CONTINUE_PLAYING' }
  | { type: 'HYDRATE'; payload: PersistedGameState }
  | { type: 'MARK_HYDRATED' };

interface InternalState {
  board: Board;
  score: number;
  bestScore: number;
  moveCount: number;
  status: GameStatus;
  hasWonBefore: boolean;
  tiles: TileData[];
  rngSeed: number;
  isHydrated: boolean;
}

const buildSpawnTransition = (
  spawned: { position: { row: number; col: number }; value: number } | null,
): TileTransition[] => {
  if (spawned === null) {
    return [];
  }
  return [
    {
      from: [],
      to: spawned.position,
      value: spawned.value,
      isMerge: false,
      isSpawn: true,
    },
  ];
};

const createInitialState = (): InternalState => {
  resetTileIdCounter();
  const seededRandom = createSeededRandom(INITIAL_RNG_SEED);
  const board = initializeBoard(seededRandom.random);
  const tiles = buildTilesFromTransitions(
    buildInitialTileTransitions(board),
    [],
  );

  return {
    board,
    score: 0,
    bestScore: 0,
    moveCount: 0,
    status: 'playing',
    hasWonBefore: false,
    tiles,
    rngSeed: seededRandom.getSeed(),
    isHydrated: false,
  };
};

const gameReducer = (
  state: InternalState,
  action: GameAction,
): InternalState => {
  switch (action.type) {
    case 'NEW_GAME': {
      resetTileIdCounter();
      const seedForGame = nextRandom(state.rngSeed).seed;
      const seededRandom = createSeededRandom(seedForGame);
      const board = initializeBoard(seededRandom.random);
      const tiles = buildTilesFromTransitions(
        buildInitialTileTransitions(board),
        [],
      );

      return {
        ...state,
        board,
        score: 0,
        moveCount: 0,
        status: 'playing',
        hasWonBefore: false,
        tiles,
        rngSeed: seededRandom.getSeed(),
      };
    }

    case 'CONTINUE_PLAYING':
      return {
        ...state,
        status: 'playing',
        hasWonBefore: true,
      };

    case 'HYDRATE': {
      resetTileIdCounter();
      const tiles = buildTilesFromTransitions(
        buildInitialTileTransitions(action.payload.board),
        [],
      );
      return {
        ...state,
        board: action.payload.board,
        score: action.payload.score,
        bestScore: action.payload.bestScore,
        moveCount: action.payload.moveCount,
        status: action.payload.status,
        hasWonBefore: action.payload.hasWonBefore,
        tiles,
        rngSeed: action.payload.rngSeed,
        isHydrated: true,
      };
    }

    case 'MARK_HYDRATED':
      return {
        ...state,
        isHydrated: true,
      };

    case 'MOVE': {
      if (state.status === 'gameOver' || state.status === 'won') {
        return state;
      }

      const moveResult = applyMove(state.board, action.direction);
      if (!moveResult.hasMoved) {
        return state;
      }

      const seededRandom = createSeededRandom(state.rngSeed);
      const spawnResult = spawnTileWithMeta(
        moveResult.board,
        seededRandom.random,
      );
      const boardAfterSpawn = spawnResult.board;
      const newScore = state.score + moveResult.scoreGain;
      const newBestScore = Math.max(newScore, state.bestScore);

      let newStatus: GameStatus = 'playing';
      if (hasWon(boardAfterSpawn) && !state.hasWonBefore) {
        newStatus = 'won';
      } else if (isGameOver(boardAfterSpawn)) {
        newStatus = 'gameOver';
      }

      const transitions = [
        ...moveResult.transitions,
        ...buildSpawnTransition(spawnResult.spawned),
      ];
      const tiles = buildTilesFromTransitions(transitions, state.tiles);

      return {
        ...state,
        board: boardAfterSpawn,
        score: newScore,
        bestScore: newBestScore,
        moveCount: state.moveCount + 1,
        status: newStatus,
        tiles,
        rngSeed: seededRandom.getSeed(),
      };
    }

    default:
      return state;
  }
};

export interface UseGameStateReturn {
  gameState: GameState;
  move: (direction: Direction) => void;
  newGame: () => void;
  continuePlaying: () => void;
}

export const useGameState = (): UseGameStateReturn => {
  const [state, dispatch] = useReducer(
    gameReducer,
    undefined,
    createInitialState,
  );
  const moveLockRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const hydrate = async (): Promise<void> => {
      const persisted = await loadPersistedGameState();
      if (!isMounted) {
        return;
      }

      if (persisted === null) {
        dispatch({ type: 'MARK_HYDRATED' });
        return;
      }

      dispatch({ type: 'HYDRATE', payload: persisted });
    };

    hydrate().catch(() => {
      if (isMounted) {
        dispatch({ type: 'MARK_HYDRATED' });
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!state.isHydrated) {
      return;
    }

    savePersistedGameState({
      board: state.board,
      score: state.score,
      bestScore: state.bestScore,
      moveCount: state.moveCount,
      status: state.status,
      hasWonBefore: state.hasWonBefore,
      rngSeed: state.rngSeed,
    }).catch(() => {
      // Best-effort persistence is handled by the service.
    });
  }, [
    state.board,
    state.score,
    state.bestScore,
    state.moveCount,
    state.status,
    state.hasWonBefore,
    state.rngSeed,
    state.isHydrated,
  ]);

  const move = useCallback((direction: Direction) => {
    if (moveLockRef.current) {
      return;
    }
    moveLockRef.current = true;
    dispatch({ type: 'MOVE', direction });
    // Release lock after a frame to allow animation to start
    requestAnimationFrame(() => {
      moveLockRef.current = false;
    });
  }, []);

  const newGame = useCallback(() => {
    dispatch({ type: 'NEW_GAME' });
  }, []);

  const continuePlaying = useCallback(() => {
    dispatch({ type: 'CONTINUE_PLAYING' });
  }, []);

  const gameState: GameState = {
    board: state.board,
    score: state.score,
    bestScore: state.bestScore,
    moveCount: state.moveCount,
    status: state.status,
    hasWonBefore: state.hasWonBefore,
    tiles: state.tiles,
  };

  return { gameState, move, newGame, continuePlaying };
};
