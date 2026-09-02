import type { GameSnapshot } from '../core/types';
import { getDuelProgress } from '../systems/CombatSystem';
import { getDemonPortraitDataUrl } from '../assets/demons';
import { MARKET_ITEMS, getItemPrice } from '../config/marketConfig';
import { TUTORIAL_STEPS } from '../config/tutorialConfig';
import { canPurchaseItem } from '../systems/MarketSystem';

export class UIManager {
  private root: HTMLElement;

  constructor(rootId: string) {
    const el = document.getElementById(rootId);
    if (!el) throw new Error(`UI root #${rootId} not found`);
    this.root = el;
  }

  setMessage(message: string): void {
    const el = this.root.querySelector('.combat-message');
    if (el) el.textContent = message;
  }

  render(snapshot: GameSnapshot): void {
    const { phase, player, currentEnemy, combat, message, marketMessage, tutorialStep } =
      snapshot;

    if (phase === 'MainMenu') {
      this.root.innerHTML = this.mainMenuHtml();
      this.bindMenu();
      return;
    }

    if (phase === 'Tutorial') {
      this.root.innerHTML = this.tutorialHtml(tutorialStep);
      this.bindTutorial(tutorialStep);
      return;
    }

    if (phase === 'GameOver') {
      this.root.innerHTML = this.gameOverHtml(player.score, message);
      this.bindGameOver();
      return;
    }

    const enemyName = currentEnemy?.name ?? '—';
    const playerRoll = combat?.round.playerRoll?.value;
    const enemyRoll = combat?.round.enemyRoll?.value;
    const duelScore = combat ? getDuelProgress(combat) : '0 - 0';
    const roundNum = combat?.round.roundNumber ?? 1;
    const hasRoll = playerRoll !== null && playerRoll !== undefined;
    const spriteId = currentEnemy?.sprite ?? 'imp';
    const portraitUrl = getDemonPortraitDataUrl(spriteId);
    const showMarket = phase !== 'DiceRolling' && phase !== 'Market';
    const isMarket = phase === 'Market';

    this.root.innerHTML = `
      <div class="scene-vignette" aria-hidden="true"></div>

      <header class="ps2-hud">
        <div class="hud-block hud-left">
          <span class="hud-k">STAGE</span>
          <span class="hud-v">${String(player.stageNumber).padStart(2, '0')}</span>
          <span class="hud-dot">·</span>
          <span class="hud-k">FOE</span>
          <span class="hud-v">${player.enemyIndex + 1}/3</span>
        </div>
        <div class="hud-block hud-mid">
          <span class="hud-k">HP</span>
          <div class="hp-track">${this.heartsHtml(player.health, player.maxHealth)}</div>
        </div>
        <div class="hud-block hud-right">
          <span class="hud-k">GOLD</span>
          <span class="hud-v hud-gold">${player.score}</span>
          ${showMarket ? '<button class="hud-cmd" id="market-btn">SHOP</button>' : ''}
        </div>
      </header>

      <div class="foe-frame sprite-${spriteId}">
        <div class="foe-brackets" aria-hidden="true">
          <span class="br tl"></span><span class="br tr"></span>
          <span class="br bl"></span><span class="br br"></span>
        </div>
        <img class="foe-sprite" src="${portraitUrl}" alt="" width="128" height="160" draggable="false" />
        <div class="foe-tag">
          <span class="foe-tag-bar"></span>
          <span class="foe-name">${enemyName}</span>
        </div>
      </div>

      <footer class="action-window">
        <div class="action-frame">
          <div class="dice-strip ${hasRoll ? 'revealed' : ''}">
            <div class="dice-cell you">
              <span class="dice-k">YOU</span>
              <span class="dice-n">${hasRoll ? playerRoll : '--'}</span>
            </div>
            <div class="dice-cell mid">
              <span class="dice-k">ROUND ${roundNum}</span>
              <span class="dice-s">${duelScore}</span>
            </div>
            <div class="dice-cell foe">
              <span class="dice-k">FOE</span>
              <span class="dice-n">${hasRoll ? enemyRoll : '--'}</span>
            </div>
          </div>

          <div class="msg-box">
            <span class="msg-mark" aria-hidden="true">▶</span>
            <p class="combat-message">${message}</p>
          </div>

          <div class="cmd-row">
            ${isMarket ? '' : this.actionButtonHtml(phase)}
          </div>
        </div>
      </footer>

      ${isMarket ? this.marketHtml(player, marketMessage) : ''}
    `;

    this.bindGameUi(isMarket);
  }

  private tutorialHtml(stepIndex: number): string {
    const step = TUTORIAL_STEPS[stepIndex] ?? TUTORIAL_STEPS[0]!;
    const isLast = stepIndex >= TUTORIAL_STEPS.length - 1;
    const progress = TUTORIAL_STEPS.map((_, i) =>
      `<span class="tut-dot ${i <= stepIndex ? 'on' : ''}"></span>`,
    ).join('');

    return `
      <div class="scene-vignette" aria-hidden="true"></div>
      <div class="tutorial-screen">
        <div class="ps2-panel tutorial-panel">
          <div class="tutorial-head">
            <span class="panel-tag">HOW TO PLAY</span>
            <span class="tutorial-step">${stepIndex + 1} / ${TUTORIAL_STEPS.length}</span>
          </div>
          <h2 class="tutorial-title">${step.title}</h2>
          <div class="tutorial-shot">
            <img src="${step.image}" alt="${step.title}" width="480" height="270" draggable="false" />
          </div>
          <p class="tutorial-body">${step.body}</p>
          <div class="tutorial-dots">${progress}</div>
          <p class="tutorial-hint">${step.hint}</p>
          <div class="tutorial-actions">
            <button class="ps2-btn ps2-btn-dim" id="tutorial-skip-btn">SKIP</button>
            <button class="ps2-btn" id="tutorial-next-btn">${isLast ? 'BEGIN' : 'NEXT'}</button>
          </div>
        </div>
      </div>
    `;
  }

  private marketHtml(player: GameSnapshot['player'], marketMessage: string): string {
    const items = MARKET_ITEMS.map((item) => {
      const price = getItemPrice(item, player.stageNumber);
      const check = canPurchaseItem(item, player);
      return `
        <button class="ware ${check.allowed ? '' : 'dim'}" data-item-id="${item.id}" title="${check.reason}">
          <span class="ware-mark">□</span>
          <span class="ware-body">
            <span class="ware-name">${item.name}</span>
            <span class="ware-desc">${item.description}</span>
          </span>
          <span class="ware-price">${price}</span>
        </button>
      `;
    }).join('');

    return `
      <div class="market-shade">
        <div class="ps2-panel market-panel">
          <div class="panel-head">
            <span class="panel-tag">SHOP</span>
            <h2 class="panel-title">RUIN MERCHANT</h2>
          </div>
          <p class="panel-purse">Purse: <strong>${player.score}</strong></p>
          <div class="ware-list">${items}</div>
          <p class="market-msg">${marketMessage}</p>
          <button class="ps2-btn ps2-btn-dim" id="market-close-btn">CLOSE</button>
        </div>
      </div>
    `;
  }

  private heartsHtml(health: number, max: number): string {
    return Array.from({ length: max }, (_, i) =>
      `<span class="hp-seg ${i < health ? 'on' : 'off'}"></span>`,
    ).join('');
  }

  private actionButtonHtml(phase: string): string {
    switch (phase) {
      case 'Playing':
        return '<button class="ps2-btn" id="action-btn">ROLL DICE</button>';
      case 'DiceRolling':
        return '<button class="ps2-btn" disabled>ROLLING</button>';
      case 'RoundResult':
        return '<button class="ps2-btn" id="action-btn">CONTINUE</button>';
      case 'EnemyDefeated':
        return `
          <button class="ps2-btn ps2-btn-dim" id="market-inline-btn">SHOP</button>
          <button class="ps2-btn" id="action-btn">PROCEED</button>`;
      case 'StageTransition':
        return `
          <button class="ps2-btn ps2-btn-dim" id="market-inline-btn">SHOP</button>
          <button class="ps2-btn" id="action-btn">NEXT STAGE</button>`;
      default:
        return '';
    }
  }

  private mainMenuHtml(): string {
    return `
      <div class="scene-vignette" aria-hidden="true"></div>
      <div class="menu-screen">
        <div class="ps2-panel menu-panel">
          <p class="menu-tag">FILE 01</p>
          <h1 class="logo">PDICELAND</h1>
          <div class="menu-divider"></div>
          <ul class="menu-list">
            <li class="menu-item active" id="menu-new"><span class="menu-arrow">▶</span> NEW GAME</li>
            <li class="menu-item" id="menu-tutorial">HOW TO PLAY</li>
            <li class="menu-item dim">LOAD</li>
            <li class="menu-item dim">OPTIONS</li>
          </ul>
          <p class="menu-hint">Dice duels in cursed ruins. Earn gold. Survive the demons.</p>
          <button class="ps2-btn ps2-btn-wide" id="start-btn">START</button>
        </div>
        <p class="menu-press">PRESS START</p>
      </div>
    `;
  }

  private gameOverHtml(score: number, message: string): string {
    return `
      <div class="scene-vignette scene-vignette-dead" aria-hidden="true"></div>
      <div class="menu-screen">
        <div class="ps2-panel menu-panel menu-panel-dead">
          <p class="menu-tag menu-tag-dead">GAME OVER</p>
          <h1 class="logo logo-dead">DEFEATED</h1>
          <div class="menu-divider menu-divider-dead"></div>
          <p class="menu-text">${message}</p>
          <p class="score-line">GOLD <strong>${score}</strong></p>
          <button class="ps2-btn ps2-btn-wide" id="menu-btn">RETURN</button>
        </div>
      </div>
    `;
  }

  private onAction: (() => void) | null = null;
  private onStart: (() => void) | null = null;
  private onTutorial: (() => void) | null = null;
  private onTutorialNext: (() => void) | null = null;
  private onTutorialSkip: (() => void) | null = null;
  private onMenu: (() => void) | null = null;
  private onOpenMarket: (() => void) | null = null;
  private onCloseMarket: (() => void) | null = null;
  private onBuyItem: ((id: string) => void) | null = null;

  setHandlers(handlers: {
    onAction?: () => void;
    onStart?: () => void;
    onTutorial?: () => void;
    onTutorialNext?: () => void;
    onTutorialSkip?: () => void;
    onMenu?: () => void;
    onOpenMarket?: () => void;
    onCloseMarket?: () => void;
    onBuyItem?: (id: string) => void;
  }): void {
    this.onAction = handlers.onAction ?? null;
    this.onStart = handlers.onStart ?? null;
    this.onTutorial = handlers.onTutorial ?? null;
    this.onTutorialNext = handlers.onTutorialNext ?? null;
    this.onTutorialSkip = handlers.onTutorialSkip ?? null;
    this.onMenu = handlers.onMenu ?? null;
    this.onOpenMarket = handlers.onOpenMarket ?? null;
    this.onCloseMarket = handlers.onCloseMarket ?? null;
    this.onBuyItem = handlers.onBuyItem ?? null;
  }

  private bindMenu(): void {
    document.getElementById('start-btn')?.addEventListener('click', () => this.onStart?.());
    document.getElementById('menu-tutorial')?.addEventListener('click', () => this.onTutorial?.());
  }

  private bindTutorial(_stepIndex: number): void {
    document.getElementById('tutorial-next-btn')?.addEventListener('click', () => this.onTutorialNext?.());
    document.getElementById('tutorial-skip-btn')?.addEventListener('click', () => this.onTutorialSkip?.());
  }

  private bindGameOver(): void {
    document.getElementById('menu-btn')?.addEventListener('click', () => this.onMenu?.());
  }

  private bindGameUi(isMarket: boolean): void {
    document.getElementById('action-btn')?.addEventListener('click', () => this.onAction?.());
    const open = () => this.onOpenMarket?.();
    document.getElementById('market-btn')?.addEventListener('click', open);
    document.getElementById('market-inline-btn')?.addEventListener('click', open);

    if (isMarket) {
      document.getElementById('market-close-btn')?.addEventListener('click', () => this.onCloseMarket?.());
      this.root.querySelectorAll<HTMLButtonElement>('.ware').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.itemId;
          if (id) this.onBuyItem?.(id);
        });
      });
    }
  }
}
