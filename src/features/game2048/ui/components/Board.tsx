import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { TileData } from '../../models/types';
import { BOARD_SIZE } from '../../models/constants';
import { Tile } from './Tile';
import { colors, borderRadius } from '../../../../shared/theme';

interface BoardProps {
  tiles: TileData[];
  boardSize: number;
  tileSize: number;
  tileGap: number;
}

const renderCellBackgrounds = (
  tileSize: number,
  tileGap: number,
): React.ReactNode[] => {
  const cells: React.ReactNode[] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      cells.push(
        <View
          key={`cell-${row}-${col}`}
          style={[
            styles.cell,
            {
              width: tileSize,
              height: tileSize,
              left: tileGap + col * (tileSize + tileGap),
              top: tileGap + row * (tileSize + tileGap),
              borderRadius: borderRadius.md,
            },
          ]}
        />,
      );
    }
  }
  return cells;
};

export const Board: React.FC<BoardProps> = ({
  tiles,
  boardSize,
  tileSize,
  tileGap,
}) => {
  return (
    <View
      style={[
        styles.board,
        {
          width: boardSize,
          height: boardSize,
          borderRadius: borderRadius.md,
        },
      ]}
      accessible={true}
      accessibilityLabel="Game board"
    >
      {renderCellBackgrounds(tileSize, tileGap)}
      {tiles.map(tile => (
        <Tile key={tile.id} tile={tile} tileSize={tileSize} tileGap={tileGap} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  board: {
    backgroundColor: colors.boardBackground,
    position: 'relative',
    overflow: 'hidden',
  },
  cell: {
    position: 'absolute',
    backgroundColor: colors.cellBackground,
  },
});
