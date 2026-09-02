export interface TutorialStep {
  id: string;
  title: string;
  body: string;
  image: string;
  hint: string;
}

const SHOT = `${import.meta.env.BASE_URL}screenshots`;

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to the Ruins',
    body: 'PDICELAND is a dark fantasy dice duel. Face demons at a cursed altar, win best-of-three rounds, earn gold, and survive as long as you can.',
    image: `${SHOT}/tutorial-menu.png`,
    hint: 'SPACE or ENTER — next',
  },
  {
    id: 'combat',
    title: 'Roll the Dice',
    body: 'Each duel is best of 3 rounds. Press ROLL DICE or hit SPACE / ENTER. Higher roll wins the round. Ties are re-rolled.',
    image: `${SHOT}/tutorial-combat.png`,
    hint: 'Watch the dice strip at the bottom',
  },
  {
    id: 'hud',
    title: 'Health & Gold',
    body: 'Health segments show how many hits you can take. Lose a duel and you lose 1 HP. Gold is earned from victories — spend it at the merchant between fights.',
    image: `${SHOT}/tutorial-hud.png`,
    hint: 'Top bar: STAGE · ENEMY · HP · GOLD',
  },
  {
    id: 'merchant',
    title: 'The Ruin Merchant',
    body: 'Press M or click MERCHANT to buy potions and heart stones. Stock up before harder demons — each stage gets tougher.',
    image: `${SHOT}/tutorial-merchant.png`,
    hint: 'M — open shop · ESC — close',
  },
  {
    id: 'start',
    title: 'Face the Darkness',
    body: 'Clear 3 demons per stage to advance. Stronger foes roll bigger dice. Dominant wins earn bonus gold. Good luck.',
    image: `${SHOT}/tutorial-combat.png`,
    hint: 'SPACE / ENTER — begin',
  },
];
