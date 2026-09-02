import type { DiceRoll, ScoreBreakdown } from '../core/types';

const DOMINANCE_RATIO = 2;

export function calculateVictoryScore(
  baseScore: number,
  playerRoll: DiceRoll,
  enemyRoll: DiceRoll,
): ScoreBreakdown {
  let multiplier = 1;
  let reason = 'Clean victory';

  if (enemyRoll.value > 0 && playerRoll.value >= enemyRoll.value * DOMINANCE_RATIO) {
    multiplier = 2;
    reason = 'Dominant win (2×)';
  } else if (playerRoll.value >= enemyRoll.sides && enemyRoll.value <= 2) {
    multiplier = 1.5;
    reason = 'Strong win (1.5×)';
  }

  const total = Math.round(baseScore * multiplier);

  return { base: baseScore, multiplier, total, reason };
}

export function calculateStageBonus(stageNumber: number): number {
  return Math.round(50 * stageNumber);
}
