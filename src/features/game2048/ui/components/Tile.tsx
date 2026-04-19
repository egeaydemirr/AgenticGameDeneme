import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import type { TileData } from '../../models/types';
import {
  TILE_COLORS,
  SUPER_TILE_COLOR,
  ANIMATION_DURATION_POP,
  ANIMATION_DURATION_APPEAR,
} from '../../models/constants';
import { borderRadius } from '../../../../shared/theme';

interface TileProps {
  tile: TileData;
  tileSize: number;
  tileGap: number;
}

const getTileColors = (value: number): { bg: string; text: string } => {
  if (value > 2048) {
    return SUPER_TILE_COLOR;
  }
  return TILE_COLORS[value] ?? TILE_COLORS[0];
};

const getFontSize = (value: number, tileSize: number): number => {
  const digits = String(value).length;
  if (digits <= 2) {
    return tileSize * 0.4;
  }
  if (digits === 3) {
    return tileSize * 0.32;
  }
  return tileSize * 0.24;
};

export const Tile: React.FC<TileProps> = ({ tile, tileSize, tileGap }) => {
  const moveAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const scaleAnim = useRef(new Animated.Value(tile.isNew ? 0 : 1)).current;
  const mergeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (tile.previousCol === null || tile.previousRow === null) {
      return;
    }

    const offsetX = (tile.previousCol - tile.col) * (tileSize + tileGap);
    const offsetY = (tile.previousRow - tile.row) * (tileSize + tileGap);

    moveAnim.setValue({ x: offsetX, y: offsetY });
    Animated.timing(moveAnim, {
      toValue: { x: 0, y: 0 },
      duration: ANIMATION_DURATION_POP,
      useNativeDriver: true,
    }).start();
  }, [
    tile.col,
    tile.row,
    tile.previousCol,
    tile.previousRow,
    tileSize,
    tileGap,
    moveAnim,
  ]);

  useEffect(() => {
    if (tile.isNew) {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: ANIMATION_DURATION_APPEAR,
        useNativeDriver: true,
      }).start();
    }
  }, [tile.isNew, scaleAnim]);

  useEffect(() => {
    if (tile.isMerged) {
      mergeAnim.setValue(0.8);
      Animated.sequence([
        Animated.timing(mergeAnim, {
          toValue: 1.15,
          duration: ANIMATION_DURATION_POP * 0.6,
          useNativeDriver: true,
        }),
        Animated.timing(mergeAnim, {
          toValue: 1,
          duration: ANIMATION_DURATION_POP * 0.4,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [tile.isMerged, tile.value, mergeAnim]);

  const { bg, text: textColor } = getTileColors(tile.value);
  const fontSize = getFontSize(tile.value, tileSize);

  const left = tileGap + tile.col * (tileSize + tileGap);
  const top = tileGap + tile.row * (tileSize + tileGap);

  const combinedScale = Animated.multiply(scaleAnim, mergeAnim);

  return (
    <Animated.View
      style={[
        styles.tile,
        {
          width: tileSize,
          height: tileSize,
          left,
          top,
          backgroundColor: bg,
          borderRadius: borderRadius.md,
          transform: [
            { translateX: moveAnim.x },
            { translateY: moveAnim.y },
            { scale: combinedScale },
          ],
        },
      ]}
      accessibilityRole="text"
      accessibilityLabel={`Tile ${tile.value}`}
    >
      <Text
        style={[
          styles.tileText,
          {
            color: textColor,
            fontSize,
          },
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {tile.value}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  tile: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileText: {
    fontWeight: '700',
    textAlign: 'center',
  },
});
