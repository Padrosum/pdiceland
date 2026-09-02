import type { DemonSpriteId } from '../assets/demons';

const BASE = import.meta.env.BASE_URL;

type SoundKey =
  | 'ambient'
  | 'diceRoll'
  | 'diceImpact'
  | 'demonImp'
  | 'demonShade'
  | 'demonBrute'
  | 'victory'
  | 'defeat'
  | 'gameOver';

const PATHS: Record<SoundKey, string> = {
  ambient: `${BASE}audio/ambient.ogg`,
  diceRoll: `${BASE}audio/dice-roll.wav`,
  diceImpact: `${BASE}audio/dice-roll.wav`,
  demonImp: `${BASE}audio/demons/imp.wav`,
  demonShade: `${BASE}audio/demons/shade.wav`,
  demonBrute: `${BASE}audio/demons/brute.wav`,
  victory: `${BASE}audio/victory.wav`,
  defeat: `${BASE}audio/defeat.wav`,
  gameOver: `${BASE}audio/game-over.ogg`,
};

export class AudioManager {
  private enabled = true;
  private unlocked = false;
  private ambient: HTMLAudioElement | null = null;
  private readonly cache = new Map<SoundKey, HTMLAudioElement>();

  setEnabled(value: boolean): void {
    this.enabled = value;
    if (!value) this.stopAmbient();
  }

  async unlock(): Promise<void> {
    if (this.unlocked) return;
    this.unlocked = true;
    await this.preloadAll();
    this.startAmbient();
  }

  private async preloadAll(): Promise<void> {
    const keys = Object.keys(PATHS) as SoundKey[];
    await Promise.all(
      keys.map(async (key) => {
        const audio = this.getOrCreate(key);
        audio.load();
        await new Promise<void>((resolve) => {
          if (audio.readyState >= 2) {
            resolve();
            return;
          }
          audio.addEventListener('canplaythrough', () => resolve(), { once: true });
          audio.addEventListener('error', () => resolve(), { once: true });
        });
      }),
    );
  }

  private getOrCreate(key: SoundKey): HTMLAudioElement {
    let audio = this.cache.get(key);
    if (!audio) {
      audio = new Audio(PATHS[key]);
      audio.preload = 'auto';
      this.cache.set(key, audio);
    }
    return audio;
  }

  private playOneShot(
    key: SoundKey,
    volume: number,
    playbackRate = 1,
    startAt = 0,
  ): void {
    if (!this.enabled || !this.unlocked) return;

    const source = this.getOrCreate(key);
    const clone = source.cloneNode(true) as HTMLAudioElement;
    clone.volume = volume;
    clone.playbackRate = playbackRate;
    clone.currentTime = startAt;
    void clone.play().catch(() => undefined);
  }

  startAmbient(): void {
    if (!this.enabled || !this.unlocked) return;

    if (!this.ambient) {
      this.ambient = this.getOrCreate('ambient');
      this.ambient.loop = true;
      this.ambient.volume = 0.28;
    }

    if (this.ambient.paused) {
      void this.ambient.play().catch(() => undefined);
    }
  }

  stopAmbient(): void {
    if (!this.ambient) return;
    this.ambient.pause();
    this.ambient.currentTime = 0;
  }

  playDiceRoll(): void {
    this.playOneShot('diceRoll', 0.65);
  }

  playDiceImpact(): void {
    this.playOneShot('diceRoll', 0.38, 1.35);
  }

  playDemonEncounter(sprite: DemonSpriteId): void {
    const key: SoundKey =
      sprite === 'imp' ? 'demonImp' : sprite === 'shade' ? 'demonShade' : 'demonBrute';
    this.playOneShot(key, 0.7);
  }

  /** Tur kazanınca — uzak şapel çanı */
  playRoundWin(): void {
    this.playOneShot('victory', 0.28, 0.82);
  }

  /** Düello kazanınca — daha belirgin çan */
  playVictory(): void {
    this.playOneShot('victory', 0.42, 0.88);
  }

  /** Tur / düello kaybı — taş zemine düşen darbe */
  playDefeat(): void {
    this.playOneShot('defeat', 0.48, 0.92);
  }

  /** Oyun bitti — karanlık brass sting */
  playGameOver(): void {
    this.stopAmbient();
    this.playOneShot('gameOver', 0.5, 1);
  }
}
