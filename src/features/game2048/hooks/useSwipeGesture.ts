import { useRef } from 'react';
import { PanResponder } from 'react-native';
import type {
  GestureResponderEvent,
  PanResponderGestureState,
  PanResponderInstance,
} from 'react-native';
import { Direction } from '../models/types';
import { SWIPE_THRESHOLD, SWIPE_VELOCITY_THRESHOLD } from '../models/constants';

interface UseSwipeGestureOptions {
  onSwipe: (direction: Direction) => void;
  enabled?: boolean;
}

interface UseSwipeGestureReturn {
  panResponder: PanResponderInstance;
}

const resolveDirection = (dx: number, dy: number): Direction | null => {
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  if (absDx < SWIPE_THRESHOLD && absDy < SWIPE_THRESHOLD) {
    return null;
  }

  if (absDx > absDy) {
    return dx > 0 ? Direction.RIGHT : Direction.LEFT;
  }
  return dy > 0 ? Direction.DOWN : Direction.UP;
};

export const useSwipeGesture = ({
  onSwipe,
  enabled = true,
}: UseSwipeGestureOptions): UseSwipeGestureReturn => {
  const onSwipeRef = useRef(onSwipe);
  onSwipeRef.current = onSwipe;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => enabled,
      onMoveShouldSetPanResponder: (
        _evt: GestureResponderEvent,
        gestureState: PanResponderGestureState,
      ) => {
        if (!enabled) {
          return false;
        }
        const { dx, dy } = gestureState;
        return Math.abs(dx) > SWIPE_THRESHOLD || Math.abs(dy) > SWIPE_THRESHOLD;
      },
      onPanResponderRelease: (
        _evt: GestureResponderEvent,
        gestureState: PanResponderGestureState,
      ) => {
        const { dx, dy, vx, vy } = gestureState;
        const velocity = Math.hypot(vx, vy);

        if (
          velocity < SWIPE_VELOCITY_THRESHOLD &&
          Math.abs(dx) < SWIPE_THRESHOLD &&
          Math.abs(dy) < SWIPE_THRESHOLD
        ) {
          return;
        }

        const direction = resolveDirection(dx, dy);
        if (direction !== null) {
          onSwipeRef.current(direction);
        }
      },
    }),
  ).current;

  return { panResponder };
};
