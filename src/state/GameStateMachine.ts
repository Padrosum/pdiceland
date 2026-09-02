import type { GamePhase, GameSnapshot, PlayerState } from '../core/types';
import { MARKET_ITEMS } from '../config/marketConfig';
import { TUTORIAL_STEPS } from '../config/tutorialConfig';
import {
  advanceEnemy,
  advanceStage,
  addScore,
  createPlayerState,
  damagePlayer,
  getCurrentEnemy,
  getStageBonus,
  isPlayerDead,
  isStageComplete,
} from '../systems/StageSystem';
import {
  advanceToNextRound,
  canRoll,
  createCombatState,
  executeRoll,
} from '../systems/CombatSystem';
import { calculateStageBonus, calculateVictoryScore } from '../systems/ScoreSystem';
import { purchaseItem } from '../systems/MarketSystem';

type StateListener = (snapshot: GameSnapshot) => void;

const MARKET_ALLOWED: GamePhase[] = [
  'Playing',
  'RoundResult',
  'EnemyDefeated',
  'StageTransition',
];

export class GameStateMachine {
  private phase: GamePhase = 'MainMenu';
  private player: PlayerState = createPlayerState();
  private combat = createCombatState(0);
  private message = 'Welcome to the dark ruins.';
  private marketMessage = 'The ruin merchant opens his stall.';
  private marketReturnPhase: GamePhase = 'Playing';
  private tutorialStep = 0;
  private tutorialReturnToMenu = false;
  private listeners: StateListener[] = [];

  subscribe(listener: StateListener): () => void {
    this.listeners.push(listener);
    listener(this.getSnapshot());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  getSnapshot(): GameSnapshot {
    const inRun =
      this.phase !== 'MainMenu' &&
      this.phase !== 'GameOver' &&
      this.phase !== 'Tutorial';

    return {
      phase: this.phase,
      player: { ...this.player },
      currentEnemy: inRun ? getCurrentEnemy(this.player) : null,
      combat: inRun ? { ...this.combat, round: { ...this.combat.round } } : null,
      message: this.message,
      marketMessage: this.marketMessage,
      tutorialStep: this.tutorialStep,
      tutorialTotal: TUTORIAL_STEPS.length,
    };
  }

  private emit(): void {
    const snapshot = this.getSnapshot();
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }

  private setPhase(phase: GamePhase, message?: string): void {
    this.phase = phase;
    if (message !== undefined) this.message = message;
    this.emit();
  }

  canOpenMarket(): boolean {
    return MARKET_ALLOWED.includes(this.phase);
  }

  openMarket(): boolean {
    if (!this.canOpenMarket()) return false;
    this.marketReturnPhase = this.phase;
    this.marketMessage = 'Spend gold — stay alive.';
    this.phase = 'Market';
    this.emit();
    return true;
  }

  closeMarket(): void {
    if (this.phase !== 'Market') return;
    this.phase = this.marketReturnPhase;
    this.emit();
  }

  buyMarketItem(itemId: string): void {
    if (this.phase !== 'Market') return;

    const item = MARKET_ITEMS.find((i) => i.id === itemId);
    if (!item) return;

    const result = purchaseItem(item, this.player);
    this.marketMessage = result.message;
    if (result.success) {
      this.player = result.player;
    }
    this.emit();
  }

  openTutorial(returnToMenu: boolean): void {
    this.tutorialReturnToMenu = returnToMenu;
    this.tutorialStep = 0;
    this.setPhase('Tutorial');
  }

  advanceTutorial(): void {
    if (this.phase !== 'Tutorial') return;

    if (this.tutorialStep >= TUTORIAL_STEPS.length - 1) {
      if (this.tutorialReturnToMenu) {
        this.setPhase('MainMenu', 'Welcome to the dark ruins.');
      } else {
        this.beginRun();
      }
      return;
    }

    this.tutorialStep += 1;
    this.emit();
  }

  skipTutorial(): void {
    if (this.phase !== 'Tutorial') return;

    if (this.tutorialReturnToMenu) {
      this.setPhase('MainMenu', 'Welcome to the dark ruins.');
    } else {
      this.beginRun();
    }
  }

  startGame(): void {
    this.openTutorial(false);
  }

  private beginRun(): void {
    this.player = createPlayerState();
    this.combat = createCombatState(0);
    this.setPhase('Playing', `${getCurrentEnemy(this.player).name} blocks your path!`);
  }

  rollDice(): boolean {
    if (this.phase !== 'Playing') return false;
    if (!canRoll(this.combat)) return false;

    const enemy = getCurrentEnemy(this.player);
    this.combat = executeRoll(this.combat, enemy, getStageBonus(this.player));
    this.setPhase('DiceRolling', 'Dice are rolling...');
    return true;
  }

  finishRollPresentation(): void {
    if (this.phase !== 'DiceRolling') return;

    const enemy = getCurrentEnemy(this.player);

    if (this.combat.round.lastOutcome === 'tie') {
      this.setPhase('RoundResult', this.combat.round.message);
      return;
    }

    if (this.combat.isComplete) {
      if (this.combat.playerWonDuel) {
        const breakdown = calculateVictoryScore(
          enemy.baseScore,
          this.combat.round.playerRoll!,
          this.combat.round.enemyRoll!,
        );
        this.player = addScore(this.player, breakdown.total);
        this.setPhase(
          'EnemyDefeated',
          `${enemy.name} defeated! +${breakdown.total} gold (${breakdown.reason})`,
        );
      } else {
        this.player = damagePlayer(this.player);
        if (isPlayerDead(this.player)) {
          this.setPhase('GameOver', `${enemy.name} ended you. Game over.`);
        } else {
          this.setPhase(
            'EnemyDefeated',
            `${enemy.name} beat you! -1 HP. Remaining: ${this.player.health}`,
          );
        }
      }
      return;
    }

    this.setPhase('RoundResult', this.combat.round.message);
  }

  continueFromRoundResult(): void {
    if (this.phase !== 'RoundResult') return;

    if (this.combat.round.lastOutcome === 'tie') {
      this.combat = advanceToNextRound(this.combat);
      this.setPhase('Playing', 'Tie — roll again!');
      return;
    }

    this.combat = advanceToNextRound(this.combat);
    this.setPhase('Playing', 'Roll the dice for the next round.');
  }

  continueAfterEnemy(): void {
    if (this.phase !== 'EnemyDefeated') return;

    this.player = advanceEnemy(this.player);

    if (isStageComplete(this.player)) {
      const bonus = calculateStageBonus(this.player.stageNumber);
      this.player = addScore(this.player, bonus);
      this.setPhase(
        'StageTransition',
        `Stage ${this.player.stageNumber} cleared! +${bonus} bonus gold.`,
      );
      return;
    }

    this.combat = createCombatState(this.player.enemyIndex);
    const enemy = getCurrentEnemy(this.player);
    this.setPhase('Playing', `Next foe: ${enemy.name}`);
  }

  continueStageTransition(): void {
    if (this.phase !== 'StageTransition') return;

    this.player = advanceStage(this.player);
    this.combat = createCombatState(0);
    const enemy = getCurrentEnemy(this.player);
    this.setPhase(
      'Playing',
      `Stage ${this.player.stageNumber} — ${enemy.name} awaits.`,
    );
  }

  returnToMenu(): void {
    this.player = createPlayerState();
    this.combat = createCombatState(0);
    this.tutorialStep = 0;
    this.setPhase('MainMenu', 'Welcome to the dark ruins.');
  }
}
