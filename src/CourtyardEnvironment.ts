import * as THREE from 'three';
import { COLORS, HEADLESS_AGENTS } from './constants';
import {
  createBrutalistWallTexture,
  createSwissGridTexture,
  createTitaniumCladdingTexture,
  createValveStatusBadgeTexture,
} from './proceduralTextures';

const _dummy = new THREE.Object3D();
const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();
const _color = new THREE.Color();

export interface HexRippleWave {
  active: boolean;
  center: THREE.Vector3;
  radius: number;
  strength: number;
}

export interface CourtyardArchitectureRefs {
  root: THREE.Group;
  waterMirrorMesh: THREE.Mesh;
  archCurves: THREE.CatmullRomCurve3[];
  archFluidPackets: THREE.InstancedMesh;
  hexRippleRings: THREE.Group[];
  hexRipplesState: HexRippleWave[];
  cleanroomGlassWall: THREE.Mesh;
  valveJointRings: THREE.Mesh[];
  lightShaftCones: THREE.Mesh[];
  waterReflectionStrips: THREE.Mesh[];
}

/**
 * Builds the Deep Midnight (01:00 AM) Spatial Environment:
 * 1. Sky Dome transitioning from absolute black zenith (#050508) to velvet midnight blue horizon (#090912)
 *    paired with Electro-Volumetric Light Shafts where Cyan lasers & Indigo spotlights cut through the 0.012 fog.
 * 2. Indoor Cleanroom Wall (#121215 Brutalist stone-gray cast concrete with wide square 1px Swiss Grid tiles)
 *    & Matte Titanium Cladding (#18181E with 1px rivets).
 * 3. Outdoor Courtyard Floor (#09090B honed satin Obsidian concrete, Roughness: 0.15, 1px drainage channels)
 *    & towering Outdoor Anthracite Concrete Walls (#18181B).
 * 4. Quartz Glass Conduits (Transmission: 0.95) & Obsidian Water Mirror reflecting Indigo/Cyan laser beams at 60 FPS.
 */
export function buildCourtyardAndCleanroom(
  renderer?: THREE.WebGLRenderer
): CourtyardArchitectureRefs {
  const root = new THREE.Group();

  // ===========================================================================
  // 1. DEEP MIDNIGHT (01:00 AM) SKY DOME (#050508 Zenith -> #090912 Horizon)
  // ===========================================================================
  const skyGeo = new THREE.SphereGeometry(48, 32, 24);
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      uZenithColor: { value: new THREE.Color(COLORS.SKY_ZENITH) },
      uHorizonColor: { value: new THREE.Color(COLORS.SKY_HORIZON) },
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      varying vec3 vWorldPosition;
      uniform vec3 uZenithColor;
      uniform vec3 uHorizonColor;
      void main() {
        float h = normalize(vWorldPosition).y;
        float horizonFactor = 1.0 - smoothstep(-0.05, 0.55, abs(h));
        vec3 col = mix(uZenithColor, uHorizonColor, horizonFactor);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  const skyDome = new THREE.Mesh(skyGeo, skyMat);
  skyDome.xb = { pointerEvents: 'none' };
  root.add(skyDome);

  // ===========================================================================
  // 2. OUTDOOR COURTYARD HONED OBSIDIAN FLOOR (#09090B, Roughness: 0.15)
  // ===========================================================================
  const gridTex = createSwissGridTexture(renderer);
  const obsidianFloorMat = new THREE.MeshStandardMaterial({
    map: gridTex,
    color: 0xffffff,
    roughness: 0.15, // Satin-honed Obsidian concrete per specification
    metalness: 0.35,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  });

  const floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(38, 38), obsidianFloorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.position.y = 0;
  floorMesh.receiveShadow = true;
  floorMesh.xb = { pointerEvents: 'none' };
  root.add(floorMesh);

  // Under-slab Brutalist Chamfered Foundation floating in the midnight void
  const underSlab = new THREE.Mesh(
    new THREE.BoxGeometry(26, 0.5, 18),
    new THREE.MeshStandardMaterial({
      color: COLORS.BG_OBSIDIAN,
      roughness: 0.4,
      metalness: 0.35,
    })
  );
  underSlab.position.set(0, -0.26, -0.8);
  underSlab.xb = { pointerEvents: 'none' };
  root.add(underSlab);

  // ===========================================================================
  // 3. INDOOR CLEANROOM WALLS (#121215 Brutalist Concrete & #18181E Titanium Cladding)
  // ===========================================================================
  const brutalistWallTex = createBrutalistWallTexture(renderer);
  const indoorBrutalistMat = new THREE.MeshStandardMaterial({
    map: brutalistWallTex,
    color: 0xffffff,
    roughness: 0.86, // Raw cast textured concrete
    metalness: 0.15,
  });

  const titaniumTex = createTitaniumCladdingTexture(renderer);
  const titaniumCladdingMat = new THREE.MeshStandardMaterial({
    map: titaniumTex,
    color: 0xffffff,
    roughness: 0.42, // Matte anti-glare Titanium #18181E
    metalness: 0.78,
  });

  // Back Indoor Cleanroom Brutalist Wall (#121215) behind the 3 indoor stations
  const cleanroomBackWall = new THREE.Mesh(
    new THREE.BoxGeometry(15.2, 4.8, 0.45),
    indoorBrutalistMat
  );
  cleanroomBackWall.position.set(0, 2.4, -3.55);
  cleanroomBackWall.castShadow = true;
  cleanroomBackWall.receiveShadow = true;
  cleanroomBackWall.xb = { pointerEvents: 'none' };
  root.add(cleanroomBackWall);

  // Matte Titanium Cladding Panels (#18181E with 1px rivets) mounted along the Cleanroom wall & structural columns
  const buttressX = [-6.2, -2.2, 2.2, 6.2];
  for (const bx of buttressX) {
    const pillar = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 4.8, 0.72),
      titaniumCladdingMat
    );
    pillar.position.set(bx, 2.4, -2.75);
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    pillar.xb = { pointerEvents: 'none' };
    root.add(pillar);

    // 1px Swiss Tactical CAD Wireframe edge highlight
    const pEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(pillar.geometry),
      new THREE.LineBasicMaterial({
        color: COLORS.ELECTRIC_INDIGO,
        transparent: true,
        opacity: 0.52,
      })
    );
    pillar.add(pEdges);
  }

  // Upper Titanium Cladding Header Lintel (#18181E)
  const lintelBeam = new THREE.Mesh(
    new THREE.BoxGeometry(15.2, 0.52, 0.65),
    titaniumCladdingMat
  );
  lintelBeam.position.set(0, 4.55, -2.65);
  lintelBeam.castShadow = true;
  lintelBeam.xb = { pointerEvents: 'none' };
  root.add(lintelBeam);

  // ===========================================================================
  // 4. TOWERING OUTDOOR ANTHRACITE CONCRETE WALLS (#18181B) UNDER MIDNIGHT SKY
  // ===========================================================================
  const outdoorAnthraciteMat = new THREE.MeshStandardMaterial({
    color: COLORS.OUTDOOR_ANTHRACITE_WALL,
    roughness: 0.88,
    metalness: 0.18,
  });

  for (const sideX of [-8.4, 8.4]) {
    const anthraciteMonolith = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 7.6, 11.5),
      outdoorAnthraciteMat
    );
    anthraciteMonolith.position.set(sideX, 3.8, -0.5);
    anthraciteMonolith.castShadow = true;
    anthraciteMonolith.receiveShadow = true;
    anthraciteMonolith.xb = { pointerEvents: 'none' };
    root.add(anthraciteMonolith);

    // Vertical 1px Swiss CAD Expansion Joint lines on the towering Anthracite walls
    const wallWire = new THREE.LineSegments(
      new THREE.EdgesGeometry(anthraciteMonolith.geometry),
      new THREE.LineBasicMaterial({
        color: COLORS.ELECTRIC_INDIGO,
        transparent: true,
        opacity: 0.35,
      })
    );
    anthraciteMonolith.add(wallWire);
  }

  // Cleanroom Acoustic Glass Curtain Wall
  const cleanroomGlassWall = new THREE.Mesh(
    new THREE.PlaneGeometry(13.6, 4.2),
    new THREE.MeshPhysicalMaterial({
      color: 0x09090b,
      metalness: 0.1,
      roughness: 0.06,
      transmission: 0.9,
      transparent: true,
      opacity: 0.32,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  cleanroomGlassWall.position.set(0, 2.1, -2.12);
  cleanroomGlassWall.xb = { pointerEvents: 'none' };
  root.add(cleanroomGlassWall);

  // ===========================================================================
  // 5. OBSIDIAN WATER MIRROR & REAL-TIME 60 FPS INDIGO/CYAN REFLECTIONS
  // ===========================================================================
  const poolWidth = 10.4;
  const poolDepth = 4.0;
  const poolCenterZ = -0.05;

  const basinRimGeo = new THREE.BoxGeometry(poolWidth + 0.24, 0.06, poolDepth + 0.24);
  const basinRimEdges = new THREE.EdgesGeometry(basinRimGeo);
  const basinRimWire = new THREE.LineSegments(
    basinRimEdges,
    new THREE.LineBasicMaterial({
      color: COLORS.CYAN_LASER,
      transparent: true,
      opacity: 0.58,
    })
  );
  basinRimWire.position.set(0, 0.03, poolCenterZ);
  basinRimWire.xb = { pointerEvents: 'none' };
  root.add(basinRimWire);

  const waterMirrorGeo = new THREE.PlaneGeometry(poolWidth, poolDepth, 64, 32);
  const waterMirrorMat = new THREE.MeshPhysicalMaterial({
    color: 0x050508,
    emissive: 0x070614,
    emissiveIntensity: 0.55,
    metalness: 0.95,
    roughness: 0.03, // Mirror-like black Obsidian water surface
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
  });

  const waterMirrorMesh = new THREE.Mesh(waterMirrorGeo, waterMirrorMat);
  waterMirrorMesh.rotation.x = -Math.PI / 2;
  waterMirrorMesh.position.set(0, 0.022, poolCenterZ);
  waterMirrorMesh.receiveShadow = true;
  waterMirrorMesh.name = 'COURTYARD_WATER_MIRROR';
  root.add(waterMirrorMesh);

  // Dynamic Real-Time 60 FPS Water Mirror Specular Reflection Streaks (Indigo #5322FF & Cyan #00E5FF)
  const waterReflectionStrips: THREE.Mesh[] = [];
  for (let i = 0; i < 10; i++) {
    const isCyan = i % 2 === 0;
    const strip = new THREE.Mesh(
      new THREE.PlaneGeometry(isCyan ? 0.045 : 0.14, poolDepth - 0.25),
      new THREE.MeshBasicMaterial({
        color: isCyan ? COLORS.CYAN_LASER : COLORS.ELECTRIC_INDIGO,
        transparent: true,
        opacity: isCyan ? 0.42 : 0.28,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    strip.rotation.x = -Math.PI / 2;
    strip.position.set((i - 4.5) * 0.95, 0.025, poolCenterZ);
    strip.xb = { pointerEvents: 'none' };
    root.add(strip);
    waterReflectionStrips.push(strip);
  }

  // Pool of 12 Concentric Hexagonal Shockwave Ripple Rings (60 FPS zero-GC pool)
  const hexRippleRings: THREE.Group[] = [];
  const hexRipplesState: HexRippleWave[] = [];

  for (let i = 0; i < 12; i++) {
    const hexGroup = new THREE.Group();
    hexGroup.position.set(0, 0.028, poolCenterZ);
    hexGroup.visible = false;
    hexGroup.xb = { pointerEvents: 'none' };

    const outerHex = new THREE.Mesh(
      new THREE.RingGeometry(0.22, 0.255, 6),
      new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? COLORS.CYAN_LASER : COLORS.ELECTRIC_INDIGO,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    outerHex.rotation.x = -Math.PI / 2;
    hexGroup.add(outerHex);

    const innerHex = new THREE.Mesh(
      new THREE.RingGeometry(0.11, 0.135, 6),
      new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? COLORS.ELECTRIC_INDIGO : COLORS.CYAN_LASER,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    innerHex.rotation.x = -Math.PI / 2;
    hexGroup.add(innerHex);

    root.add(hexGroup);
    hexRippleRings.push(hexGroup);
    hexRipplesState.push({
      active: false,
      center: new THREE.Vector3(),
      radius: 0.1,
      strength: 0,
    });
  }

  // ===========================================================================
  // 6. TRANSPARENT QUARTZ PIPELINE ARCHES (Transmission: 0.95) & VALVE BEACONS
  // ===========================================================================
  const quartzGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0xe2e8f0,
    metalness: 0.05,
    roughness: 0.06,
    transmission: 0.95, // High-transmission Quartz Glass per specification
    ior: 1.54,
    thickness: 0.25,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
  });

  const archXPositions = [-4.6, -1.6, 1.6, 4.6];
  const archCurves: THREE.CatmullRomCurve3[] = [];
  const valveJointRings: THREE.Mesh[] = [];
  const badgeTexture = createValveStatusBadgeTexture();

  archXPositions.forEach((ax, idx) => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(ax, 2.8, -2.65),
      new THREE.Vector3(ax, 3.85, -1.5),
      new THREE.Vector3(ax, 3.65, 0.35),
      new THREE.Vector3(ax, 1.85, 1.65),
      new THREE.Vector3(ax, 0.05, 1.85),
    ]);
    archCurves.push(curve);

    const archTubeGeo = new THREE.TubeGeometry(curve, 48, 0.065, 12, false);
    const archTubeMesh = new THREE.Mesh(archTubeGeo, quartzGlassMat);
    archTubeMesh.xb = { pointerEvents: 'none' };
    root.add(archTubeMesh);

    const archWire = new THREE.LineSegments(
      new THREE.EdgesGeometry(archTubeGeo, 15),
      new THREE.LineBasicMaterial({
        color: idx % 2 === 0 ? COLORS.ELECTRIC_INDIGO : COLORS.CYAN_LASER,
        transparent: true,
        opacity: 0.42,
      })
    );
    archWire.xb = { pointerEvents: 'none' };
    root.add(archWire);

    const jointPos = new THREE.Vector3(ax, 1.85, 1.65);
    const jointRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.11, 0.022, 12, 24),
      new THREE.MeshStandardMaterial({
        color: COLORS.CYAN_LASER,
        emissive: idx % 2 === 0 ? COLORS.CYAN_LASER : COLORS.ELECTRIC_INDIGO,
        emissiveIntensity: 2.2,
        metalness: 0.85,
        roughness: 0.2,
      })
    );
    jointRing.position.copy(jointPos);
    jointRing.rotation.x = Math.PI / 3;
    jointRing.xb = { pointerEvents: 'none' };
    root.add(jointRing);
    valveJointRings.push(jointRing);

    const badgePlate = new THREE.Mesh(
      new THREE.PlaneGeometry(0.68, 0.13),
      new THREE.MeshBasicMaterial({
        map: badgeTexture,
        side: THREE.DoubleSide,
      })
    );
    badgePlate.position.set(ax, 1.55, 1.72);
    badgePlate.xb = { pointerEvents: 'none' };
    root.add(badgePlate);
  });

  // Instanced Optical Fluid Packets circulating inside the 4 Quartz Pipeline Arches
  const archPacketCount = 80;
  const archPacketGeo = new THREE.BoxGeometry(0.055, 0.055, 0.16);
  const archPacketMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const archFluidPackets = new THREE.InstancedMesh(
    archPacketGeo,
    archPacketMat,
    archPacketCount
  );
  archFluidPackets.frustumCulled = false;
  archFluidPackets.xb = { pointerEvents: 'none' };

  for (let i = 0; i < archPacketCount; i++) {
    archFluidPackets.setColorAt(
      i,
      _color.setHex(i % 2 === 0 ? COLORS.ELECTRIC_INDIGO : COLORS.CYAN_LASER)
    );
  }
  if (archFluidPackets.instanceColor) archFluidPackets.instanceColor.needsUpdate = true;
  root.add(archFluidPackets);

  // ===========================================================================
  // 7. ELECTRO-VOLUMETRIC FOG LIGHT SHAFTS (Indigo Spotbeams & Cyan Laser Cones)
  // ===========================================================================
  const lightShaftCones: THREE.Mesh[] = [];
  const shaftPositions = [
    { x: -4.2, z: -1.8, color: COLORS.ELECTRIC_INDIGO, rotZ: 0.28 },
    { x: 0.0, z: -1.2, color: COLORS.CYAN_LASER, rotZ: -0.18 },
    { x: 3.8, z: -0.6, color: COLORS.ELECTRIC_INDIGO, rotZ: -0.32 },
    { x: 2.2, z: 0.2, color: COLORS.CYAN_LASER, rotZ: 0.22 },
  ];

  shaftPositions.forEach((sp) => {
    const coneGeo = new THREE.ConeGeometry(1.35, 6.2, 24, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({
      color: sp.color,
      transparent: true,
      opacity: 0.048,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const coneMesh = new THREE.Mesh(coneGeo, coneMat);
    coneMesh.position.set(sp.x, 3.1, sp.z);
    coneMesh.rotation.z = sp.rotZ;
    coneMesh.rotation.x = 0.15;
    coneMesh.xb = { pointerEvents: 'none' };
    root.add(coneMesh);
    lightShaftCones.push(coneMesh);
  });

  return {
    root,
    waterMirrorMesh,
    archCurves,
    archFluidPackets,
    hexRippleRings,
    hexRipplesState,
    cleanroomGlassWall,
    valveJointRings,
    lightShaftCones,
    waterReflectionStrips,
  };
}

/**
 * Spawns a hexagonal shockwave ripple on the Obsidian Water Mirror at the given world point.
 */
export function spawnHexagonalWaterRipple(
  refs: CourtyardArchitectureRefs,
  worldPoint: THREE.Vector3
) {
  let targetIdx = 0;
  let maxRadius = -1;
  for (let i = 0; i < refs.hexRipplesState.length; i++) {
    const st = refs.hexRipplesState[i];
    if (!st.active) {
      targetIdx = i;
      break;
    }
    if (st.radius > maxRadius) {
      maxRadius = st.radius;
      targetIdx = i;
    }
  }

  const ripple = refs.hexRipplesState[targetIdx];
  ripple.active = true;
  ripple.center.set(worldPoint.x, 0.028, worldPoint.z);
  ripple.radius = 0.08;
  ripple.strength = 1.0;

  const group = refs.hexRippleRings[targetIdx];
  group.position.copy(ripple.center);
  group.scale.setScalar(0.2);
  group.visible = true;
}

/**
 * Per-frame 60 FPS update for Quartz Arch optical fluid, Electro-Volumetric Light Shafts,
 * and Obsidian Water Mirror hexagonal ripples + Indigo/Cyan reflections.
 */
export function updateCourtyardAndCleanroom(
  elapsedTime: number,
  dt: number,
  refs: CourtyardArchitectureRefs,
  purgeProgress: number
) {
  // 1. Circulate optical fluid packets along the 4 Quartz Pipeline Arches
  const count = refs.archFluidPackets.count;
  const speed = 0.28 + purgeProgress * 0.44;

  for (let i = 0; i < count; i++) {
    const archIdx = i % refs.archCurves.length;
    const curve = refs.archCurves[archIdx];
    const t = ((i / count) + elapsedTime * speed) % 1.0;
    curve.getPointAt(t, _vec3A);
    curve.getTangentAt(t, _vec3B);

    _dummy.position.copy(_vec3A);
    _vec3B.add(_vec3A);
    _dummy.lookAt(_vec3B);
    _dummy.scale.set(1, 1, 1 + purgeProgress * 0.7);
    _dummy.updateMatrix();
    refs.archFluidPackets.setMatrixAt(i, _dummy.matrix);
  }
  refs.archFluidPackets.instanceMatrix.needsUpdate = true;

  // 2. Subtle shimmer on the Obsidian Water Mirror Indigo & Cyan laser reflection strips
  refs.waterReflectionStrips.forEach((strip, idx) => {
    const mat = strip.material as THREE.MeshBasicMaterial;
    const baseOp = idx % 2 === 0 ? 0.38 : 0.24;
    mat.opacity = baseOp + Math.sin(elapsedTime * 3.2 + idx * 0.9) * 0.1;
  });

  // 3. Subtle volumetric breathing on Electro-Volumetric Light Shafts
  refs.lightShaftCones.forEach((cone, idx) => {
    const mat = cone.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.042 + Math.sin(elapsedTime * 1.4 + idx * 1.3) * 0.014;
  });

  // 4. Advance Hexagonal Shockwave Ripples on the Obsidian Water Mirror
  for (let i = 0; i < refs.hexRipplesState.length; i++) {
    const st = refs.hexRipplesState[i];
    const group = refs.hexRippleRings[i];
    if (!st.active) continue;

    st.radius += dt * 1.65;
    st.strength = Math.max(0, 1.0 - st.radius / 2.2);

    if (st.strength <= 0.01) {
      st.active = false;
      group.visible = false;
    } else {
      group.scale.setScalar(st.radius * 3.2);
      group.rotation.y = elapsedTime * 0.25 * (i % 2 === 0 ? 1 : -1);
      group.children.forEach((child, cIdx) => {
        const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
        mat.opacity = st.strength * (cIdx === 0 ? 0.9 : 0.6);
      });
    }
  }
}
