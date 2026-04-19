import type { RandomProvider } from '../models/types';

const RNG_MODULUS = 2147483647;
const RNG_MULTIPLIER = 48271;

const normalizeSeed = (seed: number): number => {
  const normalized = Math.abs(Math.floor(seed)) % RNG_MODULUS;
  return normalized === 0 ? 1 : normalized;
};

export const nextRandom = (seed: number): { seed: number; value: number } => {
  const normalized = normalizeSeed(seed);
  const nextSeed = (normalized * RNG_MULTIPLIER) % RNG_MODULUS;
  return {
    seed: nextSeed,
    value: (nextSeed - 1) / (RNG_MODULUS - 1),
  };
};

export const createSeededRandom = (
  seed: number,
): { random: RandomProvider; getSeed: () => number } => {
  let currentSeed = normalizeSeed(seed);
  const random: RandomProvider = () => {
    const next = nextRandom(currentSeed);
    currentSeed = next.seed;
    return next.value;
  };
  return {
    random,
    getSeed: () => currentSeed,
  };
};
