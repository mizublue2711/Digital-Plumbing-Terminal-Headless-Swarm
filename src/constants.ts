import * as THREE from 'three';
import { AgentInfo, CameraBookmark } from './types';

export const COLORS = {
  SKY_ZENITH: 0x050508, // Absolute black zenith (#050508)
  SKY_HORIZON: 0x090912, // Velvet midnight blue horizon (#090912)
  BG_OBSIDIAN: 0x09090b, // Outdoor Obsidian concrete floor (#09090B)
  CONCRETE_MATTE: 0x121215, // Matte Brutalist concrete (#121215)
  INDOOR_BRUTALIST_WALL: 0x121215, // Indoor Cleanroom stone-gray Brutalist concrete (#121215)
  TITANIUM_PANEL: 0x18181e, // Matte anti-glare Titanium cladding (#18181E)
  OUTDOOR_ANTHRACITE_WALL: 0x18181b, // Towering outdoor Anthracite concrete wall (#18181B)
  AMBIENT_MIDNIGHT: 0x060810, // Ambient fill (#060810)
  KEY_LIGHT_6500K: 0xf4f8ff, // Cold industrial 6500K white
  SWISS_GRID: 0x18181f,
  SWISS_GRID_ACTIVE: 0x00e5ff,
  ELECTRIC_INDIGO: 0x5322ff,
  CYAN_LASER: 0x00e5ff,
  TITANIUM_DARK: 0x18181e,
  TITANIUM_LIGHT: 0x52525b,
  CHROME_VALVE: 0xd4d4d8,
  BLOAT_MAGENTA: 0xd946ef,
  BLOAT_AMBER: 0xf59e0b,
  EMERALD_OK: 0x10b981,
  CRIMSON_ALERT: 0xef4444,
};

export const CAMERA_BOOKMARKS: CameraBookmark[] = [
  {
    stationId: 0,
    code: '01 // WHY WE EXIST',
    title: 'OBSIDIAN CLEANROOM & BLOAT PURGE',
    subtitle: 'Most AI projects fail for a boring reason: bloat',
    position: new THREE.Vector3(-4.2, 1.55, 0.45),
    lookAt: new THREE.Vector3(-4.2, 1.45, -2.4),
  },
  {
    stationId: 1,
    code: '02 // WHAT WE ACTUALLY DO',
    title: 'TRI-CORE BENTO GRID & HYDRO MIRROR',
    subtitle: 'Decoupled Brain · Deterministic Muscle · $0.00 Client GPU Canvas',
    position: new THREE.Vector3(0.0, 1.65, 1.15),
    lookAt: new THREE.Vector3(0.0, 1.35, -2.35),
  },
  {
    stationId: 2,
    code: '03 // MEET THE FOUNDER',
    title: 'COURTYARD PYLONS & LEAD PLUMBER',
    subtitle: 'Magnetic Pylons beam 1px Cyan laser telemetry across the Obsidian Water Mirror',
    position: new THREE.Vector3(4.2, 1.65, 0.95),
    lookAt: new THREE.Vector3(3.1, 1.4, -1.8),
  },
  {
    stationId: 3,
    code: '04 // JOIN THE CRAFT',
    title: 'COURTYARD IGNITION TERMINAL',
    subtitle: 'Zero silent drift. 60 FPS deterministic execution on client GPU.',
    position: new THREE.Vector3(0.0, 1.75, 3.35),
    lookAt: new THREE.Vector3(0.0, 1.25, 0.35),
  },
];

export const HEADLESS_AGENTS: AgentInfo[] = [
  {
    id: 'n8n',
    name: 'n8n',
    role: 'Deterministic Workflow Orchestrator',
    schemaStatus: 'STATUS: OPERATIONAL // ZERO DRIFT',
    pipeColor: 0xff6d5a,
    hexColor: '#FF6D5A',
    throughput: '1,420webhooks/s',
    orbitAngle: -1.2,
    orbitRadius: 2.2,
    description:
      'Executes multi-step deterministic API webhooks and retry-safe state machines without hallucinated branching.',
  },
  {
    id: 'dify',
    name: 'Dify',
    role: 'RAG & Agentic Pipeline Router',
    schemaStatus: 'STATUS: OPERATIONAL // ZERO DRIFT',
    pipeColor: 0x00e5ff,
    hexColor: '#00E5FF',
    throughput: '890ctx/s',
    orbitAngle: -0.6,
    orbitRadius: 2.2,
    description:
      'Manages decoupled knowledge retrieval pipelines and prompt templates isolated from core application logic.',
  },
  {
    id: 'claude',
    name: 'Claude',
    role: 'Deep Code & Structural Synthesis',
    schemaStatus: 'STATUS: OPERATIONAL // ZERO DRIFT',
    pipeColor: 0xd97757,
    hexColor: '#D97757',
    throughput: '128k_tokens/pipe',
    orbitAngle: 0.0,
    orbitRadius: 2.2,
    description:
      'Handles high-complexity architectural reasoning and strict TypeScript/Zod contract synthesis.',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    role: 'Multimodal High-Throughput Engine',
    schemaStatus: 'STATUS: OPERATIONAL // ZERO DRIFT',
    pipeColor: 0x5322ff,
    hexColor: '#5322FF',
    throughput: '2.0M_ctx/valve',
    orbitAngle: 0.6,
    orbitRadius: 2.2,
    description:
      'Processes massive context windows and structured multimodal telemetry directly through typed Next.js API conduits.',
  },
  {
    id: 'remotion',
    name: 'Remotion',
    role: 'Programmatic Frame & Video Compiler',
    schemaStatus: 'STATUS: OPERATIONAL // ZERO DRIFT',
    pipeColor: 0x38bdf8,
    hexColor: '#38BDF8',
    throughput: '60.0_FPS_LOCKED',
    orbitAngle: 1.2,
    orbitRadius: 2.2,
    description:
      'Renders deterministic frame-by-frame visual outputs and interactive WebGL sandboxes with zero silent drift.',
  },
];
