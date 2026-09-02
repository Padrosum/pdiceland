import { GameStateMachine } from '../state/GameStateMachine';
import { SceneManager } from '../rendering/SceneManager';
import { UIManager } from '../ui/UIManager';
import { AudioManager } from '../audio/AudioManager';
import type { GameSnapshot } from './types';

function isConfirmKey(e: KeyboardEvent): boolean {
  return e.code === 'Space' || e.code === 'Enter';
}

export class Game {
  private stateMachine = new GameStateMachine();
  private scene: SceneManager;
  private ui: UIManager;
  private audio = new AudioManager();
  private rafId = 0;
  private rolling = false;

  constructor(canvas: HTMLCanvasElement, uiRootId: string) {
    this.scene = new SceneManager(canvas);
    this.ui = new UIManager(uiRootId);

    this.ui.setHandlers({
      onStart: () => {
        void this.audio.unlock();
        this.stateMachine.startGame();
      },
      onTutorial: () => {
        void this.audio.unlock();
        this.stateMachine.openTutorial(true);
      },
      onTutorialNext: () => this.stateMachine.advanceTutorial(),
      onTutorialSkip: () => this.stateMachine.skipTutorial(),
      onAction: () => this.handleAction(),
      onMenu: () => {
        this.audio.stopAmbient();
        this.stateMachine.returnToMenu();
      },
      onOpenMarket: () => this.stateMachine.openMarket(),
      onCloseMarket: () => this.stateMachine.closeMarket(),
      onBuyItem: (id) => this.stateMachine.buyMarketItem(id),
    });

    let prevPhase = this.stateMachine.getSnapshot().phase;
    let prevEnemyKey = '';
    this.stateMachine.subscribe((snapshot) => {
      this.ui.render(snapshot);
      if (
        snapshot.phase !== 'MainMenu' &&
        snapshot.phase !== 'GameOver' &&
        snapshot.phase !== 'Tutorial'
      ) {
        this.scene.setStage(snapshot.player.stageNumber);
      }

      const enteringPlay =
        snapshot.phase === 'Playing' &&
        prevPhase !== 'Playing' &&
        prevPhase !== 'DiceRolling';
      if (enteringPlay) {
        this.scene.prepareDiceForNewRound();
      }

      const enemyKey = snapshot.currentEnemy
        ? `${snapshot.player.stageNumber}-${snapshot.player.enemyIndex}`
        : '';
      if (
        snapshot.phase === 'Playing' &&
        enemyKey &&
        enemyKey !== prevEnemyKey &&
        snapshot.currentEnemy
      ) {
        this.audio.playDemonEncounter(snapshot.currentEnemy.sprite);
        prevEnemyKey = enemyKey;
      }
      if (snapshot.phase === 'MainMenu' || snapshot.phase === 'Tutorial') {
        prevEnemyKey = '';
      }

      if (prevPhase === 'DiceRolling') {
        this.handleCombatSounds(snapshot);
      }

      prevPhase = snapshot.phase;
    });

    window.addEventListener('keydown', this.onKeyDown);
    this.loop();
  }

  private handleCombatSounds(snapshot: GameSnapshot): void {
    const { phase, combat } = snapshot;
    if (!combat) return;

    const outcome = combat.round.lastOutcome;

    if (phase === 'GameOver') {
      this.audio.playGameOver();
      return;
    }

    if (phase === 'EnemyDefeated') {
      if (combat.playerWonDuel) this.audio.playVictory();
      else this.audio.playDefeat();
      return;
    }

    if (phase === 'RoundResult') {
      if (outcome === 'player') this.audio.playRoundWin();
      else if (outcome === 'enemy') this.audio.playDefeat();
    }
  }

  private handleAction(): void {
    const phase = this.stateMachine.getSnapshot().phase;

    if (phase === 'Market') return;

    switch (phase) {
      case 'Playing':
        this.triggerRoll();
        break;
      case 'RoundResult':
        this.stateMachine.continueFromRoundResult();
        break;
      case 'EnemyDefeated':
        this.stateMachine.continueAfterEnemy();
        break;
      case 'StageTransition':
        this.stateMachine.continueStageTransition();
        break;
    }
  }

  private triggerRoll(): void {
    if (this.rolling) return;

    void this.audio.unlock();

    const started = this.stateMachine.rollDice();
    if (!started) return;

    this.rolling = true;
    this.audio.playDiceRoll();

    const snap = this.stateMachine.getSnapshot();
    const pVal = snap.combat?.round.playerRoll?.value ?? 1;
    const eVal = snap.combat?.round.enemyRoll?.value ?? 1;

    this.scene.diceRenderer.startRoll(pVal, eVal, {
      onPlayerImpact: () => {
        this.audio.playDiceImpact();
        this.ui.setMessage("Enemy's die is rolling...");
      },
      onEnemyImpact: () => this.audio.playDiceImpact(),
      onComplete: () => {
        this.stateMachine.finishRollPresentation();
        this.rolling = false;
      },
    });
    this.ui.setMessage('Your die is rolling...');
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    const phase = this.stateMachine.getSnapshot().phase;

    if (phase === 'MainMenu' && isConfirmKey(e)) {
      e.preventDefault();
      void this.audio.unlock();
      this.stateMachine.startGame();
      return;
    }

    if (phase === 'Tutorial' && isConfirmKey(e)) {
      e.preventDefault();
      this.stateMachine.advanceTutorial();
      return;
    }

    if (phase === 'GameOver' && isConfirmKey(e)) {
      e.preventDefault();
      this.audio.stopAmbient();
      this.stateMachine.returnToMenu();
      return;
    }

    if (e.code === 'KeyM' && this.stateMachine.canOpenMarket()) {
      e.preventDefault();
      this.stateMachine.openMarket();
      return;
    }

    if (e.code === 'Escape' && phase === 'Market') {
      e.preventDefault();
      this.stateMachine.closeMarket();
      return;
    }

    if (!isConfirmKey(e)) return;

    if (phase === 'Playing') {
      e.preventDefault();
      this.triggerRoll();
      return;
    }

    if (
      phase === 'RoundResult' ||
      phase === 'EnemyDefeated' ||
      phase === 'StageTransition'
    ) {
      e.preventDefault();
      this.handleAction();
    }
  };

  private loop = (): void => {
    this.scene.update();
    this.scene.render();
    this.rafId = requestAnimationFrame(this.loop);
  };

  dispose(): void {
    cancelAnimationFrame(this.rafId);
    window.removeEventListener('keydown', this.onKeyDown);
    this.scene.dispose();
  }
}
