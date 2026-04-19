import React from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import { Direction } from '../../models/types';
import {
  colors,
  spacing,
  borderRadius,
  typography,
} from '../../../../shared/theme';
import { t } from '../../../../i18n';

interface DirectionControlsProps {
  onMove: (direction: Direction) => void;
  disabled: boolean;
}

const DirectionButton: React.FC<{
  label: string;
  direction: Direction;
  onMove: (direction: Direction) => void;
  disabled: boolean;
}> = ({ label, direction, onMove, disabled }) => (
  <Pressable
    style={[styles.button, disabled && styles.buttonDisabled]}
    onPress={() => onMove(direction)}
    disabled={disabled}
    accessibilityRole="button"
    accessibilityLabel={label}
    accessibilityState={{ disabled }}
  >
    <Text style={styles.buttonText}>{label}</Text>
  </Pressable>
);

export const DirectionControls: React.FC<DirectionControlsProps> = ({
  onMove,
  disabled,
}) => {
  return (
    <View
      style={styles.container}
      accessibilityLabel={t('game.directionControls')}
    >
      <View style={styles.row}>
        <DirectionButton
          label={t('game.moveUp')}
          direction={Direction.UP}
          onMove={onMove}
          disabled={disabled}
        />
      </View>
      <View style={styles.row}>
        <DirectionButton
          label={t('game.moveLeft')}
          direction={Direction.LEFT}
          onMove={onMove}
          disabled={disabled}
        />
        <DirectionButton
          label={t('game.moveDown')}
          direction={Direction.DOWN}
          onMove={onMove}
          disabled={disabled}
        />
        <DirectionButton
          label={t('game.moveRight')}
          direction={Direction.RIGHT}
          onMove={onMove}
          disabled={disabled}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
    width: '100%',
    alignItems: 'center',
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    backgroundColor: colors.buttonBackground,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minWidth: 86,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.buttonText,
    fontSize: typography.button.fontSize - 2,
    fontWeight: typography.button.fontWeight,
  },
});
