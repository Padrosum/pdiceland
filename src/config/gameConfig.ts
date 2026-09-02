import type { EnemyDefinition } from '../core/types';

export const PLAYER_DICE_SIDES = 6;
export const ROUNDS_TO_WIN = 2;
export const ENEMIES_PER_STAGE = 3;
export const STARTING_HEALTH = 3;

export const ENEMIES: Record<string, EnemyDefinition> = {
  imp: {
    id: 'imp',
    name: 'Lesser Imp',
    description: 'The lowest servant of the dark.',
    diceSides: 6,
    diceBonus: 0,
    baseScore: 100,
    color: 0x8b2020,
    sprite: 'imp',
  },
  shade: {
    id: 'shade',
    name: 'Shade Demon',
    description: 'A silence that creeps closer.',
    diceSides: 6,
    diceBonus: 1,
    baseScore: 150,
    color: 0x3a2a5c,
    sprite: 'shade',
  },
  wraith: {
    id: 'wraith',
    name: 'Wraith Demon',
    description: 'Warden of the dead realm.',
    diceSides: 8,
    diceBonus: 0,
    baseScore: 200,
    color: 0x4a6a8a,
    sprite: 'brute',
  },
  hellhound: {
    id: 'hellhound',
    name: 'Hellhound',
    description: 'Hunter with flaming breath.',
    diceSides: 8,
    diceBonus: 1,
    baseScore: 250,
    color: 0xb44a10,
    sprite: 'brute',
  },
  demon: {
    id: 'demon',
    name: 'Demon',
    description: 'Emissary of the dark lord.',
    diceSides: 10,
    diceBonus: 1,
    baseScore: 350,
    color: 0x6a0a0a,
    sprite: 'brute',
  },
  archdemon: {
    id: 'archdemon',
    name: 'Archdemon',
    description: 'Lord of the ruins.',
    diceSides: 12,
    diceBonus: 2,
    baseScore: 500,
    color: 0x1a0010,
    sprite: 'brute',
  },
};

export const STAGE_ENEMY_POOLS: string[][] = [
  ['imp', 'shade', 'wraith'],
  ['shade', 'imp', 'wraith'],
  ['wraith', 'shade', 'hellhound'],
  ['hellhound', 'wraith', 'demon'],
  ['demon', 'hellhound', 'archdemon'],
];

export function getStageEnemyIds(stageNumber: number): [string, string, string] {
  const poolIndex = Math.min(stageNumber - 1, STAGE_ENEMY_POOLS.length - 1);
  const pool = STAGE_ENEMY_POOLS[poolIndex]!;
  const bonusTier = Math.floor((stageNumber - 1) / STAGE_ENEMY_POOLS.length);

  if (bonusTier === 0) {
    return [pool[0]!, pool[1]!, pool[2]!];
  }

  const escalated: string[] = pool.map((id) => {
    if (bonusTier >= 2) return 'archdemon';
    if (bonusTier >= 1 && (id === 'imp' || id === 'shade')) return 'wraith';
    return id;
  });

  return [escalated[0]!, escalated[1]!, escalated[2]!];
}

export function getStageConfig(stageNumber: number) {
  return {
    stageNumber,
    enemyIds: getStageEnemyIds(stageNumber),
    enemyBonus: Math.floor((stageNumber - 1) / 2),
    ambientIntensity: Math.max(0.15, 0.45 - stageNumber * 0.03),
    fogDensity: Math.min(0.08, 0.025 + stageNumber * 0.004),
  };
}
