import type {
  Board,
  Position,
  TileData,
  TileTransition,
} from '../models/types';
import { BOARD_SIZE } from '../models/constants';

let nextTileId = 0;

export const resetTileIdCounter = (): void => {
  nextTileId = 0;
};

export const generateTileId = (): string => {
  nextTileId += 1;
  return `tile-${nextTileId}`;
};

const positionKey = (position: Position): string =>
  `${position.row}:${position.col}`;

const sortByGridOrder = (tiles: TileData[]): TileData[] =>
  [...tiles].sort((a, b) => {
    if (a.row === b.row) {
      return a.col - b.col;
    }
    return a.row - b.row;
  });

export const buildInitialTileTransitions = (board: Board): TileTransition[] => {
  const transitions: TileTransition[] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const value = board[row][col];
      if (value === 0) {
        continue;
      }
      transitions.push({
        from: [],
        to: { row, col },
        value,
        isMerge: false,
        isSpawn: true,
      });
    }
  }
  return transitions;
};

export const buildTilesFromTransitions = (
  transitions: TileTransition[],
  previousTiles: TileData[],
): TileData[] => {
  const previousTileByPosition = new Map<string, TileData>(
    previousTiles.map(tile => [
      positionKey({ row: tile.row, col: tile.col }),
      tile,
    ]),
  );

  const tiles: TileData[] = [];

  for (const transition of transitions) {
    const previousPosition = transition.from[0] ?? null;

    if (transition.isSpawn || transition.from.length === 0) {
      tiles.push({
        id: generateTileId(),
        value: transition.value,
        row: transition.to.row,
        col: transition.to.col,
        isNew: true,
        isMerged: false,
        previousRow: null,
        previousCol: null,
      });
      continue;
    }

    if (transition.isMerge && transition.from.length > 1) {
      tiles.push({
        id: generateTileId(),
        value: transition.value,
        row: transition.to.row,
        col: transition.to.col,
        isNew: false,
        isMerged: true,
        previousRow: previousPosition?.row ?? null,
        previousCol: previousPosition?.col ?? null,
      });
      continue;
    }

    const previousTile = previousPosition
      ? previousTileByPosition.get(positionKey(previousPosition))
      : undefined;

    tiles.push({
      id: previousTile?.id ?? generateTileId(),
      value: transition.value,
      row: transition.to.row,
      col: transition.to.col,
      isNew: false,
      isMerged: false,
      previousRow: previousPosition?.row ?? null,
      previousCol: previousPosition?.col ?? null,
    });
  }

  return sortByGridOrder(tiles);
};
