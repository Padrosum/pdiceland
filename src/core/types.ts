import type { DemonSpriteId } from '../assets/demons';

export type GamePhase =
  | 'MainMenu'
  | 'Tutorial'
  | 'Playing'
  | 'DiceRolling'
  | 'RoundResult'
  | 'EnemyDefeated'
  | 'StageTransition'
  | 'Market'
  | 'GameOver';

export type RoundOutcome = 'player' | 'enemy' | 'tie';

export interface DiceRoll {
  value: number;
  sides: number;
}

export interface EnemyDefinition {
  id: string;
  name: string;
  description: string;
  diceSides: number;
  diceBonus: number;
  baseScore: number;
  color: number;
  sprite: DemonSpriteId;
}

export interface StageDefinition {
  stageNumber: number;
  enemyIds: [string, string, string];
  enemyBonus: number;
  ambientIntensity: number;
  fogDensity: number;
}

export interface RoundState {
  roundNumber: number;
  playerWins: number;
  enemyWins: number;
  playerRoll: DiceRoll | null;
  enemyRoll: DiceRoll | null;
  lastOutcome: RoundOutcome | null;
  message: string;
}

export interface CombatState {
  enemyIndex: number;
  round: RoundState;
  isComplete: boolean;
  playerWonDuel: boolean;
}

export interface PlayerState {
  health: number;
  maxHealth: number;
  score: number;
  stageNumber: number;
  enemyIndex: number;
}

export interface ScoreBreakdown {
  base: number;
  multiplier: number;
  total: number;
  reason: string;
}

export interface GameSnapshot {
  phase: GamePhase;
  player: PlayerState;
  currentEnemy: EnemyDefinition | null;
  combat: CombatState | null;
  message: string;
  marketMessage: string;
  tutorialStep: number;
  tutorialTotal: number;
}
