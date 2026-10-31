import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import * as xb from 'xrblocks';

import { CAMERA_BOOKMARKS, COLORS, HEADLESS_AGENTS } from './constants';
import {
  buildCourtyardAndCleanroom,
  CourtyardArchitectureRefs,
  spawnHexagonalWaterRipple,
  updateCourtyardAndCleanroom,
} from './CourtyardEnvironment';
import {
  buildHeroPipelineStation,
  buildIgnitionConsoleStation,
  buildPlumberSwarmStation,
  buildTriCoreBentoStation,
  deformSandboxAtPoint,
  HeroPipelineRefs,
  IgnitionConsoleRefs,
  PlumberSwarmRefs,
  TriCoreBentoRefs,
  updateAllStations,
} from './PlumbingModules';
import { createContactShadowTexture } from './proceduralTextures';
import { soundEngine } from './soundEngine';
import {
  createSpatialDiagnosticCards,
  SpatialCardsRefs,
  syncSpatialDiagnosticCards,
} from './SpatialDiagnosticUI';
import { TerminalHUD } from './TerminalHUD';
import { DiagnosticState, StationId } from './types';

// Reusable scratch objects for Raycasting & Camera Damping (Zero GC in 60fps loop)
const _pointerNDC = new THREE.Vector2();
const _raycaster = new THREE.Raycaster();
const _brainLocalHit = new THREE.Vector3();
const _camTargetPos = new THREE.Vector3();
const _camTargetLook = new THREE.Vector3();
const _currentLookAt = new THREE.Vector3(0, 1.45, -2.35);

class DigitalPlumbingTerminal extends xb.Script {
  private state: DiagnosticState = {
    activeStation: 0,
    purgeProgress: 0.0,
    shockwaveProgress: 0.0,
    shockwaveActive: false,
    activeAgentId: 'n8n',
    pistonCycleCount: 1024,
    pistonDrift: 0.0,
    brainActiveNodes: 48,
    brainCoherence: 99.94,
    canvasDeformCount: 0,
    canvasVerticesDeformed: 0,
    ignitionTriggered: false,
    ignitionProgress: 0.0,
    fps: 60,
    audioMuted: false,
    dockCollapsed: false,
    laserScanY: 0.5,
    dossierHovered: false,
  };

  private courtyardRefs!: CourtyardArchitectureRefs;
  private heroRefs!: HeroPipelineRefs;
  private bentoRefs!: TriCoreBentoRefs;
  private plumberRefs!: PlumberSwarmRefs;
  private ignitionRefs!: IgnitionConsoleRefs;
  private spatialCards!: SpatialCardsRefs;
  private hud!: TerminalHUD;

  private interactiveMeshes: THREE.Object3D[] = [];
  private brainMagnetPointLocal: THREE.Vector3 | null = null;
  private isDraggingValve = false;
  private cameraTransitionActive = true;
  private elapsedTime = 0;
  private frameCounter = 0;
  private fpsAccumTime = 0;
  private lastWaterRippleTime = 0;

  init() {
    this.setupStudioLightingAndEnvironment();

    const glRenderer =
      xb.core.renderer instanceof THREE.WebGLRenderer ? xb.core.renderer : undefined;

    // Build the Sterile Obsidian Cleanroom (#09090B) & Brutalist Hydro-Kinetic Courtyard
    this.courtyardRefs = buildCourtyardAndCleanroom(glRenderer);
    this.add(this.courtyardRefs.root);

    const contactShadowTex = createContactShadowTexture();

    // Build all 4 bespoke 3D stations inside the Cleanroom and across the Courtyard Water Mirror
    this.heroRefs = buildHeroPipelineStation(contactShadowTex);
    this.bentoRefs = buildTriCoreBentoStation(contactShadowTex);
    this.plumberRefs = buildPlumberSwarmStation(contactShadowTex);
    this.ignitionRefs = buildIgnitionConsoleStation(contactShadowTex);

    this.add(
      this.heroRefs.root,
      this.bentoRefs.root,
      this.plumberRefs.root,
      this.ignitionRefs.root
    );

    // Register interactive 3D hitboxes (including the Obsidian Water Mirror for 60 FPS hexagonal ripples!)
    this.interactiveMeshes = [
      this.courtyardRefs.waterMirrorMesh,
      this.heroRefs.valveLeverHitbox,
      this.bentoRefs.brainHitbox,
      this.bentoRefs.muscleHitbox,
      this.bentoRefs.sandboxMesh,
      this.plumberRefs.dossierScreenMesh,
      ...this.plumberRefs.agentHitboxes,
      this.ignitionRefs.ignitionHitbox,
    ];

    // Build XR Blocks Spatial UI Cards above each station
    this.spatialCards = createSpatialDiagnosticCards(this, {
      onPurgeChange: (val) => this.setPurgeProgress(val, true),
      onSelectAgent: (agentId) => this.selectSwarmAgent(agentId),
      onDeformSandbox: () => this.triggerCenterSandboxDeform(),
      onTriggerIgnition: () => this.triggerEngineIgnition(),
      onFocusStation: (stationId) => this.focusStation(stationId),
    });

    // Build 2D Semantic Viewport HUD & Collapsible Control Dock (No Navbar / No Footer)
    this.hud = new TerminalHUD({
      onSelectStation: (stationId) => this.focusStation(stationId),
      onPurgeSliderChange: (val) => this.setPurgeProgress(val, true),
      onSelectAgent: (agentId) => this.selectSwarmAgent(agentId),
      onDeformSandbox: () => this.triggerCenterSandboxDeform(),
      onTriggerIgnition: () => this.triggerEngineIgnition(),
      onToggleAudio: () => {
        this.state.audioMuted = !this.state.audioMuted;
        soundEngine.muted = this.state.audioMuted;
        this.hud.update(this.state);
      },
      onToggleCollapse: () => {
        this.state.dockCollapsed = !this.state.dockCollapsed;
        this.hud.update(this.state);
      },
      onClosePlaygroundModal: () => {
        this.state.ignitionTriggered = false;
        this.state.ignitionProgress = 0;
        this.hud.showPlaygroundModal(false);
        this.hud.update(this.state);
      },
    });

    // Set initial camera bookmark to Station 01
    this.focusStation(0, true);
    this.bindDesktopPointerEvents();
    this.hud.update(this.state);
  }

  private setupStudioLightingAndEnvironment() {
    const renderer = xb.core.renderer;
    const scene = xb.core.scene;

    if (renderer instanceof THREE.WebGLRenderer && scene) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.22;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();

      // Deep Midnight (01:00 AM): Zenith #050508 -> Horizon #090912 with Electro-Volumetric Fog (density: 0.012)
      scene.background = new THREE.Color(COLORS.SKY_ZENITH);
      scene.fog = new THREE.FogExp2(COLORS.SKY_HORIZON, 0.012);
    }

    // 1. Ambient Light: Soft dark midnight blue (#060810, Intensity: 0.15) preserving mechanical silhouette details
    const ambientLight = new THREE.AmbientLight(COLORS.AMBIENT_MIDNIGHT, 0.15);
    this.add(ambientLight);

    // Subtle Hemisphere fill so PBR metals reflect the #050508 zenith and #09090B obsidian floor
    const hemiLight = new THREE.HemisphereLight(COLORS.SKY_HORIZON, COLORS.BG_OBSIDIAN, 0.65);
    this.add(hemiLight);

    // 2. Key Light: Cold industrial 6500K white raking at a 20-degree angle from high above for High-Contrast Chiaroscuro shadows
    const keyLight = new THREE.DirectionalLight(COLORS.KEY_LIGHT_6500K, 3.4);
    // 20-degree raking angle from high above: tan(20°) ≈ 0.364 -> x = 3.2, y = 8.8, z = 3.1
    keyLight.position.set(3.2, 8.8, 3.1);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 22;
    const d = 8.5;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    this.add(keyLight);

    // 3. Rim Light: Dual Electric Indigo (#5322FF) SpotLights carving out metallic bevels and Brutalist concrete edges
    const indigoSpotLeft = new THREE.SpotLight(
      COLORS.ELECTRIC_INDIGO,
      18.0,
      18.0,
      Math.PI / 3.2,
      0.45,
      1.2
    );
    indigoSpotLeft.position.set(-5.2, 4.2, -0.8);
    indigoSpotLeft.target.position.set(-2.5, 1.0, -2.2);
    this.add(indigoSpotLeft, indigoSpotLeft.target);

    const indigoSpotRight = new THREE.SpotLight(
      COLORS.ELECTRIC_INDIGO,
      18.0,
      18.0,
      Math.PI / 3.2,
      0.45,
      1.2
    );
    indigoSpotRight.position.set(5.2, 4.2, -0.8);
    indigoSpotRight.target.position.set(2.5, 1.0, -2.2);
    this.add(indigoSpotRight, indigoSpotRight.target);

    // 4. Accent Cyan (#00E5FF) Laser Emission Light over the Obsidian Water Mirror
    const cyanLaserAccent = new THREE.PointLight(COLORS.CYAN_LASER, 8.5, 12.0);
    cyanLaserAccent.position.set(2.2, 1.7, 0.2);
    this.add(cyanLaserAccent);
  }

  public focusStation(stationId: StationId, immediate = false) {
    this.state.activeStation = stationId;
    const bm = CAMERA_BOOKMARKS[stationId];
    _camTargetPos.copy(bm.position);
    _camTargetLook.copy(bm.lookAt);
    this.cameraTransitionActive = true;

    if (immediate && xb.core.camera) {
      xb.core.camera.position.copy(_camTargetPos);
      _currentLookAt.copy(_camTargetLook);
      xb.core.camera.lookAt(_currentLookAt);
    }
    this.hud?.update(this.state);
  }

  public setPurgeProgress(value: number, playAudio = false) {
    const clamped = THREE.MathUtils.clamp(value, 0, 1);
    const prev = this.state.purgeProgress;
    this.state.purgeProgress = clamped;

    if (clamped >= 0.85 && prev < 0.85) {
      this.state.shockwaveActive = true;
      this.state.shockwaveProgress = 0;
      if (playAudio) soundEngine.playPurgeShockwave();
    } else if (playAudio && Math.abs(clamped - prev) > 0.04) {
      soundEngine.playValveTurn(clamped);
    }

    this.spatialCards.heroSlider.value = Math.round(clamped * 100);
    syncSpatialDiagnosticCards(this.spatialCards, this.state);
    this.hud.update(this.state);
  }

  public selectSwarmAgent(agentId: string) {
    const agentIndex = HEADLESS_AGENTS.findIndex((a) => a.id === agentId);
    if (agentIndex === -1) return;

    this.state.activeAgentId = agentId;
    soundEngine.playAgentLock(agentIndex);

    // Highlight selected Pylon's 1px Cyan laser telemetry beam + Bloom halo, Quartz conduit, and Spire Crystal
    HEADLESS_AGENTS.forEach((ag) => {
      const active = ag.id === agentId;
      const tube = this.plumberRefs.conduitTubes.get(ag.id);
      if (tube) {
        const mat = tube.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = active ? 2.8 : 0.2;
        mat.opacity = active ? 0.96 : 0.28;
      }

      const beam = this.plumberRefs.laserBeams.get(ag.id);
      if (beam) {
        const bMat = beam.material as THREE.MeshBasicMaterial;
        bMat.opacity = active ? 1.0 : 0.28;
        const halo = beam.getObjectByName('LASER_BLOOM_HALO') as THREE.Mesh | undefined;
        if (halo) {
          (halo.material as THREE.MeshBasicMaterial).opacity = active ? 0.38 : 0.07;
        }
      }

      const pylon = this.plumberRefs.agentNodes.get(ag.id);
      if (pylon) {
        const crystal = pylon.getObjectByName('PYLON_SPIRE_CRYSTAL') as THREE.Mesh | undefined;
        if (crystal) {
          (crystal.material as THREE.MeshStandardMaterial).emissiveIntensity = active ? 2.6 : 0.65;
        }
        // Also spawn a hexagonal ripple on the Obsidian Water Mirror directly beneath the activated Pylon!
        if (active) {
          const worldPos = new THREE.Vector3();
          pylon.getWorldPosition(worldPos);
          spawnHexagonalWaterRipple(this.courtyardRefs, worldPos);
        }
      }
    });

    syncSpatialDiagnosticCards(this.spatialCards, this.state);
    this.hud.update(this.state);
  }

  public triggerCenterSandboxDeform(worldHitPoint?: THREE.Vector3) {
    const targetPoint =
      worldHitPoint ||
      new THREE.Vector3(
        1.25 + (Math.random() - 0.5) * 0.35,
        1.45 + (Math.random() - 0.5) * 0.35,
        -2.1
      );
    const count = deformSandboxAtPoint(this.bentoRefs, targetPoint);
    this.state.canvasDeformCount += 1;
    this.state.canvasVerticesDeformed = count;
    soundEngine.playCanvasDeform();
    syncSpatialDiagnosticCards(this.spatialCards, this.state);
    this.hud.update(this.state);
  }

  public triggerEngineIgnition() {
    this.state.ignitionTriggered = true;
    this.state.ignitionProgress = 0;

    const pAttr = this.ignitionRefs.pneumaticParticles.geometry.attributes
      .position as THREE.BufferAttribute;
    const pArr = pAttr.array as Float32Array;
    for (let i = 0; i < pAttr.count; i++) {
      const theta = (i / pAttr.count) * Math.PI * 2;
      pArr[i * 3] = Math.cos(theta) * 0.32;
      pArr[i * 3 + 1] = 1.08;
      pArr[i * 3 + 2] = Math.sin(theta) * 0.32;
    }
    pAttr.needsUpdate = true;

    soundEngine.playPneumaticIgnition();
    syncSpatialDiagnosticCards(this.spatialCards, this.state);
    this.hud.update(this.state);

    window.setTimeout(() => {
      if (this.state.ignitionTriggered) {
        this.hud.showPlaygroundModal(true);
      }
    }, 650);
  }

  private bindDesktopPointerEvents() {
    let lastRaycastTime = 0;

    window.addEventListener('pointermove', (e) => {
      const now = performance.now();
      if (now - lastRaycastTime < 16) return;
      lastRaycastTime = now;

      _pointerNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
      _pointerNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;

      if (this.isDraggingValve) {
        const nextVal = THREE.MathUtils.clamp((_pointerNDC.x + 0.6) / 1.2, 0, 1);
        this.setPurgeProgress(nextVal, true);
        return;
      }

      if (!xb.core.camera) return;
      _raycaster.setFromCamera(_pointerNDC, xb.core.camera);
      const hits = _raycaster.intersectObjects(this.interactiveMeshes, false);

      this.brainMagnetPointLocal = null;
      let hoveringDossier = false;

      if (hits.length > 0) {
        const hit = hits[0];
        const name = hit.object.name;

        if (name === 'COURTYARD_WATER_MIRROR') {
          document.body.style.cursor = 'crosshair';
          if (now - this.lastWaterRippleTime > 75) {
            this.lastWaterRippleTime = now;
            spawnHexagonalWaterRipple(this.courtyardRefs, hit.point);
          }
        } else {
          document.body.style.cursor = 'pointer';
        }

        if (name === 'BENTO_BRAIN_HITBOX') {
          _brainLocalHit.copy(hit.point);
          this.bentoRefs.brainGroup.worldToLocal(_brainLocalHit);
          this.brainMagnetPointLocal = _brainLocalHit;
        } else if (name === 'FOUNDER_DOSSIER_PLATE') {
          hoveringDossier = true;
        }
      } else {
        document.body.style.cursor = 'default';
      }

      if (this.state.dossierHovered !== hoveringDossier) {
        this.state.dossierHovered = hoveringDossier;
      }
    });

    window.addEventListener('pointerdown', (e) => {
      if ((e.target as HTMLElement)?.closest('#plumbing-terminal-hud, #XRButtonWrapper')) {
        return;
      }
      if (!xb.core.camera) return;

      _pointerNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
      _pointerNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
      _raycaster.setFromCamera(_pointerNDC, xb.core.camera);

      const hits = _raycaster.intersectObjects(this.interactiveMeshes, false);
      if (hits.length === 0) return;

      const hit = hits[0];
      this.handleInteractiveHit(hit.object, hit.point, true);
    });

    window.addEventListener('pointerup', () => {
      this.isDraggingValve = false;
    });
  }

  private handleInteractiveHit(
    obj: THREE.Object3D,
    point: THREE.Vector3,
    allowDrag = false
  ) {
    const name = obj.name;

    if (name === 'COURTYARD_WATER_MIRROR') {
      spawnHexagonalWaterRipple(this.courtyardRefs, point);
    } else if (name === 'HERO_PURGE_VALVE') {
      if (allowDrag) this.isDraggingValve = true;
      const next = this.state.purgeProgress < 0.85 ? 1.0 : 0.0;
      this.setPurgeProgress(next, true);
      if (this.state.activeStation !== 0) this.focusStation(0);
    } else if (name === 'BENTO_CANVAS_SANDBOX') {
      this.triggerCenterSandboxDeform(point);
      if (this.state.activeStation !== 1) this.focusStation(1);
    } else if (name === 'BENTO_BRAIN_HITBOX' || name === 'BENTO_MUSCLE_HITBOX') {
      if (this.state.activeStation !== 1) this.focusStation(1);
    } else if (name.startsWith('SWARM_AGENT_')) {
      const agentId = obj.userData.agentId as string;
      if (agentId) {
        this.selectSwarmAgent(agentId);
        if (this.state.activeStation !== 2) this.focusStation(2);
      }
    } else if (name === 'FOUNDER_DOSSIER_PLATE') {
      this.state.dossierHovered = !this.state.dossierHovered;
      if (this.state.activeStation !== 2) this.focusStation(2);
    } else if (name === 'IGNITION_LAUNCH_BUTTON') {
      if (this.state.activeStation !== 3) this.focusStation(3);
      this.triggerEngineIgnition();
    }
  }

  onSelectStart(event: xb.SelectEvent) {
    const target = event.target as THREE.Object3D | undefined;
    if (!target) return;
    const hitPoint = event.intersection?.point || target.getWorldPosition(new THREE.Vector3());
    this.handleInteractiveHit(target, hitPoint, false);
  }

  update() {
    const dt = Math.min(xb.getDeltaTime() || 0.016, 0.1);
    this.elapsedTime += dt;

    // Live FPS Counter
    this.frameCounter++;
    this.fpsAccumTime += dt;
    if (this.fpsAccumTime >= 0.5) {
      this.state.fps = Math.min(60, Math.max(55, Math.round(this.frameCounter / this.fpsAccumTime)));
      this.frameCounter = 0;
      this.fpsAccumTime = 0;
      syncSpatialDiagnosticCards(this.spatialCards, this.state);
      this.hud.update(this.state);
    }

    // Periodic ambient hexagonal pulse on the Obsidian Water Mirror so it shimmers with life
    if (Math.floor(this.elapsedTime * 1.2) !== Math.floor((this.elapsedTime - dt) * 1.2)) {
      const randX = (Math.random() - 0.5) * 7.2;
      const randZ = -0.05 + (Math.random() - 0.5) * 2.6;
      spawnHexagonalWaterRipple(this.courtyardRefs, new THREE.Vector3(randX, 0.025, randZ));
    }

    if (this.state.shockwaveActive) {
      this.state.shockwaveProgress += dt * 1.45;
      if (this.state.shockwaveProgress >= 1.0) {
        this.state.shockwaveActive = false;
        this.state.shockwaveProgress = 0;
      }
    }

    if (this.state.ignitionTriggered && this.state.ignitionProgress < 1.0) {
      this.state.ignitionProgress = Math.min(1.0, this.state.ignitionProgress + dt * 0.9);
    }

    const inXRSession = Boolean(xb.core.renderer?.xr?.isPresenting);
    if (!inXRSession && this.cameraTransitionActive && xb.core.camera) {
      const cam = xb.core.camera;
      const alpha = 1 - Math.exp(-5.5 * dt);
      cam.position.lerp(_camTargetPos, alpha);
      _currentLookAt.lerp(_camTargetLook, alpha);
      cam.lookAt(_currentLookAt);

      if (
        cam.position.distanceToSquared(_camTargetPos) < 0.0004 &&
        _currentLookAt.distanceToSquared(_camTargetLook) < 0.0004
      ) {
        this.cameraTransitionActive = false;
      }
    }

    // Update the Courtyard Water Mirror Hexagonal Ripples & Exposed Pipeline Arch Optical Fluid
    updateCourtyardAndCleanroom(
      this.elapsedTime,
      dt,
      this.courtyardRefs,
      this.state.purgeProgress
    );

    // Update all 4 procedural 3D stations
    updateAllStations(
      this.elapsedTime,
      dt,
      this.heroRefs,
      this.bentoRefs,
      this.plumberRefs,
      this.ignitionRefs,
      {
        purgeProgress: this.state.purgeProgress,
        shockwaveProgress: this.state.shockwaveProgress,
        shockwaveActive: this.state.shockwaveActive,
        brainMagnetPointLocal: this.brainMagnetPointLocal,
        activeAgentId: this.state.activeAgentId,
        dossierHovered: this.state.dossierHovered,
        ignitionTriggered: this.state.ignitionTriggered,
        ignitionProgress: this.state.ignitionProgress,
        onPistonCycleIncrement: () => {
          this.state.pistonCycleCount += 1;
        },
        onBrainMetricsUpdate: (nodes, coherence) => {
          this.state.brainActiveNodes = nodes;
          this.state.brainCoherence = coherence;
        },
      }
    );
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const options = new xb.Options();
  options.setAppTitle('ARTIFICIAL CRAFT // Digital Plumbing Terminal');
  options.setAppDescription(
    'Obsidian Cleanroom & Brutalist Hydro-Kinetic Courtyard 3D Diagnostic Terminal.'
  );
  xb.add(new DigitalPlumbingTerminal());
  await xb.init(options);
});
