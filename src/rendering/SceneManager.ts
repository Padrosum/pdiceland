import * as THREE from 'three';
import { Environment } from './Environment';
import { DiceRenderer } from './DiceRenderer';
import { getStageConfig } from '../config/gameConfig';

const PS2_RENDER_SCALE = 0.55;

export class SceneManager {
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  readonly renderer: THREE.WebGLRenderer;
  readonly environment: Environment;
  readonly diceRenderer: DiceRenderer;

  private clock = new THREE.Clock();
  private displayWidth = 0;
  private displayHeight = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.BasicShadowMap;

    canvas.classList.add('ps2-canvas');

    this.camera = new THREE.PerspectiveCamera(58, 1, 0.1, 40);
    this.camera.position.set(0, 1.55, 2.05);
    this.camera.lookAt(0, 0.5, -0.55);

    this.environment = new Environment(this.scene);
    this.diceRenderer = new DiceRenderer();
    this.scene.add(this.diceRenderer.group);

    this.resize();
    window.addEventListener('resize', this.onResize);
  }

  private onResize = (): void => {
    this.resize();
  };

  private resize(): void {
    this.displayWidth = window.innerWidth;
    this.displayHeight = window.innerHeight;
    const rw = Math.floor(this.displayWidth * PS2_RENDER_SCALE);
    const rh = Math.floor(this.displayHeight * PS2_RENDER_SCALE);

    this.renderer.setPixelRatio(1);
    this.renderer.setSize(rw, rh, false);

    const canvas = this.renderer.domElement;
    canvas.style.width = `${this.displayWidth}px`;
    canvas.style.height = `${this.displayHeight}px`;

    this.camera.aspect = this.displayWidth / this.displayHeight;
    this.camera.updateProjectionMatrix();
  }

  setStage(stageNumber: number): void {
    const config = getStageConfig(stageNumber);
    this.environment.applyStageAtmosphere(
      config.ambientIntensity,
      config.fogDensity,
    );
  }

  prepareDiceForNewRound(): void {
    this.diceRenderer.prepareNextRound();
  }

  update(): void {
    const time = this.clock.getElapsedTime();
    this.environment.update(time);
    this.diceRenderer.update();
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    window.removeEventListener('resize', this.onResize);
    this.environment.dispose();
    this.diceRenderer.dispose();
    this.renderer.dispose();
  }
}
