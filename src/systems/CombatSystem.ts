import type { CombatState, EnemyDefinition, RoundState } from '../core/types';
import { ROUNDS_TO_WIN } from '../config/gameConfig';
import { compareRolls, rollEnemyDie, rollPlayerDie } from './DiceSystem';

export function createRoundState(): RoundState {
  return {
    roundNumber: 1,
    playerWins: 0,
    enemyWins: 0,
    playerRoll: null,
    enemyRoll: null,
    lastOutcome: null,
    message: 'Click ROLL DICE or press SPACE / ENTER.',
  };
}

export function createCombatState(enemyIndex: number): CombatState {
  return {
    enemyIndex,
    round: createRoundState(),
    isComplete: false,
    playerWonDuel: false,
  };
}

export function canRoll(combat: CombatState): boolean {
  return !combat.isComplete && combat.round.playerRoll === null;
}

export function executeRoll(
  combat: CombatState,
  enemy: EnemyDefinition,
  stageBonus: number,
): CombatState {
  if (!canRoll(combat)) return combat;

  const playerRoll = rollPlayerDie();
  const enemyRoll = rollEnemyDie(
    enemy.diceSides,
    enemy.diceBonus + stageBonus,
  );
  const outcome = compareRolls(playerRoll, enemyRoll);

  let playerWins = combat.round.playerWins;
  let enemyWins = combat.round.enemyWins;
  let message = '';

  if (outcome === 'player') {
    playerWins += 1;
    message = `You win! ${playerRoll.value} > ${enemyRoll.value}`;
  } else if (outcome === 'enemy') {
    enemyWins += 1;
    message = `Enemy wins! ${enemyRoll.value} > ${playerRoll.value}`;
  } else {
    message = `Tie! ${playerRoll.value} = ${enemyRoll.value} — roll again.`;
  }

  const duelOver = playerWins >= ROUNDS_TO_WIN || enemyWins >= ROUNDS_TO_WIN;

  return {
    ...combat,
    round: {
      ...combat.round,
      playerRoll,
      enemyRoll,
      lastOutcome: outcome,
      playerWins,
      enemyWins,
      message,
      roundNumber: outcome === 'tie' ? combat.round.roundNumber : combat.round.roundNumber + 1,
    },
    isComplete: duelOver,
    playerWonDuel: duelOver && playerWins >= ROUNDS_TO_WIN,
  };
}

export function advanceToNextRound(combat: CombatState): CombatState {
  if (!combat.isComplete && combat.round.playerRoll !== null) {
    return {
      ...combat,
      round: {
        ...combat.round,
        playerRoll: null,
        enemyRoll: null,
        lastOutcome: null,
        message: 'Next round — roll the dice!',
      },
    };
  }
  return combat;
}

export function getDuelProgress(combat: CombatState): string {
  return `${combat.round.playerWins} - ${combat.round.enemyWins}`;
}
