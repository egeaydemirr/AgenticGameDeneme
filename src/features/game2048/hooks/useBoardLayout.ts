import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { BOARD_SIZE } from '../models/constants';
import { spacing } from '../../../shared/theme';

interface BoardLayout {
  boardSize: number;
  tileSize: number;
  tileGap: number;
  boardPadding: number;
}

export const useBoardLayout = (): BoardLayout => {
  const { width } = useWindowDimensions();

  return useMemo<BoardLayout>(() => {
    const screenWidth = width;
    const boardPadding = spacing.md;
    const tileGap = spacing.sm;
    const totalGap = tileGap * (BOARD_SIZE + 1);
    const maxBoardSize = screenWidth - spacing.xl * 2;
    const boardSize = Math.min(maxBoardSize, 400);
    const tileSize = (boardSize - totalGap) / BOARD_SIZE;
    return { boardSize, tileSize, tileGap, boardPadding };
  }, [width]);
};
