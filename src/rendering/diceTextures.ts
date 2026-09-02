import * as THREE from 'three';

const PIP_LAYOUTS: Record<number, [number, number][]> = {
  1: [[0.5, 0.5]],
  2: [[0.28, 0.28], [0.72, 0.72]],
  3: [[0.28, 0.28], [0.5, 0.5], [0.72, 0.72]],
  4: [[0.28, 0.28], [0.72, 0.28], [0.28, 0.72], [0.72, 0.72]],
  5: [[0.28, 0.28], [0.72, 0.28], [0.5, 0.5], [0.28, 0.72], [0.72, 0.72]],
  6: [[0.28, 0.28], [0.72, 0.28], [0.28, 0.5], [0.72, 0.5], [0.28, 0.72], [0.72, 0.72]],
};

function drawNoise(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number): void {
  const img = ctx.getImageData(0, 0, w, h);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * amount;
    img.data[i] = Math.max(0, Math.min(255, img.data[i]! + n));
    img.data[i + 1] = Math.max(0, Math.min(255, img.data[i + 1]! + n));
    img.data[i + 2] = Math.max(0, Math.min(255, img.data[i + 2]! + n));
  }
  ctx.putImageData(img, 0, 0);
}

export function createDieFaceTexture(
  faceValue: number,
  baseColor: string,
  pipColor: string,
): THREE.CanvasTexture {
  const size = 32;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  drawNoise(ctx, size, size, 18);

  ctx.strokeStyle = 'rgba(0,0,0,0.45)';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, size - 2, size - 2);

  const pips = PIP_LAYOUTS[faceValue] ?? PIP_LAYOUTS[1]!;
  ctx.fillStyle = pipColor;
  for (const [px, py] of pips) {
    ctx.beginPath();
    ctx.arc(px * size, py * size, size * 0.09, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createDieMaterials(
  baseHex: number,
  accentHex: number,
): THREE.Material[] {
  const base = `#${baseHex.toString(16).padStart(6, '0')}`;
  const accent = `#${accentHex.toString(16).padStart(6, '0')}`;

  const faceValues = [1, 6, 2, 5, 3, 4];
  return faceValues.map((v) => {
    const map = createDieFaceTexture(v, base, accent);
    return new THREE.MeshLambertMaterial({
      map,
      flatShading: true,
    });
  });
}

export function createValueLabelSprite(value: number, tint: string): THREE.Sprite {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = 'rgba(8, 6, 12, 0.85)';
  ctx.fillRect(2, 2, size - 4, size - 4);
  ctx.strokeStyle = tint;
  ctx.lineWidth = 3;
  ctx.strokeRect(2, 2, size - 4, size - 4);

  ctx.fillStyle = tint;
  ctx.font = 'bold 40px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(value), size / 2, size / 2 + 2);

  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;

  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }),
  );
  sprite.scale.set(0.42, 0.42, 1);
  sprite.position.y = 0.38;
  sprite.renderOrder = 10;
  return sprite;
}
