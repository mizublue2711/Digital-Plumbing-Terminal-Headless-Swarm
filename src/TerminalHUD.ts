import { CAMERA_BOOKMARKS, HEADLESS_AGENTS } from './constants';
import { DiagnosticState, StationId } from './types';

export interface HudCallbacks {
  onSelectStation: (stationId: StationId) => void;
  onPurgeSliderChange: (progress: number) => void;
  onSelectAgent: (agentId: string) => void;
  onDeformSandbox: () => void;
  onTriggerIgnition: () => void;
  onToggleAudio: () => void;
  onToggleCollapse: () => void;
  onClosePlaygroundModal: () => void;
}

export class TerminalHUD {
  private container: HTMLElement;
  private callbacks: HudCallbacks;

  // Cached DOM element refs for zero-lag updates
  private purgeInput!: HTMLInputElement;
  private purgeBadgeEl!: HTMLElement;
  private sloganHeadlineEl!: HTMLElement;
  private stationTitleEl!: HTMLElement;
  private stationSubtitleEl!: HTMLElement;
  private stationCodeEl!: HTMLElement;
  private stationTabs: HTMLButtonElement[] = [];
  private contextPanelEl!: HTMLElement;
  private dockBodyEl!: HTMLElement;
  private collapseBtnEl!: HTMLButtonElement;
  private audioBtnEl!: HTMLButtonElement;
  private playgroundModalEl!: HTMLElement;
  private lastRenderedStation: StationId | -1 = -1;
  private lastRenderedAgent = '';
  private lastPurgeMode = -1;

  constructor(callbacks: HudCallbacks) {
    this.callbacks = callbacks;
    this.container = document.createElement('div');
    this.container.id = 'plumbing-terminal-hud';
    document.body.appendChild(this.container);
    this.buildDOM();
    this.bindKeyboardShortcuts();
  }

  private buildDOM() {
    this.container.innerHTML = `
      <!-- Top-Left Minimal Diagnostic Spec & Slogan Clipping Reveal Banner -->
      <div class="ac-top-diagnostic-card">
        <div class="ac-kicker-row">
          <span id="ac-station-code" class="ac-mono-kicker">01 // WHY WE EXIST</span>
          <span class="ac-sep">·</span>
          <span id="ac-purge-badge" class="ac-mono-metric">PIPELINE: LEGACY BLOAT (0%)</span>
        </div>
        <div class="ac-clip-mask">
          <h2 id="ac-slogan-headline" class="ac-slogan-reveal">
            Most AI projects fail for a boring reason: bloat.
          </h2>
        </div>
        <p id="ac-station-subtitle" class="ac-station-desc">
          Pull the 3D Purge Bloat valve or drag the slider below to flush decorative wallpaper into a 1px Swiss CAD pipeline at 60 FPS.
        </p>
      </div>

      <!-- Interactive Playground Launch Overlay Modal (Shown when Section 04 Ignition is triggered) -->
      <div id="ac-playground-modal" class="ac-playground-modal ac-hidden">
        <div class="ac-modal-box">
          <div class="ac-modal-header">
            <span class="ac-mono-kicker">IGNITION COMPLETE // ARTIFICIALCRAFT.SPACE PLAYGROUND</span>
            <button id="ac-modal-close" class="ac-btn-secondary">Return to Terminal</button>
          </div>
          <h3 class="ac-modal-title">Deterministic Pipeline & Headless Swarm Sandbox Ready</h3>
          <p class="ac-modal-copy">
            Pneumatic locks released. All 5 Headless Swarm conduits (n8n, Dify, Claude, Gemini, Remotion) are welded through strict Zod Schema valves with 0.000% silent drift on your local GPU.
          </p>
          <div class="ac-modal-grid">
            <div class="ac-modal-stat">
              <span class="ac-stat-label">CLOUD RENDER FEE</span>
              <span class="ac-stat-val ac-cyan">$0.00 / FRAME</span>
            </div>
            <div class="ac-modal-stat">
              <span class="ac-stat-label">ZOD SCHEMA INTEGRITY</span>
              <span class="ac-stat-val ac-indigo">100.0% LOCKED</span>
            </div>
            <div class="ac-modal-stat">
              <span class="ac-stat-label">CLIENT GPU TARGET</span>
              <span class="ac-stat-val">60.0 FPS DETERMINISTIC</span>
            </div>
          </div>
          <div class="ac-modal-actions">
            <a href="https://artificialcraft.space" target="_top" rel="noopener noreferrer" class="ac-btn-ignition">
              Open artificialcraft.space ↗
            </a>
            <button id="ac-modal-explore" class="ac-btn-secondary">
              Continue Exploring 3D Plumbing Terminal
            </button>
          </div>
        </div>
      </div>

      <!-- Unified Collapsible Bottom Control Dock (<= 15% Viewport Footprint, Zero Navbar/Footer) -->
      <div class="ac-bottom-dock-wrapper">
        <div class="ac-dock-top-bar">
          <button id="ac-collapse-btn" class="ac-dock-toggle" title="Shortcut: Press H">
            ▾ Hide Controls (H)
          </button>
          <button id="ac-audio-btn" class="ac-dock-toggle">
            Sound: ON
          </button>
        </div>

        <div id="ac-dock-body" class="ac-dock-body">
          <!-- Row 1: 4 Architectural Section Camera Bookmarks -->
          <div class="ac-station-tabs" role="tablist" aria-label="Diagnostic Terminal Sections">
            <button data-station="0" class="ac-station-tab ac-active">
              01. Bloat Purge Valve
            </button>
            <button data-station="1" class="ac-station-tab">
              02. Tri-Core Bento Grid
            </button>
            <button data-station="2" class="ac-station-tab">
              03. Plumber & Swarm
            </button>
            <button data-station="3" class="ac-station-tab">
              04. Engine Ignition
            </button>
          </div>

          <!-- Row 2: Context-Aware Interactive Station Controls -->
          <div id="ac-context-panel" class="ac-context-panel"></div>
        </div>
      </div>
    `;

    this.stationCodeEl = this.container.querySelector('#ac-station-code')!;
    this.purgeBadgeEl = this.container.querySelector('#ac-purge-badge')!;
    this.sloganHeadlineEl = this.container.querySelector('#ac-slogan-headline')!;
    this.stationSubtitleEl = this.container.querySelector('#ac-station-subtitle')!;
    this.contextPanelEl = this.container.querySelector('#ac-context-panel')!;
    this.dockBodyEl = this.container.querySelector('#ac-dock-body')!;
    this.collapseBtnEl = this.container.querySelector('#ac-collapse-btn')!;
    this.audioBtnEl = this.container.querySelector('#ac-audio-btn')!;
    this.playgroundModalEl = this.container.querySelector('#ac-playground-modal')!;

    this.stationTabs = Array.from(this.container.querySelectorAll('.ac-station-tab'));
    this.stationTabs.forEach((btn) => {
      btn.addEventListener('click', () => {
        const st = Number(btn.getAttribute('data-station')) as StationId;
        this.callbacks.onSelectStation(st);
      });
    });

    this.collapseBtnEl.addEventListener('click', () => {
      this.callbacks.onToggleCollapse();
    });

    this.audioBtnEl.addEventListener('click', () => {
      this.callbacks.onToggleAudio();
    });

    this.container.querySelector('#ac-modal-close')?.addEventListener('click', () => {
      this.callbacks.onClosePlaygroundModal();
    });
    this.container.querySelector('#ac-modal-explore')?.addEventListener('click', () => {
      this.callbacks.onClosePlaygroundModal();
    });
  }

  private bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'h' || e.key === 'H') {
        this.callbacks.onToggleCollapse();
      } else if (e.key === '1') {
        this.callbacks.onSelectStation(0);
      } else if (e.key === '2') {
        this.callbacks.onSelectStation(1);
      } else if (e.key === '3') {
        this.callbacks.onSelectStation(2);
      } else if (e.key === '4') {
        this.callbacks.onSelectStation(3);
      }
    });
  }

  public showPlaygroundModal(visible: boolean) {
    if (visible) {
      this.playgroundModalEl.classList.remove('ac-hidden');
    } else {
      this.playgroundModalEl.classList.add('ac-hidden');
    }
  }

  public update(state: DiagnosticState) {
    const bookmark = CAMERA_BOOKMARKS[state.activeStation];
    const pct = Math.round(state.purgeProgress * 100);

    // Update top diagnostic card
    this.stationCodeEl.textContent = bookmark.code;
    this.purgeBadgeEl.textContent =
      pct >= 95
        ? `ARTIFICIAL CRAFT DETERMINISTIC (${pct}%) · ${state.fps} FPS CLIENT GPU`
        : `VALVE PURGE: ${pct}% · ${state.fps} FPS CLIENT GPU`;

    // Trigger text-clipping-reveal animation when switching station or crossing purge threshold
    const purgeMode = pct >= 90 ? 1 : 0;
    if (this.lastRenderedStation !== state.activeStation || this.lastPurgeMode !== purgeMode) {
      this.sloganHeadlineEl.classList.remove('ac-reveal-anim');
      void this.sloganHeadlineEl.offsetWidth; // Reflow for crisp mask reveal
      this.sloganHeadlineEl.classList.add('ac-reveal-anim');

      if (state.activeStation === 0) {
        this.sloganHeadlineEl.textContent =
          purgeMode === 1
            ? 'Deterministic Pipeline: 0% Silent Drift on 1px Swiss Grid.'
            : 'Most AI projects fail for a boring reason: bloat.';
      } else {
        this.sloganHeadlineEl.textContent = bookmark.title;
      }
      this.stationSubtitleEl.textContent = bookmark.subtitle;
      this.lastPurgeMode = purgeMode;
    }

    // Update station tab active state
    this.stationTabs.forEach((btn, idx) => {
      btn.classList.toggle('ac-active', idx === state.activeStation);
    });

    // Collapse/Expand state
    this.dockBodyEl.classList.toggle('ac-dock-collapsed', state.dockCollapsed);
    this.collapseBtnEl.textContent = state.dockCollapsed
      ? '▴ Show Controls (H)'
      : '▾ Hide Controls (H)';
    this.audioBtnEl.textContent = state.audioMuted ? 'Sound: MUTED' : 'Sound: ON';

    // Rebuild context-specific controls only when station or selected agent changes
    if (
      this.lastRenderedStation !== state.activeStation ||
      (state.activeStation === 2 && this.lastRenderedAgent !== state.activeAgentId)
    ) {
      this.lastRenderedStation = state.activeStation;
      this.lastRenderedAgent = state.activeAgentId;
      this.renderContextControls(state);
    }

    // Update live numeric readouts inside the active context panel
    this.updateLiveReadouts(state);
  }

  private renderContextControls(state: DiagnosticState) {
    if (state.activeStation === 0) {
      const pct = Math.round(state.purgeProgress * 100);
      this.contextPanelEl.innerHTML = `
        <div class="ac-valve-control-row">
          <span class="ac-valve-end-label">Legacy AI (Decorative Wallpaper)</span>
          <input
            id="ac-purge-slider"
            type="range"
            min="0"
            max="100"
            step="1"
            value="${pct}"
            aria-label="Purge Bloat Interactive Valve"
            class="ac-purge-slider"
          />
          <span class="ac-valve-end-label ac-cyan">ARTIFICIAL CRAFT (Deterministic Pipeline)</span>
          <button id="ac-purge-max-btn" class="ac-btn-primary">
            Flush Bloat (100%)
          </button>
        </div>
      `;
      this.purgeInput = this.contextPanelEl.querySelector('#ac-purge-slider')!;
      this.purgeInput.addEventListener('input', () => {
        this.callbacks.onPurgeSliderChange(Number(this.purgeInput.value) / 100);
      });
      this.contextPanelEl.querySelector('#ac-purge-max-btn')?.addEventListener('click', () => {
        const nextVal = state.purgeProgress > 0.9 ? 0 : 1;
        this.callbacks.onPurgeSliderChange(nextVal);
      });
    } else if (state.activeStation === 1) {
      this.contextPanelEl.innerHTML = `
        <div class="ac-bento-readout-row">
          <div class="ac-bento-cell">
            <span class="ac-cell-title">01. THE BRAIN (Decoupled Reasoning)</span>
            <span id="ac-readout-brain" class="ac-cell-metric">Hover 3D Point Cloud to attract neural nodes</span>
          </div>
          <div class="ac-bento-cell">
            <span class="ac-cell-title">02. THE MUSCLE (Deterministic Piston)</span>
            <span id="ac-readout-muscle" class="ac-cell-metric">Cycles: ${state.pistonCycleCount} · Drift: 0.000%</span>
          </div>
          <div class="ac-bento-cell">
            <span class="ac-cell-title">03. THE CANVAS ($0.00 Cloud Render)</span>
            <span id="ac-readout-canvas" class="ac-cell-metric ac-cyan">CLOUD RENDER FEE: $0.00 / 60 FPS CLIENT GPU</span>
          </div>
          <button id="ac-deform-btn" class="ac-btn-primary">
            Pulse 3D Sandbox Mesh
          </button>
        </div>
      `;
      this.contextPanelEl.querySelector('#ac-deform-btn')?.addEventListener('click', () => {
        this.callbacks.onDeformSandbox();
      });
    } else if (state.activeStation === 2) {
      const activeAgent =
        HEADLESS_AGENTS.find((a) => a.id === state.activeAgentId) || HEADLESS_AGENTS[0];
      this.contextPanelEl.innerHTML = `
        <div class="ac-swarm-row">
          <div class="ac-swarm-buttons">
            ${HEADLESS_AGENTS.map(
              (ag) => `
              <button
                data-agent="${ag.id}"
                class="ac-agent-btn ${ag.id === state.activeAgentId ? 'ac-agent-active' : ''}"
              >
                ${ag.name}
              </button>
            `
            ).join('')}
          </div>
          <div class="ac-swarm-telemetry">
            <span class="ac-mono-kicker">${activeAgent.name.toUpperCase()} // ${activeAgent.role}</span>
            <span class="ac-swarm-desc">${activeAgent.description}</span>
          </div>
        </div>
      `;
      this.contextPanelEl.querySelectorAll('.ac-agent-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-agent')!;
          this.callbacks.onSelectAgent(id);
        });
      });
    } else if (state.activeStation === 3) {
      this.contextPanelEl.innerHTML = `
        <div class="ac-ignition-row">
          <div class="ac-ignition-info">
            <span class="ac-mono-kicker">LAUNCH CONSOLE // DIRECT CLIENT GPU EXECUTION</span>
            <span class="ac-swarm-desc">Click the 3D Electric Indigo plunger in the viewport or trigger ignition below to release pneumatic locks.</span>
          </div>
          <button id="ac-trigger-ignition-btn" class="ac-btn-ignition">
            Ignite Engine — artificialcraft.space
          </button>
        </div>
      `;
      this.contextPanelEl
        .querySelector('#ac-trigger-ignition-btn')
        ?.addEventListener('click', () => {
          this.callbacks.onTriggerIgnition();
        });
    }
  }

  private updateLiveReadouts(state: DiagnosticState) {
    if (state.activeStation === 0 && this.purgeInput) {
      const pct = String(Math.round(state.purgeProgress * 100));
      if (document.activeElement !== this.purgeInput) {
        this.purgeInput.value = pct;
      }
      const btn = this.contextPanelEl.querySelector('#ac-purge-max-btn');
      if (btn) {
        btn.textContent = state.purgeProgress > 0.9 ? 'Reset Legacy (0%)' : 'Flush Bloat (100%)';
      }
    } else if (state.activeStation === 1) {
      const brainEl = this.contextPanelEl.querySelector('#ac-readout-brain');
      const muscleEl = this.contextPanelEl.querySelector('#ac-readout-muscle');
      const canvasEl = this.contextPanelEl.querySelector('#ac-readout-canvas');
      if (brainEl) {
        brainEl.textContent = `Magnet Nodes: ${state.brainActiveNodes} · Multi-Agent Coherence: ${state.brainCoherence.toFixed(2)}%`;
      }
      if (muscleEl) {
        muscleEl.textContent = `Deterministic Cycles: ${state.pistonCycleCount} · Drift: 0.000%`;
      }
      if (canvasEl) {
        canvasEl.textContent = `CLOUD RENDER FEE: $0.00 / ${state.fps} FPS CLIENT GPU (Hits: ${state.canvasDeformCount})`;
      }
    }
  }
}
