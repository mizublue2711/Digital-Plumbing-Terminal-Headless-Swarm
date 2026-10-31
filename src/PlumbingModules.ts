import * as THREE from 'three';
import { COLORS, HEADLESS_AGENTS } from './constants';
import { createDossierSchematicTexture, updateDossierCanvas } from './proceduralTextures';

// Reusable scratch vectors/matrices to ensure zero GC allocations in the 60fps loop
const _dummy = new THREE.Object3D();
const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();
const _color = new THREE.Color();

export interface HeroPipelineRefs {
  root: THREE.Group;
  valveWheelGroup: THREE.Group;
  valveLeverHitbox: THREE.Mesh;
  bloatDecoMesh: THREE.InstancedMesh;
  packetMesh: THREE.InstancedMesh;
  shockwaveRing: THREE.Mesh;
  pipeCurves: THREE.CatmullRomCurve3[];
  pipeWireframes: THREE.LineSegments[];
}

export interface TriCoreBentoRefs {
  root: THREE.Group;
  brainGroup: THREE.Group;
  brainPoints: THREE.Points;
  brainBasePositions: Float32Array;
  brainCurrentPositions: Float32Array;
  brainSynapseLines: THREE.LineSegments;
  brainHitbox: THREE.Mesh;
  muscleGroup: THREE.Group;
  crankShaftGroup: THREE.Group;
  connectingRod: THREE.Mesh;
  pistonHeadGroup: THREE.Group;
  valveCamRing: THREE.Mesh;
  muscleHitbox: THREE.Mesh;
  canvasGroup: THREE.Group;
  sandboxMesh: THREE.Mesh;
  sandboxWireframe: THREE.LineSegments;
  sandboxBasePositions: Float32Array;
  sandboxVelocities: Float32Array;
}

export interface PlumberSwarmRefs {
  root: THREE.Group;
  dossierGroup: THREE.Group;
  dossierScreenMesh: THREE.Mesh;
  dossierCanvasCtx: CanvasRenderingContext2D;
  dossierTexture: THREE.CanvasTexture;
  laserBeamMesh: THREE.Mesh;
  pylonsContainer: THREE.Group;
  agentNodes: Map<string, THREE.Group>;
  agentHitboxes: THREE.Mesh[];
  laserBeams: Map<string, THREE.Mesh>;
  conduitTubes: Map<string, THREE.Mesh>;
  conduitPackets: Map<string, THREE.Mesh>;
  zodValveWheels: THREE.Group[];
}

export interface IgnitionConsoleRefs {
  root: THREE.Group;
  plungerGroup: THREE.Group;
  buttonCapMesh: THREE.Mesh;
  ignitionHitbox: THREE.Mesh;
  coreGyroRings: THREE.Mesh[];
  pneumaticParticles: THREE.Points;
  pneumaticVelocities: Float32Array;
}

/**
 * STATION 01 // HERO SECTION: "BLOAT PURGE" & DARK QUARTZ PIPELINE NETWORK
 */
export function buildHeroPipelineStation(shadowTex: THREE.Texture): HeroPipelineRefs {
  const root = new THREE.Group();
  root.position.set(-4.2, 0, -2.4);

  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(3.4, 2.6),
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.65,
    })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = 0.01;
  root.add(shadowPlane);

  const brushedSteelMat = new THREE.MeshStandardMaterial({
    color: COLORS.TITANIUM_DARK,
    metalness: 0.88,
    roughness: 0.24,
  });
  const matteSlateMat = new THREE.MeshStandardMaterial({
    color: COLORS.CONCRETE_MATTE,
    metalness: 0.45,
    roughness: 0.68,
  });
  const indigoGlowMat = new THREE.MeshStandardMaterial({
    color: COLORS.ELECTRIC_INDIGO,
    emissive: COLORS.ELECTRIC_INDIGO,
    emissiveIntensity: 1.8,
    metalness: 0.3,
    roughness: 0.2,
  });
  const cyanGlowMat = new THREE.MeshStandardMaterial({
    color: COLORS.CYAN_LASER,
    emissive: COLORS.CYAN_LASER,
    emissiveIntensity: 2.0,
    metalness: 0.2,
    roughness: 0.2,
  });

  const basePlinth = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.14, 1.3), matteSlateMat);
  basePlinth.position.set(0, 0.07, 0);
  basePlinth.receiveShadow = true;
  root.add(basePlinth);

  for (const xOff of [-0.95, 0, 0.95]) {
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 1.15, 20), brushedSteelMat);
    column.position.set(xOff, 0.64, 0);
    column.castShadow = true;
    root.add(column);

    const lathePts = [
      new THREE.Vector2(0.05, 0),
      new THREE.Vector2(0.11, 0.02),
      new THREE.Vector2(0.11, 0.06),
      new THREE.Vector2(0.06, 0.08),
    ];
    const collar = new THREE.Mesh(new THREE.LatheGeometry(lathePts, 24), brushedSteelMat);
    collar.position.set(xOff, 1.16, 0);
    root.add(collar);
  }

  // Rectilinear 1px Swiss Tactical CAD & Dark Quartz Pipe Network
  const pipeCurves: THREE.CatmullRomCurve3[] = [
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.55, 1.72, -0.25),
      new THREE.Vector3(-0.65, 1.88, 0.12),
      new THREE.Vector3(0.0, 1.52, 0.0),
      new THREE.Vector3(0.75, 1.82, -0.15),
      new THREE.Vector3(1.55, 1.68, 0.2),
    ]),
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.55, 1.32, 0.2),
      new THREE.Vector3(-0.7, 1.18, -0.18),
      new THREE.Vector3(0.0, 1.48, 0.05),
      new THREE.Vector3(0.7, 1.22, 0.22),
      new THREE.Vector3(1.55, 1.35, -0.15),
    ]),
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.45, 2.02, 0.05),
      new THREE.Vector3(-0.45, 1.62, -0.22),
      new THREE.Vector3(0.45, 1.95, 0.18),
      new THREE.Vector3(1.45, 1.55, -0.08),
    ]),
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.45, 1.05, -0.12),
      new THREE.Vector3(-0.35, 1.38, 0.24),
      new THREE.Vector3(0.55, 1.08, -0.2),
      new THREE.Vector3(1.45, 1.24, 0.14),
    ]),
  ];

  const darkQuartzMat = new THREE.MeshPhysicalMaterial({
    color: 0xe2e8f0,
    metalness: 0.05,
    roughness: 0.06,
    transmission: 0.95,
    ior: 1.54,
    thickness: 0.2,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
  });

  const pipeWireframes: THREE.LineSegments[] = [];

  pipeCurves.forEach((curve, idx) => {
    const tubeGeo = new THREE.TubeGeometry(curve, 56, 0.042, 12, false);
    const tubeMesh = new THREE.Mesh(tubeGeo, darkQuartzMat);
    root.add(tubeMesh);

    const edgesGeo = new THREE.EdgesGeometry(tubeGeo, 12);
    const wireMat = new THREE.LineBasicMaterial({
      color: idx % 2 === 0 ? COLORS.ELECTRIC_INDIGO : COLORS.CYAN_LASER,
      transparent: true,
      opacity: 0.78,
    });
    const wireSegments = new THREE.LineSegments(edgesGeo, wireMat);
    root.add(wireSegments);
    pipeWireframes.push(wireSegments);
  });

  // Interactive "PURGE BLOAT" 3D Valve Assembly
  const valveWheelGroup = new THREE.Group();
  valveWheelGroup.position.set(0, 1.5, 0.24);
  root.add(valveWheelGroup);

  const hubMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.13, 0.12, 24),
    brushedSteelMat
  );
  hubMesh.rotation.x = Math.PI / 2;
  valveWheelGroup.add(hubMesh);

  const wheelRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.28, 0.032, 16, 48),
    new THREE.MeshStandardMaterial({
      color: COLORS.CYAN_LASER,
      emissive: COLORS.ELECTRIC_INDIGO,
      emissiveIntensity: 0.85,
      metalness: 0.8,
      roughness: 0.2,
    })
  );
  valveWheelGroup.add(wheelRim);

  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const spoke = new THREE.Mesh(
      new THREE.CylinderGeometry(0.016, 0.016, 0.54, 12),
      brushedSteelMat
    );
    spoke.rotation.z = angle;
    valveWheelGroup.add(spoke);
  }

  const leverArm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.024, 0.024, 0.44, 16),
    indigoGlowMat
  );
  leverArm.position.set(0, 0.22, 0.05);
  valveWheelGroup.add(leverArm);

  const leverGrip = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.042, 0.12, 8, 16),
    cyanGlowMat
  );
  leverGrip.rotation.z = Math.PI / 2;
  leverGrip.position.set(0, 0.42, 0.08);
  valveWheelGroup.add(leverGrip);

  const valveLeverHitbox = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 16, 16),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  valveLeverHitbox.position.set(0, 1.5, 0.24);
  valveLeverHitbox.name = 'HERO_PURGE_VALVE';
  root.add(valveLeverHitbox);

  // Instanced "Legacy AI Decorative Wallpaper Bloat" Clutter
  const bloatCount = 36;
  const bloatGeo = new THREE.OctahedronGeometry(0.075, 1);
  const bloatMat = new THREE.MeshStandardMaterial({
    color: COLORS.BLOAT_MAGENTA,
    emissive: 0x86198f,
    emissiveIntensity: 0.7,
    roughness: 0.25,
    metalness: 0.6,
    transparent: true,
    opacity: 0.9,
  });
  const bloatDecoMesh = new THREE.InstancedMesh(bloatGeo, bloatMat, bloatCount);
  bloatDecoMesh.frustumCulled = false;

  for (let i = 0; i < bloatCount; i++) {
    const angle = (i / bloatCount) * Math.PI * 2;
    const rad = 0.45 + (i % 4) * 0.28;
    _dummy.position.set(
      Math.cos(angle) * rad * 1.35,
      1.5 + Math.sin(angle * 2) * 0.48,
      (Math.sin(i * 1.7) - 0.5) * 0.45
    );
    _dummy.rotation.set(i * 0.4, i * 0.8, 0);
    _dummy.scale.setScalar(1);
    _dummy.updateMatrix();
    bloatDecoMesh.setMatrixAt(i, _dummy.matrix);
    bloatDecoMesh.setColorAt(
      i,
      _color.setHex(i % 2 === 0 ? COLORS.BLOAT_MAGENTA : COLORS.BLOAT_AMBER)
    );
  }
  bloatDecoMesh.instanceMatrix.needsUpdate = true;
  if (bloatDecoMesh.instanceColor) bloatDecoMesh.instanceColor.needsUpdate = true;
  root.add(bloatDecoMesh);

  // Instanced Zero-Latency Optical Fluid Stream Packets
  const packetCount = 60;
  const packetGeo = new THREE.BoxGeometry(0.08, 0.032, 0.032);
  const packetMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
  });
  const packetMesh = new THREE.InstancedMesh(packetGeo, packetMat, packetCount);
  packetMesh.frustumCulled = false;
  for (let i = 0; i < packetCount; i++) {
    packetMesh.setColorAt(
      i,
      _color.setHex(i % 2 === 0 ? COLORS.CYAN_LASER : COLORS.ELECTRIC_INDIGO)
    );
  }
  if (packetMesh.instanceColor) packetMesh.instanceColor.needsUpdate = true;
  root.add(packetMesh);

  const shockwaveRing = new THREE.Mesh(
    new THREE.RingGeometry(0.18, 0.26, 48),
    new THREE.MeshBasicMaterial({
      color: COLORS.CYAN_LASER,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
    })
  );
  shockwaveRing.position.set(0, 1.5, 0.25);
  root.add(shockwaveRing);

  return {
    root,
    valveWheelGroup,
    valveLeverHitbox,
    bloatDecoMesh,
    packetMesh,
    shockwaveRing,
    pipeCurves,
    pipeWireframes,
  };
}

/**
 * STATION 02 // WHAT WE ACTUALLY DO: "TRI-CORE BENTO GRID"
 */
export function buildTriCoreBentoStation(shadowTex: THREE.Texture): TriCoreBentoRefs {
  const root = new THREE.Group();
  root.position.set(0, 0, -2.35);

  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(4.2, 2.4),
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.65,
    })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = 0.01;
  root.add(shadowPlane);

  const frameMat = new THREE.MeshStandardMaterial({
    color: COLORS.TITANIUM_DARK,
    metalness: 0.85,
    roughness: 0.28,
  });

  const bayOffsets = [-1.25, 0.0, 1.25];
  for (const bx of bayOffsets) {
    const bayGroup = new THREE.Group();
    bayGroup.position.set(bx, 1.45, 0);
    root.add(bayGroup);

    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.9, 16), frameMat);
    pillar.position.set(0, -1.0, 0);
    bayGroup.add(pillar);

    const cageGeo = new THREE.BoxGeometry(1.08, 1.12, 0.62);
    const cageEdges = new THREE.EdgesGeometry(cageGeo);
    const cageLines = new THREE.LineSegments(
      cageEdges,
      new THREE.LineBasicMaterial({
        color: COLORS.CYAN_LASER,
        transparent: true,
        opacity: 0.38,
      })
    );
    bayGroup.add(cageLines);

    const plateTop = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.04, 0.64), frameMat);
    plateTop.position.y = 0.56;
    bayGroup.add(plateTop);

    const plateBot = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.05, 0.64), frameMat);
    plateBot.position.y = -0.56;
    bayGroup.add(plateBot);
  }

  // MODULE 1: THE BRAIN (Decoupled Reasoning Engines)
  const brainGroup = new THREE.Group();
  brainGroup.position.set(-1.25, 1.45, 0);
  root.add(brainGroup);

  const numNodes = 260;
  const brainBasePositions = new Float32Array(numNodes * 3);
  const brainCurrentPositions = new Float32Array(numNodes * 3);
  const brainColors = new Float32Array(numNodes * 3);

  for (let i = 0; i < numNodes; i++) {
    const phi = Math.acos(1 - (2 * (i + 0.5)) / numNodes);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const r = 0.34 + (i % 5) * 0.018;

    let x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.cos(phi) * 0.88;
    const z = r * Math.sin(phi) * Math.sin(theta) * 0.82;
    x += x > 0 ? 0.03 : -0.03;

    brainBasePositions[i * 3] = x;
    brainBasePositions[i * 3 + 1] = y;
    brainBasePositions[i * 3 + 2] = z;

    brainCurrentPositions[i * 3] = x;
    brainCurrentPositions[i * 3 + 1] = y;
    brainCurrentPositions[i * 3 + 2] = z;

    const c = i % 3 === 0 ? new THREE.Color(COLORS.CYAN_LASER) : new THREE.Color(COLORS.ELECTRIC_INDIGO);
    brainColors[i * 3] = c.r;
    brainColors[i * 3 + 1] = c.g;
    brainColors[i * 3 + 2] = c.b;
  }

  const brainGeo = new THREE.BufferGeometry();
  brainGeo.setAttribute(
    'position',
    new THREE.BufferAttribute(brainCurrentPositions, 3).setUsage(THREE.DynamicDrawUsage)
  );
  brainGeo.setAttribute('color', new THREE.BufferAttribute(brainColors, 3));

  const brainPoints = new THREE.Points(
    brainGeo,
    new THREE.PointsMaterial({
      size: 0.026,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      sizeAttenuation: true,
    })
  );
  brainGroup.add(brainPoints);

  const synapsePositions = new Float32Array(180 * 6);
  const synapseGeo = new THREE.BufferGeometry();
  synapseGeo.setAttribute(
    'position',
    new THREE.BufferAttribute(synapsePositions, 3).setUsage(THREE.DynamicDrawUsage)
  );
  const brainSynapseLines = new THREE.LineSegments(
    synapseGeo,
    new THREE.LineBasicMaterial({
      color: COLORS.CYAN_LASER,
      transparent: true,
      opacity: 0.35,
    })
  );
  brainGroup.add(brainSynapseLines);

  const brainHitbox = new THREE.Mesh(
    new THREE.SphereGeometry(0.48, 16, 16),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  brainHitbox.name = 'BENTO_BRAIN_HITBOX';
  brainGroup.add(brainHitbox);

  // MODULE 2: THE MUSCLE (Deterministic Execution Piston & Valve Mechanism)
  const muscleGroup = new THREE.Group();
  muscleGroup.position.set(0.0, 1.45, 0);
  root.add(muscleGroup);

  const sleeveGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.62, 24, 1, true);
  const sleeveMesh = new THREE.Mesh(
    sleeveGeo,
    new THREE.MeshPhysicalMaterial({
      color: 0x09090b,
      metalness: 0.2,
      roughness: 0.15,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  sleeveMesh.position.y = 0.14;
  muscleGroup.add(sleeveMesh);

  const crankShaftGroup = new THREE.Group();
  crankShaftGroup.position.set(0, -0.24, 0);
  muscleGroup.add(crankShaftGroup);

  const crankWheelA = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.14, 0.03, 24),
    frameMat
  );
  crankWheelA.rotation.x = Math.PI / 2;
  crankWheelA.position.z = 0.05;
  crankShaftGroup.add(crankWheelA);

  const crankWheelB = crankWheelA.clone();
  crankWheelB.position.z = -0.05;
  crankShaftGroup.add(crankWheelB);

  const crankPin = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 0.14, 16),
    new THREE.MeshStandardMaterial({
      color: COLORS.CYAN_LASER,
      emissive: COLORS.CYAN_LASER,
      emissiveIntensity: 1.2,
    })
  );
  crankPin.rotation.x = Math.PI / 2;
  crankPin.position.set(0.09, 0, 0);
  crankShaftGroup.add(crankPin);

  const pistonHeadGroup = new THREE.Group();
  pistonHeadGroup.position.set(0, 0.15, 0);
  muscleGroup.add(pistonHeadGroup);

  const pistonCrown = new THREE.Mesh(
    new THREE.CylinderGeometry(0.195, 0.195, 0.16, 28),
    new THREE.MeshStandardMaterial({
      color: 0xa1a1aa,
      metalness: 0.92,
      roughness: 0.18,
    })
  );
  pistonHeadGroup.add(pistonCrown);

  for (const ry of [-0.04, 0.0, 0.04]) {
    const compRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.198, 0.008, 12, 32),
      new THREE.MeshBasicMaterial({ color: COLORS.ELECTRIC_INDIGO })
    );
    compRing.rotation.x = Math.PI / 2;
    compRing.position.y = ry;
    pistonHeadGroup.add(compRing);
  }

  const connectingRod = new THREE.Mesh(
    new THREE.BoxGeometry(0.036, 0.34, 0.028),
    frameMat
  );
  muscleGroup.add(connectingRod);

  const valveCamRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.16, 0.02, 12, 32),
    new THREE.MeshStandardMaterial({
      color: COLORS.CYAN_LASER,
      emissive: COLORS.CYAN_LASER,
      emissiveIntensity: 0.9,
    })
  );
  valveCamRing.position.set(0, 0.44, 0);
  muscleGroup.add(valveCamRing);

  const muscleHitbox = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.95, 0.5),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  muscleHitbox.name = 'BENTO_MUSCLE_HITBOX';
  muscleGroup.add(muscleHitbox);

  // MODULE 3: THE CANVAS (Interactive 3D Sandbox & $0.00 Cloud Render)
  const canvasGroup = new THREE.Group();
  canvasGroup.position.set(1.25, 1.45, 0);
  root.add(canvasGroup);

  const icoGeo = new THREE.IcosahedronGeometry(0.31, 3);
  const posAttr = icoGeo.attributes.position as THREE.BufferAttribute;
  const sandboxBasePositions = new Float32Array(posAttr.array.length);
  sandboxBasePositions.set(posAttr.array);
  const sandboxVelocities = new Float32Array(posAttr.count);
  posAttr.setUsage(THREE.DynamicDrawUsage);

  const sandboxMat = new THREE.MeshPhysicalMaterial({
    color: COLORS.ELECTRIC_INDIGO,
    emissive: 0x1e1b4b,
    emissiveIntensity: 0.65,
    metalness: 0.72,
    roughness: 0.18,
    clearcoat: 1.0,
    clearcoatRoughness: 0.12,
    flatShading: true,
  });

  const sandboxMesh = new THREE.Mesh(icoGeo, sandboxMat);
  sandboxMesh.name = 'BENTO_CANVAS_SANDBOX';
  canvasGroup.add(sandboxMesh);

  const sandboxWireframe = new THREE.LineSegments(
    new THREE.WireframeGeometry(icoGeo),
    new THREE.LineBasicMaterial({
      color: COLORS.CYAN_LASER,
      transparent: true,
      opacity: 0.55,
    })
  );
  canvasGroup.add(sandboxWireframe);

  return {
    root,
    brainGroup,
    brainPoints,
    brainBasePositions,
    brainCurrentPositions,
    brainSynapseLines,
    brainHitbox,
    muscleGroup,
    crankShaftGroup,
    connectingRod,
    pistonHeadGroup,
    valveCamRing,
    muscleHitbox,
    canvasGroup,
    sandboxMesh,
    sandboxWireframe,
    sandboxBasePositions,
    sandboxVelocities,
  };
}

/**
 * STATION 03 // MEET THE FOUNDER: "THE DIGITAL PLUMBER & THE HEADLESS SWARM PYLONS"
 * - Inside the Cleanroom (X = 4.2, Z = -2.4): Tactical Plumbing Workbench & Lead Plumber Dossier
 * - Outside in the Brutalist Courtyard (over the Obsidian Water Mirror): 5 Angular Metallic Pylons
 *   levitating magnetically a few centimeters above the water surface, firing 1px Cyan laser
 *   telemetry beams and Dark Quartz optical conduits back through the glass wall into the Founder's Workbench!
 */
export function buildPlumberSwarmStation(shadowTex: THREE.Texture): PlumberSwarmRefs {
  const root = new THREE.Group();
  root.position.set(4.2, 0, -2.4);

  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 2.6),
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.68,
    })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = 0.01;
  root.add(shadowPlane);

  const metalMat = new THREE.MeshStandardMaterial({
    color: COLORS.TITANIUM_DARK,
    metalness: 0.9,
    roughness: 0.22,
  });

  // 1. Tactical Plumbing Workbench Table inside Cleanroom
  const workbenchTop = new THREE.Mesh(
    new THREE.BoxGeometry(2.1, 0.08, 1.15),
    metalMat
  );
  workbenchTop.position.set(0, 0.92, 0);
  root.add(workbenchTop);

  for (const [lx, lz] of [
    [-0.92, -0.45],
    [0.92, -0.45],
    [-0.92, 0.45],
    [0.92, 0.45],
  ]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.92, 16), metalMat);
    leg.position.set(lx, 0.46, lz);
    root.add(leg);
  }

  // 3 Physical Zod Schema Check Valves mounted on the workbench
  const zodValveWheels: THREE.Group[] = [];
  for (const vx of [-0.55, 0, 0.55]) {
    const vGroup = new THREE.Group();
    vGroup.position.set(vx, 1.02, 0.36);
    root.add(vGroup);

    const vRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.09, 0.014, 12, 24),
      new THREE.MeshStandardMaterial({
        color: COLORS.CYAN_LASER,
        emissive: COLORS.CYAN_LASER,
        emissiveIntensity: 0.7,
        metalness: 0.8,
        roughness: 0.2,
      })
    );
    vRim.rotation.x = Math.PI / 2;
    vGroup.add(vRim);

    const vCross = new THREE.Mesh(
      new THREE.BoxGeometry(0.17, 0.015, 0.015),
      metalMat
    );
    vGroup.add(vCross);
    zodValveWheels.push(vGroup);
  }

  // 2. Lead Plumber Dossier ID Plate (Centered above workbench at y = 1.54)
  const dossierGroup = new THREE.Group();
  dossierGroup.position.set(0, 1.54, 0);
  root.add(dossierGroup);

  const backingMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1.24, 0.78, 0.045),
    metalMat
  );
  dossierGroup.add(backingMesh);

  const dossierTexture = createDossierSchematicTexture(false, 'n8n', 0.5);
  const dossierCanvasCtx = (dossierTexture.image as HTMLCanvasElement).getContext('2d')!;

  const dossierScreenMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1.16, 0.72),
    new THREE.MeshBasicMaterial({
      map: dossierTexture,
    })
  );
  dossierScreenMesh.position.z = 0.025;
  dossierScreenMesh.name = 'FOUNDER_DOSSIER_PLATE';
  dossierGroup.add(dossierScreenMesh);

  const laserBeamMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1.22, 0.008, 0.02),
    new THREE.MeshBasicMaterial({
      color: COLORS.CYAN_LASER,
    })
  );
  laserBeamMesh.position.set(0, 0, 0.036);
  dossierGroup.add(laserBeamMesh);

  // ===========================================================================
  // 3. THE HEADLESS SWARM PYLONS (5 Magnetic Angular Pylon Towers over the Courtyard Water Mirror)
  // ===========================================================================
  const pylonsContainer = new THREE.Group();
  root.add(pylonsContainer);

  const agentNodes = new Map<string, THREE.Group>();
  const agentHitboxes: THREE.Mesh[] = [];
  const laserBeams = new Map<string, THREE.Mesh>();
  const conduitTubes = new Map<string, THREE.Mesh>();
  const conduitPackets = new Map<string, THREE.Mesh>();

  // Pylon positions relative to root (4.2, 0, -2.4) so they stand across the Obsidian Water Mirror in the Courtyard!
  const pylonRelCoords: [number, number][] = [
    [-2.8, 1.65], // n8n
    [-1.6, 2.25], // Dify
    [-0.4, 2.55], // Claude
    [0.65, 2.15], // Gemini
    [1.45, 1.55], // Remotion
  ];

  HEADLESS_AGENTS.forEach((agent, idx) => {
    const [px, pz] = pylonRelCoords[idx];
    const pylonGroup = new THREE.Group();
    // Levitating 8 cm (0.08m) above the Obsidian Water Mirror via magnetic repulsion
    pylonGroup.position.set(px, 0.08, pz);
    pylonsContainer.add(pylonGroup);

    // Magnetic Repulsion Halo Ring hovering just above the water mirror surface
    const magHalo = new THREE.Mesh(
      new THREE.RingGeometry(0.18, 0.24, 6),
      new THREE.MeshBasicMaterial({
        color: COLORS.CYAN_LASER,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75,
      })
    );
    magHalo.rotation.x = -Math.PI / 2;
    magHalo.position.y = -0.04;
    pylonGroup.add(magHalo);

    // Lower Angular Brutalist Pylon Obelisk Body (Hexagonal/Octagonal Tapered Monolith)
    const pylonBodyGeo = new THREE.CylinderGeometry(0.08, 0.17, 1.35, 6);
    const pylonBodyMesh = new THREE.Mesh(pylonBodyGeo, metalMat);
    pylonBodyMesh.position.y = 0.68;
    pylonBodyMesh.castShadow = true;
    pylonGroup.add(pylonBodyMesh);

    // 1px Swiss CAD Wireframe on Pylon Monolith
    const bodyWire = new THREE.LineSegments(
      new THREE.EdgesGeometry(pylonBodyGeo),
      new THREE.LineBasicMaterial({
        color: idx === 0 ? COLORS.CYAN_LASER : COLORS.ELECTRIC_INDIGO,
        transparent: true,
        opacity: 0.7,
      })
    );
    pylonBodyMesh.add(bodyWire);

    // Upper Crown Emitter Spire (Height = 1.52m)
    const spireCrystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.11, 0),
      new THREE.MeshStandardMaterial({
        color: agent.pipeColor,
        emissive: agent.pipeColor,
        emissiveIntensity: idx === 0 ? 2.2 : 0.75,
        metalness: 0.6,
        roughness: 0.15,
      })
    );
    spireCrystal.position.y = 1.52;
    spireCrystal.name = 'PYLON_SPIRE_CRYSTAL';
    pylonGroup.add(spireCrystal);

    // Interactive Hitbox for clicking the Pylon Tower
    const hitbox = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 1.8, 12),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hitbox.position.y = 0.9;
    hitbox.name = `SWARM_AGENT_${agent.id}`;
    hitbox.userData = { agentId: agent.id };
    pylonGroup.add(hitbox);
    agentHitboxes.push(hitbox);
    agentNodes.set(agent.id, pylonGroup);

    // 1px Cyan Laser Telemetry Beam shooting from Pylon Apex (px, 1.60, pz) straight through the Glass Wall into Founder's Dossier!
    const startVec = new THREE.Vector3(px, 1.6, pz);
    const targetVec = new THREE.Vector3((idx - 2) * 0.18, 1.54, 0.04);
    const beamDist = startVec.distanceTo(targetVec);
    const beamMid = startVec.clone().add(targetVec).multiplyScalar(0.5);

    const laserCylGeo = new THREE.CylinderGeometry(0.004, 0.004, beamDist, 8);
    laserCylGeo.rotateX(Math.PI / 2);
    const laserCylMat = new THREE.MeshBasicMaterial({
      color: COLORS.CYAN_LASER,
      transparent: true,
      opacity: idx === 0 ? 0.98 : 0.35,
    });
    const laserBeam = new THREE.Mesh(laserCylGeo, laserCylMat);
    laserBeam.position.copy(beamMid);
    laserBeam.lookAt(targetVec);
    laserBeam.xb = { pointerEvents: 'none' };

    // Outer Volumetric UnrealBloom Halo Sheath for the 1px Cyan Laser
    const bloomHaloGeo = new THREE.CylinderGeometry(0.022, 0.022, beamDist, 8);
    bloomHaloGeo.rotateX(Math.PI / 2);
    const bloomHaloMat = new THREE.MeshBasicMaterial({
      color: COLORS.CYAN_LASER,
      transparent: true,
      opacity: idx === 0 ? 0.32 : 0.08,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const bloomHaloMesh = new THREE.Mesh(bloomHaloGeo, bloomHaloMat);
    bloomHaloMesh.name = 'LASER_BLOOM_HALO';
    laserBeam.add(bloomHaloMesh);

    root.add(laserBeam);
    laserBeams.set(agent.id, laserBeam);

    // Submerged/Low-slung Dark Quartz Optical Conduit Pipe linking Pylon Base into the Cleanroom Workbench Zod Valve
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(px, 1.52, pz),
      new THREE.Vector3(px * 0.55, 1.18, pz * 0.45),
      new THREE.Vector3((idx - 2) * 0.22, 1.02, 0.36),
    ]);
    const tubeGeo = new THREE.TubeGeometry(curve, 36, 0.018, 8, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: agent.pipeColor,
      emissive: agent.pipeColor,
      emissiveIntensity: idx === 0 ? 2.4 : 0.2,
      transparent: true,
      opacity: idx === 0 ? 0.95 : 0.3,
      roughness: 0.15,
      metalness: 0.5,
    });
    const conduitMesh = new THREE.Mesh(tubeGeo, tubeMat);
    conduitMesh.userData = { curve };
    conduitMesh.xb = { pointerEvents: 'none' };
    root.add(conduitMesh);
    conduitTubes.set(agent.id, conduitMesh);

    const pulseSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.042, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    pulseSphere.visible = idx === 0;
    pulseSphere.xb = { pointerEvents: 'none' };
    root.add(pulseSphere);
    conduitPackets.set(agent.id, pulseSphere);
  });

  return {
    root,
    dossierGroup,
    dossierScreenMesh,
    dossierCanvasCtx,
    dossierTexture,
    laserBeamMesh,
    pylonsContainer,
    agentNodes,
    agentHitboxes,
    laserBeams,
    conduitTubes,
    conduitPackets,
    zodValveWheels,
  };
}

/**
 * STATION 04 // JOIN THE CRAFT: "ENGINE IGNITION TERMINAL" (CTA)
 */
export function buildIgnitionConsoleStation(shadowTex: THREE.Texture): IgnitionConsoleRefs {
  const root = new THREE.Group();
  root.position.set(0, 0, 0.35);

  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 2.4),
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.72,
    })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = 0.01;
  root.add(shadowPlane);

  const armorMat = new THREE.MeshStandardMaterial({
    color: COLORS.TITANIUM_DARK,
    metalness: 0.9,
    roughness: 0.22,
  });

  const baseBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.58, 0.72, 0.96, 8),
    armorMat
  );
  baseBody.position.y = 0.48;
  root.add(baseBody);

  const bezelCollar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.46, 0.56, 0.16, 32),
    new THREE.MeshStandardMaterial({
      color: COLORS.CONCRETE_MATTE,
      metalness: 0.7,
      roughness: 0.35,
    })
  );
  bezelCollar.position.y = 1.02;
  root.add(bezelCollar);

  const plungerGroup = new THREE.Group();
  plungerGroup.position.set(0, 1.12, 0);
  root.add(plungerGroup);

  const buttonCapMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.35, 0.14, 36),
    new THREE.MeshStandardMaterial({
      color: COLORS.ELECTRIC_INDIGO,
      emissive: COLORS.ELECTRIC_INDIGO,
      emissiveIntensity: 1.65,
      metalness: 0.45,
      roughness: 0.18,
    })
  );
  plungerGroup.add(buttonCapMesh);

  const crownRing = new THREE.Mesh(
    new THREE.RingGeometry(0.22, 0.27, 36),
    new THREE.MeshBasicMaterial({
      color: COLORS.CYAN_LASER,
      side: THREE.DoubleSide,
    })
  );
  crownRing.rotation.x = -Math.PI / 2;
  crownRing.position.y = 0.072;
  plungerGroup.add(crownRing);

  const ignitionHitbox = new THREE.Mesh(
    new THREE.CylinderGeometry(0.44, 0.44, 0.35, 24),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  ignitionHitbox.position.set(0, 1.15, 0);
  ignitionHitbox.name = 'IGNITION_LAUNCH_BUTTON';
  root.add(ignitionHitbox);

  const coreGyroRings: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.22 + i * 0.06, 0.012, 12, 36),
      new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? COLORS.CYAN_LASER : COLORS.ELECTRIC_INDIGO,
        emissive: i % 2 === 0 ? COLORS.CYAN_LASER : COLORS.ELECTRIC_INDIGO,
        emissiveIntensity: 1.1,
        metalness: 0.8,
        roughness: 0.2,
      })
    );
    ring.position.set(0, 1.52, 0);
    root.add(ring);
    coreGyroRings.push(ring);
  }

  const pCount = 180;
  const pPositions = new Float32Array(pCount * 3);
  const pVelocities = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const speed = 0.8 + Math.random() * 2.2;
    pPositions[i * 3] = Math.cos(theta) * 0.35;
    pPositions[i * 3 + 1] = 1.08;
    pPositions[i * 3 + 2] = Math.sin(theta) * 0.35;

    pVelocities[i * 3] = Math.cos(theta) * speed;
    pVelocities[i * 3 + 1] = 0.6 + Math.random() * 1.8;
    pVelocities[i * 3 + 2] = Math.sin(theta) * speed;
  }

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute(
    'position',
    new THREE.BufferAttribute(pPositions, 3).setUsage(THREE.DynamicDrawUsage)
  );
  const pneumaticParticles = new THREE.Points(
    pGeo,
    new THREE.PointsMaterial({
      color: COLORS.CYAN_LASER,
      size: 0.035,
      transparent: true,
      opacity: 0.0,
    })
  );
  root.add(pneumaticParticles);

  return {
    root,
    plungerGroup,
    buttonCapMesh,
    ignitionHitbox,
    coreGyroRings,
    pneumaticParticles,
    pneumaticVelocities: pVelocities,
  };
}

/**
 * Per-frame deterministic update of all 4 3D stations with zero GC allocations.
 */
export function updateAllStations(
  elapsedTime: number,
  dt: number,
  hero: HeroPipelineRefs,
  bento: TriCoreBentoRefs,
  plumber: PlumberSwarmRefs,
  ignition: IgnitionConsoleRefs,
  options: {
    purgeProgress: number;
    shockwaveProgress: number;
    shockwaveActive: boolean;
    brainMagnetPointLocal: THREE.Vector3 | null;
    activeAgentId: string;
    dossierHovered: boolean;
    ignitionTriggered: boolean;
    ignitionProgress: number;
    onPistonCycleIncrement: () => void;
    onBrainMetricsUpdate: (activeNodes: number, coherence: number) => void;
  }
) {
  // 1. HERO STATION UPDATE
  const targetWheelRot = -options.purgeProgress * Math.PI * 1.5;
  hero.valveWheelGroup.rotation.z = THREE.MathUtils.damp(
    hero.valveWheelGroup.rotation.z,
    targetWheelRot,
    8,
    dt
  );

  const bloatCount = hero.bloatDecoMesh.count;
  const keepRatio = Math.max(0, 1 - options.purgeProgress * 1.15);
  for (let i = 0; i < bloatCount; i++) {
    const angle = (i / bloatCount) * Math.PI * 2 + elapsedTime * 0.45 * keepRatio;
    const rad = (0.45 + (i % 4) * 0.28) * (1 + options.purgeProgress * 1.8);
    _dummy.position.set(
      Math.cos(angle) * rad * 1.35,
      1.5 + Math.sin(angle * 2 + elapsedTime) * 0.48,
      (Math.sin(i * 1.7) - 0.5) * 0.45
    );
    _dummy.rotation.set(elapsedTime + i, elapsedTime * 0.7 + i, 0);
    _dummy.scale.setScalar(keepRatio);
    _dummy.updateMatrix();
    hero.bloatDecoMesh.setMatrixAt(i, _dummy.matrix);
  }
  hero.bloatDecoMesh.instanceMatrix.needsUpdate = true;

  const packetSpeed = 0.25 + options.purgeProgress * 0.6;
  const packetCount = hero.packetMesh.count;
  for (let i = 0; i < packetCount; i++) {
    const curveIdx = i % hero.pipeCurves.length;
    const curve = hero.pipeCurves[curveIdx];
    const t = ((i / packetCount) + elapsedTime * packetSpeed) % 1.0;
    curve.getPointAt(t, _vec3A);
    curve.getTangentAt(t, _vec3B);

    _dummy.position.copy(_vec3A);
    _vec3B.add(_vec3A);
    _dummy.lookAt(_vec3B);
    _dummy.scale.set(1 + options.purgeProgress * 0.8, 1, 1);
    _dummy.updateMatrix();
    hero.packetMesh.setMatrixAt(i, _dummy.matrix);
  }
  hero.packetMesh.instanceMatrix.needsUpdate = true;

  if (options.shockwaveActive) {
    hero.shockwaveRing.visible = true;
    const s = 1 + options.shockwaveProgress * 14.0;
    hero.shockwaveRing.scale.setScalar(s);
    (hero.shockwaveRing.material as THREE.MeshBasicMaterial).opacity =
      (1 - options.shockwaveProgress) * 0.9;
  } else {
    hero.shockwaveRing.visible = false;
  }

  // 2. TRI-CORE BENTO STATION UPDATE
  const brainPosAttr = bento.brainPoints.geometry.attributes.position as THREE.BufferAttribute;
  const curArr = bento.brainCurrentPositions;
  const baseArr = bento.brainBasePositions;
  const nCount = curArr.length / 3;
  let attractedCount = 0;

  for (let i = 0; i < nCount; i++) {
    const ix = i * 3;
    const bx = baseArr[ix];
    const by = baseArr[ix + 1];
    const bz = baseArr[ix + 2];

    let tx = bx + Math.sin(elapsedTime * 1.8 + i * 0.15) * 0.012;
    let ty = by + Math.cos(elapsedTime * 1.5 + i * 0.2) * 0.012;
    let tz = bz + Math.sin(elapsedTime * 1.3 + i * 0.1) * 0.012;

    if (options.brainMagnetPointLocal) {
      const dx = options.brainMagnetPointLocal.x - bx;
      const dy = options.brainMagnetPointLocal.y - by;
      const dz = options.brainMagnetPointLocal.z - bz;
      const distSq = dx * dx + dy * dy + dz * dz;
      if (distSq < 0.28) {
        attractedCount++;
        const pull = (1 - distSq / 0.28) * 0.45;
        tx += dx * pull;
        ty += dy * pull;
        tz += dz * pull;
      }
    }

    curArr[ix] += (tx - curArr[ix]) * Math.min(1, dt * 10);
    curArr[ix + 1] += (ty - curArr[ix + 1]) * Math.min(1, dt * 10);
    curArr[ix + 2] += (tz - curArr[ix + 2]) * Math.min(1, dt * 10);
  }
  brainPosAttr.needsUpdate = true;
  bento.brainPoints.rotation.y = elapsedTime * 0.18;
  bento.brainSynapseLines.rotation.y = elapsedTime * 0.18;

  const synAttr = bento.brainSynapseLines.geometry.attributes.position as THREE.BufferAttribute;
  const synArr = synAttr.array as Float32Array;
  for (let s = 0; s < 180; s++) {
    const a = (s * 3) % nCount;
    const b = (s * 3 + 7) % nCount;
    const si = s * 6;
    synArr[si] = curArr[a * 3];
    synArr[si + 1] = curArr[a * 3 + 1];
    synArr[si + 2] = curArr[a * 3 + 2];
    synArr[si + 3] = curArr[b * 3];
    synArr[si + 4] = curArr[b * 3 + 1];
    synArr[si + 5] = curArr[b * 3 + 2];
  }
  synAttr.needsUpdate = true;

  if (attractedCount > 0) {
    options.onBrainMetricsUpdate(attractedCount, 99.98);
  }

  // Module 2: The Muscle (100% Deterministic Crankshaft + Piston Kinematics)
  const omega = 5.5;
  const prevCycle = Math.floor(((elapsedTime - dt) * omega) / (Math.PI * 2));
  const currCycle = Math.floor((elapsedTime * omega) / (Math.PI * 2));
  if (currCycle > prevCycle && dt > 0) {
    options.onPistonCycleIncrement();
  }

  const crankAngle = elapsedTime * omega;
  bento.crankShaftGroup.rotation.z = crankAngle;
  const crankRadius = 0.09;
  const rodLength = 0.34;
  const pinX = Math.cos(crankAngle) * crankRadius;
  const pinY = -0.24 + Math.sin(crankAngle) * crankRadius;

  const pistonY = pinY + Math.sqrt(Math.max(0.01, rodLength * rodLength - pinX * pinX));
  bento.pistonHeadGroup.position.y = pistonY;

  bento.connectingRod.position.set(pinX * 0.5, (pinY + pistonY) * 0.5, 0);
  bento.connectingRod.rotation.z = Math.atan2(pinX, pistonY - pinY);
  bento.valveCamRing.rotation.y = -crankAngle * 0.5;

  // Module 3: The Canvas (Interactive Deformable Sandbox Spring Recovery)
  const sbPosAttr = bento.sandboxMesh.geometry.attributes.position as THREE.BufferAttribute;
  const sbArr = sbPosAttr.array as Float32Array;
  const sbBase = bento.sandboxBasePositions;
  const sbVel = bento.sandboxVelocities;
  const vCount = sbPosAttr.count;
  let needsNormals = false;

  for (let i = 0; i < vCount; i++) {
    const ix = i * 3;
    const bx = sbBase[ix];
    const by = sbBase[ix + 1];
    const bz = sbBase[ix + 2];

    const cx = sbArr[ix];
    const cy = sbArr[ix + 1];
    const cz = sbArr[ix + 2];

    const dispX = cx - bx;
    const dispY = cy - by;
    const dispZ = cz - bz;
    const dist = Math.abs(dispX) + Math.abs(dispY) + Math.abs(dispZ);

    if (dist > 0.0005 || Math.abs(sbVel[i]) > 0.0005) {
      needsNormals = true;
      sbVel[i] = (sbVel[i] - dist * 18.0 * dt) * Math.exp(-3.5 * dt);
      const factor = 1 + sbVel[i] * dt;
      sbArr[ix] = THREE.MathUtils.damp(cx * factor, bx, 5, dt);
      sbArr[ix + 1] = THREE.MathUtils.damp(cy * factor, by, 5, dt);
      sbArr[ix + 2] = THREE.MathUtils.damp(cz * factor, bz, 5, dt);
    }
  }
  if (needsNormals) {
    sbPosAttr.needsUpdate = true;
    bento.sandboxMesh.geometry.computeVertexNormals();
  }
  bento.sandboxMesh.rotation.y = elapsedTime * 0.35;
  bento.sandboxMesh.rotation.x = Math.sin(elapsedTime * 0.5) * 0.2;
  bento.sandboxWireframe.rotation.copy(bento.sandboxMesh.rotation);

  // 3. PLUMBER & MAGNETIC COURTYARD PYLONS UPDATE
  const scanNorm = (Math.sin(elapsedTime * 2.2) + 1) * 0.5;
  plumber.laserBeamMesh.position.y = (0.5 - scanNorm) * 0.68;

  if (Math.floor(elapsedTime * 20) !== Math.floor((elapsedTime - dt) * 20)) {
    updateDossierCanvas(
      plumber.dossierCanvasCtx,
      1024,
      640,
      options.dossierHovered,
      options.activeAgentId,
      scanNorm
    );
    plumber.dossierTexture.needsUpdate = true;
  }

  // Magnetic Levitation of the 5 Courtyard Pylons above the Obsidian Water Mirror + Active Conduit Pulse
  HEADLESS_AGENTS.forEach((agent, idx) => {
    const pylon = plumber.agentNodes.get(agent.id);
    if (pylon) {
      // Smooth magnetic levitation 6cm–10cm above the Obsidian Water Mirror
      pylon.position.y = 0.08 + Math.sin(elapsedTime * 2.1 + idx * 1.1) * 0.018;
      const crystal = pylon.getObjectByName('PYLON_SPIRE_CRYSTAL');
      if (crystal) {
        crystal.rotation.y = elapsedTime * 1.8;
      }
    }

    const isSelected = agent.id === options.activeAgentId;
    const pulse = plumber.conduitPackets.get(agent.id);
    const conduit = plumber.conduitTubes.get(agent.id);
    if (pulse && conduit) {
      pulse.visible = isSelected;
      if (isSelected) {
        const curve = conduit.userData.curve as THREE.CatmullRomCurve3;
        const pt = (elapsedTime * 0.9) % 1.0;
        curve.getPointAt(pt, pulse.position);
      }
    }
  });

  for (const vw of plumber.zodValveWheels) {
    vw.rotation.y = elapsedTime * 1.8;
  }

  // 4. ENGINE IGNITION CONSOLE UPDATE
  ignition.coreGyroRings.forEach((ring, idx) => {
    const speedMult = options.ignitionTriggered ? 8.0 : 1.2;
    ring.rotation.x = elapsedTime * (0.8 + idx * 0.4) * speedMult;
    ring.rotation.y = elapsedTime * (1.1 - idx * 0.3) * speedMult;
  });

  const targetPlungerY = options.ignitionTriggered ? 1.05 : 1.12;
  ignition.plungerGroup.position.y = THREE.MathUtils.damp(
    ignition.plungerGroup.position.y,
    targetPlungerY,
    12,
    dt
  );

  const pMat = ignition.pneumaticParticles.material as THREE.PointsMaterial;
  if (options.ignitionTriggered) {
    pMat.opacity = Math.max(0, 1 - options.ignitionProgress * 0.85);
    const pAttr = ignition.pneumaticParticles.geometry.attributes.position as THREE.BufferAttribute;
    const pArr = pAttr.array as Float32Array;
    const pVel = ignition.pneumaticVelocities;
    const count = pAttr.count;
    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      pArr[ix] += pVel[ix] * dt;
      pArr[ix + 1] += pVel[ix + 1] * dt;
      pArr[ix + 2] += pVel[ix + 2] * dt;
    }
    pAttr.needsUpdate = true;
  } else {
    pMat.opacity = 0;
  }
}

/**
 * Deforms vertices on the Module 3 Sandbox Icosahedron around a local hit point.
 */
export function deformSandboxAtPoint(
  bento: TriCoreBentoRefs,
  worldPoint: THREE.Vector3
): number {
  const localPoint = _vec3A.copy(worldPoint);
  bento.sandboxMesh.worldToLocal(localPoint);

  const posAttr = bento.sandboxMesh.geometry.attributes.position as THREE.BufferAttribute;
  const arr = posAttr.array as Float32Array;
  const vel = bento.sandboxVelocities;
  let deformedVertices = 0;

  for (let i = 0; i < posAttr.count; i++) {
    const ix = i * 3;
    _vec3B.set(arr[ix], arr[ix + 1], arr[ix + 2]);
    const dist = _vec3B.distanceTo(localPoint);
    if (dist < 0.24) {
      deformedVertices++;
      const push = (1 - dist / 0.24) * 0.14;
      _vec3B.normalize().multiplyScalar(0.31 + push);
      arr[ix] = _vec3B.x;
      arr[ix + 1] = _vec3B.y;
      arr[ix + 2] = _vec3B.z;
      vel[i] = 3.2;
    }
  }
  posAttr.needsUpdate = true;
  bento.sandboxMesh.geometry.computeVertexNormals();
  return deformedVertices;
}
