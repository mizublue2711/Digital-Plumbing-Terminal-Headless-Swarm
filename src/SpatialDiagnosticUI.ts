import * as xb from 'xrblocks';
import { HEADLESS_AGENTS } from './constants';
import { DiagnosticState, StationId } from './types';

export interface SpatialCardsRefs {
  heroStatusText: xb.UIText;
  heroSlider: xb.UISlider;
  bentoBrainText: xb.UIText;
  bentoMuscleText: xb.UIText;
  bentoCanvasText: xb.UIText;
  founderStatusText: xb.UIText;
  ignitionStatusText: xb.UIText;
}

export function createSpatialDiagnosticCards(
  parent: xb.Script,
  callbacks: {
    onPurgeChange: (val: number) => void;
    onSelectAgent: (agentId: string) => void;
    onDeformSandbox: () => void;
    onTriggerIgnition: () => void;
    onFocusStation: (stationId: StationId) => void;
  }
): SpatialCardsRefs {
  xb.ui.theme = 'grayGlass';

  // ===========================================================================
  // CARD 01 // HERO STATION: "01 // WHY WE EXIST" & BLOAT PURGE VALVE
  // ===========================================================================
  const heroStatusText = new xb.UIText({
    text: 'VALVE STATE: LEGACY AI (DECORATIVE WALLPAPER) // 0% PURGED',
    style: {
      fontSize: 15,
      color: '#00E5FF',
      textAlign: 'center',
    },
  });

  const heroSlider = new xb.UISlider({
    ariaLabel: 'Purge Bloat Valve Position',
    min: 0,
    max: 100,
    step: 5,
    value: 0,
    style: { width: '100%', height: 38 },
    onInput: (val: number) => {
      callbacks.onPurgeChange(val / 100);
    },
  });

  const heroCard = new xb.UICard({
    size: { width: 0.92, height: 'auto' },
    manipulation: true,
    edge: true,
    style: {
      flexDirection: 'column',
      gap: 12,
      padding: 20,
      backgroundColor: '#090d16',
      borderRadius: 12,
    },
    children: [
      new xb.UIText({
        text: '01 // WHY WE EXIST — BLOAT PURGE VALVE',
        style: { fontSize: 16, fontWeight: 'bold', color: '#00E5FF' },
      }),
      new xb.UIText({
        text: 'Most AI projects fail for a boring reason: bloat.',
        style: { fontSize: 26, fontWeight: 'bold', color: '#FFFFFF', lineHeight: 1.2 },
      }),
      new xb.UIText({
        text: 'Pull the 3D valve lever or slide below from Legacy AI (Decorative Wallpaper) to ARTIFICIAL CRAFT (Deterministic Pipeline) to trigger a shockwave purge.',
        style: { fontSize: 15, color: '#94A3B8', lineHeight: 1.35 },
      }),
      heroSlider,
      heroStatusText,
      new xb.UIPanel({
        style: { width: '100%', flexDirection: 'row', gap: 10 },
        children: [
          new xb.UIButton({
            label: 'Legacy AI (0%)',
            style: { flexGrow: 1 },
            onClick: () => {
              heroSlider.value = 0;
              callbacks.onPurgeChange(0);
            },
          }),
          new xb.UIButton({
            label: 'Purge Bloat (100%)',
            style: { flexGrow: 1 },
            onClick: () => {
              heroSlider.value = 100;
              callbacks.onPurgeChange(1);
            },
          }),
        ],
      }),
    ],
  });
  heroCard.position.set(-4.2, 2.38, -2.4);
  parent.add(heroCard);

  // ===========================================================================
  // CARD 02 // TRI-CORE BENTO GRID: "02 // WHAT WE ACTUALLY DO"
  // ===========================================================================
  const bentoBrainText = new xb.UIText({
    text: 'THE BRAIN: 260 Neural Nodes | Hover magnet active',
    style: { fontSize: 14, color: '#CBD5E1' },
  });
  const bentoMuscleText = new xb.UIText({
    text: 'THE MUSCLE: 100% Deterministic Piston | 0.000% Drift',
    style: { fontSize: 14, color: '#00E5FF' },
  });
  const bentoCanvasText = new xb.UIText({
    text: 'THE CANVAS: CLOUD RENDER FEE: $0.00 / 60 FPS CLIENT GPU',
    style: { fontSize: 14, color: '#10B981', fontWeight: 'bold' },
  });

  const bentoCard = new xb.UICard({
    size: { width: 1.15, height: 'auto' },
    manipulation: true,
    edge: true,
    style: {
      flexDirection: 'column',
      gap: 10,
      padding: 18,
      backgroundColor: '#090d16',
      borderRadius: 12,
    },
    children: [
      new xb.UIText({
        text: '02 // WHAT WE ACTUALLY DO — TRI-CORE BENTO INFRASTRUCTURE',
        style: { fontSize: 16, fontWeight: 'bold', color: '#00E5FF' },
      }),
      new xb.UIText({
        text: 'Decoupled Reasoning · Deterministic Execution · Zero-Cost Client GPU Sandbox',
        style: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
      }),
      bentoBrainText,
      bentoMuscleText,
      bentoCanvasText,
      new xb.UIPanel({
        style: { width: '100%', flexDirection: 'row', gap: 10 },
        children: [
          new xb.UIButton({
            label: 'Deform 3D Sandbox Mesh',
            style: { flexGrow: 1 },
            onClick: () => callbacks.onDeformSandbox(),
          }),
          new xb.UIButton({
            label: 'Inspect Tri-Core',
            style: { flexGrow: 1 },
            onClick: () => callbacks.onFocusStation(1),
          }),
        ],
      }),
    ],
  });
  bentoCard.position.set(0, 2.42, -2.35);
  parent.add(bentoCard);

  // ===========================================================================
  // CARD 03 // MEET THE FOUNDER: "THE DIGITAL PLUMBER & THE HEADLESS ARMY"
  // ===========================================================================
  const founderStatusText = new xb.UIText({
    text: 'ACTIVE CONDUIT: [ n8n ] -> ZOD SCHEMA VALVE LOCKED (0% MEMORY LEAK)',
    style: { fontSize: 15, color: '#00E5FF', fontWeight: 'bold' },
  });

  const agentButtonsRow = new xb.UIPanel({
    style: { width: '100%', flexDirection: 'row', gap: 8 },
    children: HEADLESS_AGENTS.map((agent) =>
      new xb.UIButton({
        label: agent.name,
        style: { flexGrow: 1 },
        onClick: () => callbacks.onSelectAgent(agent.id),
      })
    ),
  });

  const founderCard = new xb.UICard({
    size: { width: 1.05, height: 'auto' },
    manipulation: true,
    edge: true,
    style: {
      flexDirection: 'column',
      gap: 10,
      padding: 18,
      backgroundColor: '#090d16',
      borderRadius: 12,
    },
    children: [
      new xb.UIText({
        text: '03 // MEET THE FOUNDER — LEAD PLUMBER & HEADLESS SWARM',
        style: { fontSize: 16, fontWeight: 'bold', color: '#00E5FF' },
      }),
      new xb.UIText({
        text: 'Select a Headless Agent satellite in 3D orbit to lock its data conduit into the Zod Schema Workbench:',
        style: { fontSize: 15, color: '#CBD5E1', lineHeight: 1.3 },
      }),
      agentButtonsRow,
      founderStatusText,
    ],
  });
  founderCard.position.set(4.2, 2.42, -2.4);
  parent.add(founderCard);

  // ===========================================================================
  // CARD 04 // JOIN THE CRAFT: "ENGINE IGNITION TERMINAL"
  // ===========================================================================
  const ignitionStatusText = new xb.UIText({
    text: 'PNEUMATIC PRESSURE: 100 PSI // READY FOR IGNITION',
    style: { fontSize: 15, color: '#00E5FF', textAlign: 'center' },
  });

  const ignitionCard = new xb.UICard({
    size: { width: 0.78, height: 'auto' },
    manipulation: true,
    edge: true,
    style: {
      flexDirection: 'column',
      gap: 12,
      padding: 18,
      backgroundColor: '#090d16',
      borderRadius: 12,
    },
    children: [
      new xb.UIText({
        text: '04 // JOIN THE CRAFT — ENGINE IGNITION CONSOLE',
        style: { fontSize: 16, fontWeight: 'bold', color: '#00E5FF', textAlign: 'center' },
      }),
      new xb.UIText({
        text: 'Press the 3D Electric Indigo Plunger below or click Ignite to release pneumatic locks and launch the Playground.',
        style: { fontSize: 15, color: '#CBD5E1', textAlign: 'center', lineHeight: 1.3 },
      }),
      ignitionStatusText,
      new xb.UIButton({
        label: 'IGNITE ARTIFICIALCRAFT.SPACE',
        style: { width: '100%' },
        onClick: () => callbacks.onTriggerIgnition(),
      }),
    ],
  });
  ignitionCard.position.set(0, 2.02, 0.35);
  parent.add(ignitionCard);

  return {
    heroStatusText,
    heroSlider,
    bentoBrainText,
    bentoMuscleText,
    bentoCanvasText,
    founderStatusText,
    ignitionStatusText,
  };
}

export function syncSpatialDiagnosticCards(
  refs: SpatialCardsRefs,
  state: DiagnosticState
) {
  const pct = Math.round(state.purgeProgress * 100);
  refs.heroStatusText.text =
    pct >= 95
      ? `VALVE STATE: ARTIFICIAL CRAFT (DETERMINISTIC PIPELINE) // ${pct}% PURGED — 60 FPS`
      : `VALVE STATE: LEGACY AI (DECORATIVE WALLPAPER) // ${pct}% PURGED`;

  refs.bentoBrainText.text = `THE BRAIN: ${state.brainActiveNodes} Active Magnet Nodes | Coherence: ${state.brainCoherence.toFixed(2)}%`;
  refs.bentoMuscleText.text = `THE MUSCLE: Cycles Executed: ${state.pistonCycleCount} | Silent Drift: 0.000%`;
  refs.bentoCanvasText.text = `THE CANVAS: CLOUD RENDER FEE: $0.00 / ${state.fps} FPS CLIENT GPU (Deforms: ${state.canvasDeformCount})`;

  const agent = HEADLESS_AGENTS.find((a) => a.id === state.activeAgentId) || HEADLESS_AGENTS[0];
  refs.founderStatusText.text = `ACTIVE CONDUIT: [ ${agent.name.toUpperCase()} ] — ${agent.schemaStatus} (${agent.throughput})`;

  refs.ignitionStatusText.text = state.ignitionTriggered
    ? 'PNEUMATIC PURGE ACTIVE // LAUNCHING PLAYGROUND SANDBOX...'
    : 'PNEUMATIC PRESSURE: 100 PSI // READY FOR IGNITION';
}
