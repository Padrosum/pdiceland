import type { DiceRoll } from '../core/types';
import { PLAYER_DICE_SIDES } from '../config/gameConfig';

export function rollDie(sides: number, bonus = 0): DiceRoll {
  const value = Math.floor(Math.random() * sides) + 1 + bonus;
  return { value, sides };
}

export function rollPlayerDie(): DiceRoll {
  return rollDie(PLAYER_DICE_SIDES);
}

export function rollEnemyDie(sides: number, bonus = 0): DiceRoll {
  return rollDie(sides, bonus);
}

export function compareRolls(
  player: DiceRoll,
  enemy: DiceRoll,
): 'player' | 'enemy' | 'tie' {
  if (player.value > enemy.value) return 'player';
  if (enemy.value > player.value) return 'enemy';
  return 'tie';
}
