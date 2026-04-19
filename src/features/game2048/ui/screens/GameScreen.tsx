import React from 'react';
import { StyleSheet, View, Text, Pressable, StatusBar } from 'react-native';
import { useGameState, useSwipeGesture, useBoardLayout } from '../../hooks';
import { Board } from '../components/Board';
import { DirectionControls } from '../components/DirectionControls';
import { ScorePanel } from '../components/ScorePanel';
import { StatusOverlay } from '../components/StatusOverlay';
import {
  colors,
  spacing,
  typography,
  borderRadius,
} from '../../../../shared/theme';
import { t } from '../../../../i18n';

export const GameScreen: React.FC = () => {
  const { gameState, move, newGame, continuePlaying } = useGameState();
  const { boardSize, tileSize, tileGap } = useBoardLayout();

  const isActive = gameState.status === 'playing';
  const { panResponder } = useSwipeGesture({
    onSwipe: move,
    enabled: isActive,
  });

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title} accessibilityRole="header">
              {t('game.title')}
            </Text>
            <ScorePanel
              score={gameState.score}
              bestScore={gameState.bestScore}
            />
          </View>

          <View style={styles.subtitleRow}>
            <Text style={styles.subtitle}>{t('game.subtitle')}</Text>
            <Pressable
              style={styles.newGameButton}
              onPress={newGame}
              accessibilityRole="button"
              accessibilityLabel={t('game.newGame')}
            >
              <Text style={styles.newGameText}>{t('game.newGame')}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.boardWrapper} {...panResponder.panHandlers}>
          <Board
            tiles={gameState.tiles}
            boardSize={boardSize}
            tileSize={tileSize}
            tileGap={tileGap}
          />
          <StatusOverlay
            status={gameState.status}
            onRestart={newGame}
            onContinue={continuePlaying}
          />
        </View>

        <DirectionControls onMove={move} disabled={!isActive} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  header: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.title.fontSize,
    fontWeight: typography.title.fontWeight,
    color: colors.textDark,
  },
  subtitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: typography.subtitle.fontSize - 4,
    color: colors.textDark,
    flex: 1,
  },
  newGameButton: {
    backgroundColor: colors.buttonBackground,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  newGameText: {
    color: colors.buttonText,
    fontSize: typography.button.fontSize - 2,
    fontWeight: typography.button.fontWeight,
  },
  boardWrapper: {
    position: 'relative',
  },
});
