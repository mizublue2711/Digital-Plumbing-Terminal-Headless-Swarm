import * as THREE from 'three';

/**
 * Generates the Outdoor Courtyard Honed Obsidian Concrete (#09090B) texture
 * (Roughness: 0.15 satin-honed finish) incised with 1px micro drainage channels.
 */
export function createSwissGridTexture(renderer?: THREE.WebGLRenderer): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Honed Obsidian #09090B concrete base
  ctx.fillStyle = '#09090b';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle satin-honed mineral sheen variations
  ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
  for (let i = 0; i < 700; i++) {
    const gx = (i * 73) % 512;
    const gy = (i * 137) % 512;
    ctx.fillRect(gx, gy, 2, 2);
  }

  // Incised micro drainage channels (64px sub-grid)
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.075)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 512; i += 64) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 512);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(512, i);
    ctx.stroke();
  }

  // Primary 1px Swiss Tactical CAD drainage trench
  ctx.strokeStyle = 'rgba(83, 34, 255, 0.32)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(1, 1, 510, 510);

  // Corner CAD drainage intersection sumps
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.65)';
  ctx.lineWidth = 1.5;
  const crossSize = 14;
  const coords = [
    [0, 0],
    [256, 256],
  ];
  for (const [cx, cy] of coords) {
    ctx.beginPath();
    ctx.moveTo(cx - crossSize, cy);
    ctx.lineTo(cx + crossSize, cy);
    ctx.moveTo(cx, cy - crossSize);
    ctx.lineTo(cx, cy + crossSize);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(28, 28);
  if (renderer) {
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  }
  return texture;
}

/**
 * Generates Indoor Cleanroom Brutalist Stone-Gray Concrete (#121215) texture:
 * Monolithic textured cast concrete scored with wide square tiles and 1px Swiss Grid micro-joints.
 */
export function createBrutalistWallTexture(renderer?: THREE.WebGLRenderer): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Brutalist dark stone-gray #121215 base
  ctx.fillStyle = '#121215';
  ctx.fillRect(0, 0, 512, 512);

  // Raw cast-concrete tactile grain
  for (let i = 0; i < 1800; i++) {
    const gx = (i * 97) % 512;
    const gy = (i * 193) % 512;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.022)' : 'rgba(0,0,0,0.28)';
    ctx.fillRect(gx, gy, 3, 2);
  }

  // Wide square monolithic tiles (256x256) with 1px Swiss Grid micro-seams
  ctx.strokeStyle = '#070709';
  ctx.lineWidth = 2;
  for (let i = 0; i <= 512; i += 256) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 512);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(512, i);
    ctx.stroke();
  }

  // Subtle 1px Swiss CAD registration highlight along tile seams
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  for (let i = 2; i <= 512; i += 256) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 512);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(512, i);
    ctx.stroke();
  }

  // Formwork tie-rod indentations in tile corners
  ctx.fillStyle = '#08080a';
  for (const tx of [32, 224, 288, 480]) {
    for (const ty of [32, 224, 288, 480]) {
      ctx.beginPath();
      ctx.arc(tx, ty, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 2);
  if (renderer) {
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  }
  return texture;
}

/**
 * Generates Matte Anti-Glare Dark Titanium Cladding (#18181E) texture
 * with 1px precision seams and micro-rivet fasteners.
 */
export function createTitaniumCladdingTexture(renderer?: THREE.WebGLRenderer): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Matte anti-glare Titanium #18181E base
  ctx.fillStyle = '#18181e';
  ctx.fillRect(0, 0, 512, 512);

  // Fine brushed horizontal micro-anisotropy lines
  ctx.fillStyle = 'rgba(255, 255, 255, 0.016)';
  for (let y = 0; y < 512; y += 3) {
    ctx.fillRect(0, y, 512, 1);
  }

  // 1px Swiss Grid panel joints
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.16)';
  ctx.lineWidth = 1;
  ctx.strokeRect(1, 1, 254, 254);
  ctx.strokeRect(257, 1, 254, 254);
  ctx.strokeRect(1, 257, 254, 254);
  ctx.strokeRect(257, 257, 254, 254);

  // 1px Micro-rivets along panel perimeters
  ctx.fillStyle = '#71717a';
  const offsets = [12, 244, 268, 500];
  for (const rx of offsets) {
    for (const ry of offsets) {
      ctx.fillRect(rx - 1, ry - 1, 3, 3);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 2);
  if (renderer) {
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  }
  return texture;
}

/**
 * Generates an illuminated status badge texture for the Exposed Pipeline Arch Valve Joints:
 * "STATUS: OPERATIONAL // ZERO DRIFT"
 */
export function createValveStatusBadgeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 96;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#09090b';
  ctx.fillRect(0, 0, 512, 96);

  ctx.strokeStyle = '#00E5FF';
  ctx.lineWidth = 3;
  ctx.strokeRect(4, 4, 504, 88);

  ctx.fillStyle = '#5322FF';
  ctx.fillRect(12, 12, 14, 72);

  ctx.fillStyle = '#00E5FF';
  ctx.font = '700 22px "JetBrains Mono", monospace';
  ctx.fillText('STATUS: OPERATIONAL // ZERO DRIFT', 40, 44);

  ctx.fillStyle = '#A1A1AA';
  ctx.font = '500 15px "JetBrains Mono", monospace';
  ctx.fillText('QUARTZ TRANSMISSION: 0.95 · 0ms LATENCY', 40, 72);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Generates the Lead Plumber Dossier schematic texture with Zod Schema Valve & Next.js API Weld diagrams.
 */
export function createDossierSchematicTexture(
  hovered: boolean,
  activeAgentName: string,
  scanYNormalized: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 640;
  const ctx = canvas.getContext('2d')!;

  updateDossierCanvas(ctx, canvas.width, canvas.height, hovered, activeAgentName, scanYNormalized);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function updateDossierCanvas(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  hovered: boolean,
  activeAgentName: string,
  scanYNormalized: number
) {
  ctx.clearRect(0, 0, w, h);

  // Sterile Obsidian Cleanroom CAD plate background (#09090B)
  ctx.fillStyle = '#09090b';
  ctx.fillRect(0, 0, w, h);

  // Technical 1px Swiss CAD grid lines
  ctx.strokeStyle = hovered ? 'rgba(0, 229, 255, 0.16)' : 'rgba(113, 113, 122, 0.12)';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Outer chamfered tactical frame
  ctx.strokeStyle = hovered ? '#00E5FF' : '#5322FF';
  ctx.lineWidth = 3;
  ctx.strokeRect(16, 16, w - 32, h - 32);

  // Header classification bar
  ctx.fillStyle = hovered ? 'rgba(0, 229, 255, 0.15)' : 'rgba(83, 34, 255, 0.2)';
  ctx.fillRect(28, 28, w - 56, 72);

  ctx.fillStyle = '#00E5FF';
  ctx.font = '700 22px "JetBrains Mono", monospace';
  ctx.fillText('CLEANROOM TERMINAL // LEAD PLUMBER DOSSIER [01:00 AM MIDNIGHT]', 48, 58);

  ctx.fillStyle = '#A1A1AA';
  ctx.font = '500 16px "JetBrains Mono", monospace';
  ctx.fillText('HYDRO-KINETIC PYLON TELEMETRY TARGET · 1PX CYAN LASER RECEIVER', 48, 86);

  // Left Column: ZOD SCHEMA VALVE SCHEMATIC
  ctx.strokeStyle = hovered ? '#00E5FF' : '#3F3F46';
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 124, 448, 360);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 20px "Space Grotesk", sans-serif';
  ctx.fillText('SCHEMATIC A: ZOD SCHEMA CHECK VALVE', 60, 158);

  const vx = 264;
  const vy = 275;
  ctx.strokeStyle = '#00E5FF';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(vx - 110, vy - 55);
  ctx.lineTo(vx + 110, vy + 55);
  ctx.lineTo(vx + 110, vy - 55);
  ctx.lineTo(vx - 110, vy + 55);
  ctx.closePath();
  ctx.stroke();

  ctx.fillStyle = hovered ? '#00E5FF' : '#5322FF';
  ctx.beginPath();
  ctx.arc(vx, vy, 22, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#E4E4E7';
  ctx.font = '500 15px "JetBrains Mono", monospace';
  ctx.fillText('z.object({ payload: z.strict(), drift: z.literal(0) })', 60, 385);
  ctx.fillStyle = '#10B981';
  ctx.fillText('STATUS: OPERATIONAL // ZERO DRIFT — 0% MEMORY LEAK', 60, 415);
  ctx.fillStyle = '#A1A1AA';
  ctx.fillText('QUARTZ CONDUIT TRANSMISSION: 0.95 DETERMINISTIC', 60, 445);

  // Right Column: NEXT.JS API WELD & COURTYARD PYLON RECEIVER
  ctx.strokeStyle = hovered ? '#5322FF' : '#3F3F46';
  ctx.lineWidth = 2;
  ctx.strokeRect(520, 124, 464, 360);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 20px "Space Grotesk", sans-serif';
  ctx.fillText('SCHEMATIC B: NEXT.JS API WELD & PYLON BEAM', 540, 158);

  const nodesY = [215, 275, 335];
  ctx.strokeStyle = '#5322FF';
  ctx.lineWidth = 4;
  for (const ny of nodesY) {
    ctx.beginPath();
    ctx.moveTo(555, ny);
    ctx.lineTo(945, ny);
    ctx.stroke();

    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 2;
    for (let wx = 610; wx <= 900; wx += 70) {
      ctx.beginPath();
      ctx.moveTo(wx, ny - 10);
      ctx.lineTo(wx, ny + 10);
      ctx.stroke();
    }
    ctx.strokeStyle = '#5322FF';
    ctx.lineWidth = 4;
  }

  ctx.fillStyle = '#00E5FF';
  ctx.font = '600 16px "JetBrains Mono", monospace';
  ctx.fillText(`ACTIVE PYLON LASER: [ ${activeAgentName.toUpperCase()} ] -> CLEANROOM WALL`, 540, 395);

  ctx.fillStyle = '#D4D4D8';
  ctx.font = '500 15px "JetBrains Mono", monospace';
  ctx.fillText('COURTYARD HYDRO-MIRROR HEAT SINK: 60.0 FPS', 540, 425);
  ctx.fillText('BACKPRESSURE REGULATOR: DETERMINISTIC LOCK', 540, 455);

  // Bottom Dossier Manifesto Quote
  ctx.fillStyle = 'rgba(18, 18, 21, 0.95)';
  ctx.fillRect(40, 504, w - 80, 96);
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(40, 504, w - 80, 96);

  ctx.fillStyle = '#FAFAFA';
  ctx.font = '600 19px "Space Grotesk", sans-serif';
  ctx.fillText(
    '"Outside on the Obsidian Water Mirror, the 5 Magnetic Pylons do the heavy lifting;',
    60,
    542
  );
  ctx.fillText(
    'inside the Cleanroom, the Lead Plumber seals every Zod Schema valve."',
    60,
    572
  );

  // 1px Cyan Raycast Laser Scan Line
  const scanY = Math.max(24, Math.min(h - 24, scanYNormalized * h));
  const grad = ctx.createLinearGradient(0, scanY - 24, 0, scanY + 24);
  grad.addColorStop(0, 'rgba(0, 229, 255, 0)');
  grad.addColorStop(0.5, 'rgba(0, 229, 255, 0.35)');
  grad.addColorStop(1, 'rgba(0, 229, 255, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(20, scanY - 24, w - 40, 48);

  ctx.strokeStyle = '#00E5FF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(20, scanY);
  ctx.lineTo(w - 20, scanY);
  ctx.stroke();
}

/**
 * Creates a soft radial contact shadow texture for grounding 3D stations on the floor.
 */
export function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(128, 128, 12, 128, 128, 120);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.78)');
  gradient.addColorStop(0.55, 'rgba(9, 9, 11, 0.42)');
  gradient.addColorStop(1, 'rgba(9, 9, 11, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}
