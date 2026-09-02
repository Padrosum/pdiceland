import * as THREE from 'three';
import {
  createDieMaterials,
  createValueLabelSprite,
} from './diceTextures';

type DiePhase = 'idle' | 'windup' | 'throw' | 'bounce' | 'settled';

interface DieGroup {
  root: THREE.Group;
  mesh: THREE.Mesh;
  label: THREE.Sprite;
  home: THREE.Vector3;
  restRotation: THREE.Euler;
  labelTint: string;
  phase: DiePhase;
  phaseStart: number;
  targetValue: number;
  rotVelocity: THREE.Vector3;
  bounceCount: number;
}

type RollPhase = 'player' | 'enemy' | 'done';

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

function easeInCubic(t: number): number {
  return t ** 3;
}

function arcPoint(
  from: THREE.Vector3,
  to: THREE.Vector3,
  t: number,
  height: number,
): THREE.Vector3 {
  return new THREE.Vector3(
    from.x + (to.x - from.x) * t,
    from.y + (to.y - from.y) * t + height * 4 * t * (1 - t),
    from.z + (to.z - from.z) * t,
  );
}

const TIMING = {
  windup: 180,
  throw: 520,
  bounce: 280,
  gapBetweenDice: 220,
} as const;

export class DiceRenderer {
  readonly group = new THREE.Group();

  private playerDie!: DieGroup;
  private enemyDie!: DieGroup;
  private rollPhase: RollPhase = 'done';
  private rollStart = 0;
  private pendingEnemyValue = 1;
  private onComplete: (() => void) | null = null;
  private onPlayerImpact: (() => void) | null = null;
  private onEnemyImpact: (() => void) | null = null;

  constructor() {
    this.playerDie = this.createDieGroup(0xb85c28, 0x1a0808, -0.75, '#d4a030');
    this.enemyDie = this.createDieGroup(0x3a2858, 0xe8d8a0, 0.75, '#a080d0');
    this.group.add(this.playerDie.root, this.enemyDie.root);
    this.group.position.set(0, 0.52, -0.55);
  }

  private createDieGroup(
    baseColor: number,
    pipColor: number,
    homeX: number,
    labelTint: string,
  ): DieGroup {
    const root = new THREE.Group();
    const home = new THREE.Vector3(homeX, 0, 0);
    root.position.copy(home);

    const geo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const materials = createDieMaterials(baseColor, pipColor);
    const mesh = new THREE.Mesh(geo, materials);
    mesh.castShadow = true;
    const restRotation = new THREE.Euler(0.25, 0.4, 0.1);
    mesh.rotation.copy(restRotation);

    const label = createValueLabelSprite(1, labelTint);
    label.visible = false;

    root.add(mesh, label);
    return {
      root,
      mesh,
      label,
      home,
      restRotation,
      labelTint,
      phase: 'idle',
      phaseStart: 0,
      targetValue: 1,
      rotVelocity: new THREE.Vector3(),
      bounceCount: 0,
    };
  }

  private valueToRotation(value: number): THREE.Euler {
    const clamped = Math.min(Math.max(value, 1), 6);
    const rotations: Record<number, THREE.Euler> = {
      1: new THREE.Euler(0, 0, 0),
      2: new THREE.Euler(0, Math.PI / 2, 0),
      3: new THREE.Euler(-Math.PI / 2, 0, 0),
      4: new THREE.Euler(Math.PI / 2, 0, 0),
      5: new THREE.Euler(0, -Math.PI / 2, 0),
      6: new THREE.Euler(Math.PI, 0, 0),
    };
    return rotations[clamped] ?? new THREE.Euler(0, 0, 0);
  }

  private setLabel(die: DieGroup, value: number): void {
    die.root.remove(die.label);
    die.label.material.map?.dispose();
    (die.label.material as THREE.SpriteMaterial).dispose();
    die.label = createValueLabelSprite(value, die.labelTint);
    die.root.add(die.label);
    die.label.visible = true;
  }

  private beginDieRoll(die: DieGroup, value: number, isPlayer: boolean): void {
    die.targetValue = value;
    die.phase = 'windup';
    die.phaseStart = performance.now();
    die.label.visible = false;
    die.bounceCount = 0;

    if (isPlayer) {
      die.rotVelocity.set(14, 11, 6);
    } else {
      die.rotVelocity.set(-12, 13, -8);
    }
  }

  private getThrowOrigin(die: DieGroup, isPlayer: boolean): THREE.Vector3 {
    const side = isPlayer ? -1 : 1;
    return new THREE.Vector3(
      die.home.x + side * 0.15,
      0.55,
      isPlayer ? 0.35 : 0.42,
    );
  }

  private updateDie(die: DieGroup, now: number, isPlayer: boolean): boolean {
    const elapsed = now - die.phaseStart;

    switch (die.phase) {
      case 'windup': {
        const t = Math.min(elapsed / TIMING.windup, 1);
        const lift = easeInCubic(t) * 0.18;
        const pull = easeInCubic(t) * 0.12;
        const side = isPlayer ? -1 : 1;
        die.root.position.set(
          die.home.x + side * pull,
          lift,
          pull * 0.3,
        );
        die.mesh.rotation.x += 0.04 * side;
        if (t >= 1) {
          die.phase = 'throw';
          die.phaseStart = now;
        }
        return false;
      }

      case 'throw': {
        const t = Math.min(elapsed / TIMING.throw, 1);
        const eased = easeOutCubic(t);
        const from = this.getThrowOrigin(die, isPlayer);
        const to = die.home.clone();
        die.root.position.copy(arcPoint(from, to, eased, isPlayer ? 0.38 : 0.32));

        const decay = 1 - eased * 0.85;
        die.mesh.rotation.x += die.rotVelocity.x * 0.016 * decay;
        die.mesh.rotation.y += die.rotVelocity.y * 0.016 * decay;
        die.mesh.rotation.z += die.rotVelocity.z * 0.016 * decay;

        if (t >= 1) {
          die.phase = 'bounce';
          die.phaseStart = now;
          die.root.position.copy(die.home);
        }
        return false;
      }

      case 'bounce': {
        const t = Math.min(elapsed / TIMING.bounce, 1);
        const bounceHeight = 0.14 * Math.sin(t * Math.PI) * (1 - t);
        die.root.position.set(die.home.x, bounceHeight, die.home.z);

        const settleT = easeOutCubic(t);
        const target = this.valueToRotation(die.targetValue);
        die.mesh.rotation.x = THREE.MathUtils.lerp(die.mesh.rotation.x, target.x, settleT * 0.35);
        die.mesh.rotation.y = THREE.MathUtils.lerp(die.mesh.rotation.y, target.y, settleT * 0.35);
        die.mesh.rotation.z = THREE.MathUtils.lerp(die.mesh.rotation.z, target.z, settleT * 0.35);

        if (t >= 1) {
          die.mesh.rotation.copy(this.valueToRotation(die.targetValue));
          die.root.position.copy(die.home);
          die.phase = 'settled';
          this.setLabel(die, die.targetValue);
          return true;
        }
        return false;
      }

      case 'settled':
        return true;

      default:
        return false;
    }
  }

  startRoll(
    playerValue: number,
    enemyValue: number,
    callbacks: {
      onComplete: () => void;
      onPlayerImpact?: () => void;
      onEnemyImpact?: () => void;
    },
  ): void {
    this.rollPhase = 'player';
    this.rollStart = performance.now();
    this.pendingEnemyValue = enemyValue;
    this.onComplete = callbacks.onComplete;
    this.onPlayerImpact = callbacks.onPlayerImpact ?? null;
    this.onEnemyImpact = callbacks.onEnemyImpact ?? null;

    this.beginDieRoll(this.playerDie, playerValue, true);

    this.enemyDie.phase = 'idle';
    this.enemyDie.label.visible = false;
    this.enemyDie.root.position.copy(this.enemyDie.home);
    this.enemyDie.mesh.rotation.copy(this.enemyDie.restRotation);
  }

  update(): void {
    if (this.rollPhase === 'done') return;

    const now = performance.now();

    if (this.rollPhase === 'player') {
      const settled = this.updateDie(this.playerDie, now, true);
      if (settled) {
        this.onPlayerImpact?.();
        this.rollPhase = 'enemy';
        this.rollStart = now;
      }
      return;
    }

    if (this.rollPhase === 'enemy') {
      if (this.enemyDie.phase === 'idle') {
        if (now - this.rollStart < TIMING.gapBetweenDice) return;
        this.beginDieRoll(this.enemyDie, this.pendingEnemyValue, false);
      }

      const settled = this.updateDie(this.enemyDie, now, false);
      if (settled) {
        this.onEnemyImpact?.();
        this.rollPhase = 'done';
        this.onComplete?.();
        this.onComplete = null;
        this.onPlayerImpact = null;
        this.onEnemyImpact = null;
      }
    }
  }

  isRolling(): boolean {
    return this.rollPhase !== 'done';
  }

  getRollPhase(): RollPhase {
    return this.rollPhase;
  }

  prepareNextRound(): void {
    this.rollPhase = 'done';
    for (const die of [this.playerDie, this.enemyDie]) {
      die.phase = 'idle';
      die.label.visible = false;
      die.root.position.copy(die.home);
      die.mesh.rotation.copy(die.restRotation);
    }
    this.enemyDie.restRotation.set(-0.2, -0.35, 0.15);
    this.enemyDie.mesh.rotation.copy(this.enemyDie.restRotation);
  }

  dispose(): void {
    [this.playerDie, this.enemyDie].forEach((die) => {
      die.mesh.geometry.dispose();
      const mats = die.mesh.material;
      if (Array.isArray(mats)) mats.forEach((m) => m.dispose());
      die.label.material.map?.dispose();
      (die.label.material as THREE.SpriteMaterial).dispose();
    });
  }
}
