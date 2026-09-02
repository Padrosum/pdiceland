import * as THREE from 'three';

function flat(color: number): THREE.MeshLambertMaterial {
  return new THREE.MeshLambertMaterial({ color, flatShading: true });
}

export class Environment {
  readonly group = new THREE.Group();

  private pointLight!: THREE.PointLight;
  private ambientLight!: THREE.AmbientLight;
  private candleLight!: THREE.PointLight;

  constructor(private scene: THREE.Scene) {
    this.build();
    this.scene.add(this.group);
  }

  private build(): void {
    this.ambientLight = new THREE.AmbientLight(0x1a2030, 0.28);
    this.group.add(this.ambientLight);

    this.pointLight = new THREE.PointLight(0x6070a0, 1.2, 16);
    this.pointLight.position.set(0, 3.5, 1);
    this.pointLight.castShadow = true;
    this.pointLight.shadow.mapSize.set(512, 512);
    this.group.add(this.pointLight);

    this.candleLight = new THREE.PointLight(0xc06020, 1.8, 8);
    this.candleLight.position.set(0, 1.1, -0.4);
    this.group.add(this.candleLight);

    const rim = new THREE.DirectionalLight(0x283848, 0.35);
    rim.position.set(-2, 4, -3);
    this.group.add(rim);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(14, 14, 4, 4),
      flat(0x141820),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.group.add(floor);

    const floorCrack = new THREE.Mesh(
      new THREE.PlaneGeometry(3, 0.08),
      flat(0x0a0c10),
    );
    floorCrack.rotation.x = -Math.PI / 2;
    floorCrack.position.set(0.3, 0.01, -0.2);
    this.group.add(floorCrack);

    const altar = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.3, 1.5), flat(0x1c1820));
    altar.position.set(0, 0.15, -0.85);
    altar.castShadow = true;
    altar.receiveShadow = true;
    this.group.add(altar);

    const altarCloth = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.04, 1.1), flat(0x2a1828));
    altarCloth.position.set(0, 0.32, -0.85);
    this.group.add(altarCloth);

    const pillarGeo = new THREE.CylinderGeometry(0.22, 0.3, 4.2, 5);
    const pillarMat = flat(0x101418);
    for (const [x, z] of [[-3.8, -2.8], [3.8, -2.8], [-3.8, 2.8], [3.8, 2.8]] as const) {
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(x, 2.1, z);
      pillar.castShadow = true;
      this.group.add(pillar);
    }

    const wall = new THREE.Mesh(new THREE.BoxGeometry(14, 5, 0.35), flat(0x0c1018));
    wall.position.set(0, 2.5, -6.2);
    wall.receiveShadow = true;
    this.group.add(wall);

    const arch = new THREE.Mesh(new THREE.BoxGeometry(3, 0.25, 0.2), flat(0x181c24));
    arch.position.set(0, 3.2, -6);
    this.group.add(arch);

    this.scene.fog = new THREE.Fog(0x080a10, 4, 14);
    this.scene.background = new THREE.Color(0x080a10);
  }

  applyStageAtmosphere(intensity: number, fogDensity: number): void {
    this.ambientLight.intensity = intensity * 0.8;
    if (this.scene.fog instanceof THREE.Fog) {
      this.scene.fog.near = 3.5 - fogDensity * 10;
      this.scene.fog.far = 12 - fogDensity * 5;
    }
    this.candleLight.intensity = 1.4 + intensity;
  }

  update(time: number): void {
    this.candleLight.intensity += Math.sin(time * 3.5) * 0.08;
  }

  dispose(): void {
    this.group.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
    this.scene.remove(this.group);
  }
}
