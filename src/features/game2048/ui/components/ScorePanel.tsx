import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Text } from 'react-native';
import {
  colors,
  spacing,
  borderRadius,
  typography,
} from '../../../../shared/theme';
import { t } from '../../../../i18n';

interface ScorePanelProps {
  score: number;
  bestScore: number;
}

const ScoreBox: React.FC<{ label: string; value: number }> = ({
  label,
  value,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prevValue = useRef(value);

  useEffect(() => {
    if (value !== prevValue.current) {
      prevValue.current = value;
      scaleAnim.setValue(1.2);
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [value, scaleAnim]);

  return (
    <View
      style={styles.scoreBox}
      accessibilityRole="text"
      accessibilityLabel={`${label}: ${value}`}
    >
      <Text style={styles.scoreLabel}>{label}</Text>
      <Animated.Text
        style={[styles.scoreValue, { transform: [{ scale: scaleAnim }] }]}
      >
        {value}
      </Animated.Text>
    </View>
  );
};

export const ScorePanel: React.FC<ScorePanelProps> = ({ score, bestScore }) => {
  return (
    <View style={styles.container}>
      <ScoreBox label={t('game.score')} value={score} />
      <ScoreBox label={t('game.best')} value={bestScore} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  scoreBox: {
    backgroundColor: colors.scoreBackground,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    minWidth: 80,
  },
  scoreLabel: {
    color: colors.scoreLabelColor,
    fontSize: typography.scoreLabel.fontSize,
    fontWeight: typography.scoreLabel.fontWeight,
    textTransform: 'uppercase',
  },
  scoreValue: {
    color: colors.white,
    fontSize: typography.scoreValue.fontSize,
    fontWeight: typography.scoreValue.fontWeight,
  },
});
