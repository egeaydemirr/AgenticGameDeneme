import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import type { GameStatus } from '../../models/types';
import {
  colors,
  spacing,
  borderRadius,
  typography,
} from '../../../../shared/theme';
import { t } from '../../../../i18n';

interface StatusOverlayProps {
  status: GameStatus;
  onRestart: () => void;
  onContinue: () => void;
}

export const StatusOverlay: React.FC<StatusOverlayProps> = ({
  status,
  onRestart,
  onContinue,
}) => {
  if (status !== 'won' && status !== 'gameOver') {
    return null;
  }

  const isWon = status === 'won';
  const title = isWon ? t('game.won') : t('game.gameOver');

  return (
    <View style={styles.overlay}>
      <View style={styles.content}>
        <Text
          style={styles.title}
          accessibilityRole="header"
          accessibilityLabel={title}
        >
          {title}
        </Text>
        <View style={styles.buttonContainer}>
          {isWon && (
            <Pressable
              style={styles.button}
              onPress={onContinue}
              accessibilityRole="button"
              accessibilityLabel={t('game.keepPlaying')}
            >
              <Text style={styles.buttonText}>{t('game.keepPlaying')}</Text>
            </Pressable>
          )}
          <Pressable
            style={styles.button}
            onPress={onRestart}
            accessibilityRole="button"
            accessibilityLabel={t('game.tryAgain')}
          >
            <Text style={styles.buttonText}>{t('game.tryAgain')}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlayBackground,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    borderRadius: borderRadius.md,
  },
  content: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  title: {
    fontSize: typography.overlayTitle.fontSize,
    fontWeight: typography.overlayTitle.fontWeight,
    color: colors.textDark,
    marginBottom: spacing.lg,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    backgroundColor: colors.buttonBackground,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  buttonText: {
    color: colors.buttonText,
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
  },
});
