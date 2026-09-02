import type { PlayerState } from '../core/types';
import {
  ENEMIES,
  ENEMIES_PER_STAGE,
  STARTING_HEALTH,
  getStageConfig,
} from '../config/gameConfig';

export function createPlayerState(): PlayerState {
  return {
    health: STARTING_HEALTH,
    maxHealth: STARTING_HEALTH,
    score: 0,
    stageNumber: 1,
    enemyIndex: 0,
  };
}

export function getCurrentEnemyId(player: PlayerState): string {
  const stage = getStageConfig(player.stageNumber);
  return stage.enemyIds[player.enemyIndex]!;
}

export function getCurrentEnemy(player: PlayerState) {
  const id = getCurrentEnemyId(player);
  return ENEMIES[id] ?? ENEMIES.imp!;
}

export function isStageComplete(player: PlayerState): boolean {
  return player.enemyIndex >= ENEMIES_PER_STAGE;
}

export function advanceEnemy(player: PlayerState): PlayerState {
  return { ...player, enemyIndex: player.enemyIndex + 1 };
}

export function advanceStage(player: PlayerState): PlayerState {
  return {
    ...player,
    stageNumber: player.stageNumber + 1,
    enemyIndex: 0,
  };
}

export function damagePlayer(player: PlayerState, amount = 1): PlayerState {
  return { ...player, health: Math.max(0, player.health - amount) };
}

export function addScore(player: PlayerState, amount: number): PlayerState {
  return { ...player, score: player.score + amount };
}

export function isPlayerDead(player: PlayerState): boolean {
  return player.health <= 0;
}

export function getStageBonus(player: PlayerState): number {
  return getStageConfig(player.stageNumber).enemyBonus;
}
