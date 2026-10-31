import * as THREE from 'three';

export type StationId = 0 | 1 | 2 | 3;

export interface AgentInfo {
  id: string;
  name: string;
  role: string;
  schemaStatus: string;
  pipeColor: number;
  hexColor: string;
  throughput: string;
  orbitAngle: number;
  orbitRadius: number;
  description: string;
}

export interface DiagnosticState {
  activeStation: StationId;
  purgeProgress: number; // 0.0 = Legacy AI (Decorative Wallpaper), 1.0 = ARTIFICIAL CRAFT (Deterministic Pipeline)
  shockwaveProgress: number; // 0 to 1 active wave
  shockwaveActive: boolean;
  activeAgentId: string;
  pistonCycleCount: number;
  pistonDrift: number; // Always 0.000%
  brainActiveNodes: number;
  brainCoherence: number;
  canvasDeformCount: number;
  canvasVerticesDeformed: number;
  ignitionTriggered: boolean;
  ignitionProgress: number;
  fps: number;
  audioMuted: boolean;
  dockCollapsed: boolean;
  laserScanY: number;
  dossierHovered: boolean;
}

export interface CameraBookmark {
  stationId: StationId;
  code: string;
  title: string;
  subtitle: string;
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
}
