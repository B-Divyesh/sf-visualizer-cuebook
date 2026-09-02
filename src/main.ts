import './styles.css';
import { SceneRenderer } from './scenes';
import { clearProject, isDemoMode, loadProject, saveProject } from './storage';
import type { Cue, CueFile, CueProject, SceneId } from './types';
import { SCENE_NAMES, cueAt, formatTime, makeCue, parseCueFile, timeToBeat, validateCueFileDuration } from './utils';

const DEMO_MODE = isDemoMode();

type PendingAudioReplacement = {
  file: File;
  duration: number;
  affectedCueIds: string[];
};

const template = `
  <header class="topbar">
    <a class="brand" href="/" aria-label="Cuebook home"><span class="brand-mark" aria-hidden="true"></span><span class="brand-title">Cuebook</span></a>
    <nav class="top-nav" aria-label="Main navigation"><a href="/?demo=1">Demo</a><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a></nav>
    <div class="top-status"><span id="save-state">${DEMO_MODE ? 'Demo changes reset on reload' : 'Saved locally'}</span><span class="status-dot" aria-hidden="true"></span></div>
  </header>
  <div class="offline-banner" id="offline-banner" role="status" hidden><span aria-hidden="true">↯</span> Offline and ready. Your saved set is on this device.</div>
  <section class="demo-banner" id="demo-banner" aria-label="Demo controls" ${DEMO_MODE ? '' : 'hidden'}><strong>Demo — sample data, nothing is saved</strong><button id="reset-demo" type="button">Reset demo</button><a href="/">Start for real</a></section>
  <main id="main" tabindex="-1">
    <section class="hero" id="empty-state" ${DEMO_MODE ? 'hidden' : ''}>
      <div class="hero-copy" id="hero-copy">
        <p class="eyebrow">Private visual rehearsal</p>
        <h1 class="hero-title" id="page-title" tabindex="-1">Build repeatable visual cues for your track.</h1>
        <p class="lede">For DJs, VJs, and educators who need repeatable scene changes from their own track.</p>
        <div class="hero-actions">
          <a class="button primary" href="/?demo=1">Try it with sample data</a>
          <label class="button secondary file-label">Choose your track<input id="audio-input" type="file" accept="audio/*" /></label>
          <button class="button secondary" id="import-cues-empty" type="button">Import a cue file</button>
        </div>
        <p class="action-note">Opens a 12-second rehearsal with five editable cues. Your saved set stays unchanged.</p>
        <ul class="plain-facts"><li>Your track stays in this browser.</li><li>Saved sets work offline.</li><li>All rehearsal tools are free.</li></ul>
      </div>
      <figure class="hero-art">
        <img src="/assets/cue-landscape.webp" srcset="/assets/cue-landscape-720.webp 720w, /assets/cue-landscape.webp 1200w" sizes="(max-width: 620px) calc(100vw - 40px), (max-width: 900px) 80vw, 52vw" width="1200" height="800" fetchpriority="high" decoding="async" alt="Five lime cue beacons positioned across an abstract glass rehearsal timeline" />
        <figcaption>Five saved cues trigger repeatable scene changes.</figcaption>
      </figure>
    </section>

    <section class="landing-detail" aria-labelledby="preview-title" ${DEMO_MODE ? 'hidden' : ''}>
      <div class="section-intro"><p class="eyebrow">Sample cue sheet</p><h2 id="preview-title">See the cue sheet before you import</h2><p>Each cue lists its time, scene, and note before you import a track.</p></div>
      <ol class="preview-cues"><li><span>00:00</span><strong>Contour</strong><small>Opening contour</small></li><li><span>00:04.800</span><strong>Shards</strong><small>Break into shards</small></li><li><span>00:09.600</span><strong>Contour</strong><small>Closing horizon</small></li></ol>
    </section>
    <section class="landing-detail how-it-works" aria-labelledby="how-title" ${DEMO_MODE ? 'hidden' : ''}>
      <div class="section-intro"><p class="eyebrow">How it works</p><h2 id="how-title">Rehearse a scene change in three steps</h2></div>
      <ol><li><strong>Choose a track</strong><span>Keep it in this browser.</span></li><li><strong>Mark each change</strong><span>Pick a scene at the playhead.</span></li><li><strong>Play it again</strong><span>Check the same run before you perform.</span></li></ol>
    </section>
    <section class="landing-detail privacy-detail" aria-labelledby="privacy-title" ${DEMO_MODE ? 'hidden' : ''}>
      <div class="section-intro"><p class="eyebrow">Privacy and limits</p><h2 id="privacy-title">What Cuebook keeps on this device</h2></div>
      <p>Your track and set stay in this browser. Beat numbers use the BPM and offset you enter. Export a cue file to keep a copy.</p><a href="/privacy/">Read the privacy details</a>
    </section>
    <section class="studio" id="studio" hidden aria-label="Cue editor">
      <div class="studio-heading">
        <div>
          <p class="eyebrow">Current set</p>
          <input class="project-title" id="project-title" aria-label="Set title" value="Untitled set" maxlength="60" />
          <p class="track-meta"><span id="track-name"></span><span aria-hidden="true">·</span><span id="track-duration"></span></p>
        </div>
        <div class="studio-actions">
          <label class="button secondary compact file-label">Replace track<input id="replace-audio-input" type="file" accept="audio/*" /></label>
          <button class="button secondary compact" id="new-set" type="button">Start a new set</button>
        </div>
      </div>

      <div class="performance-frame">
        <canvas id="visual-canvas" width="1280" height="720" role="img" aria-label="Deterministic visual preview. The current scene and cue are described below."></canvas>
        <div class="canvas-overlay"><span id="canvas-scene">Contour</span><span id="canvas-cue">Before first cue</span></div>
        <div class="record-badge" id="record-badge" hidden><span></span> Recording rehearsal</div>
      </div>
      <p class="sr-only" id="canvas-description">Contour at the start of the track.</p>
      <audio id="audio" preload="metadata"></audio>

      <div class="transport" aria-label="Track transport">
        <button class="play-button" id="play" type="button" aria-label="Play"><span aria-hidden="true">▶</span></button>
        <div class="time-readout"><strong id="current-time">0:00.000</strong><span>/</span><span id="total-time">0:00.000</span></div>
        <label class="timeline-label"><span class="sr-only">Track position</span><input id="timeline" type="range" min="0" max="1000" value="0" /></label>
        <button class="button secondary compact" id="record" type="button">Record rehearsal</button>
      </div>

      <div class="workspace-grid">
        <section class="cue-maker" aria-labelledby="cue-maker-title">
          <div class="section-heading"><div><p class="eyebrow">At the playhead</p><h2 id="cue-maker-title">Add the next cue</h2></div><kbd>M</kbd></div>
          <fieldset class="scene-picker"><legend>Visual scene</legend>
            <button type="button" data-scene="contour" aria-pressed="true"><span class="scene-icon contour-icon" aria-hidden="true"></span>Contour</button>
            <button type="button" data-scene="orbital" aria-pressed="false"><span class="scene-icon orbit-icon" aria-hidden="true"></span>Orbit</button>
            <button type="button" data-scene="shards" aria-pressed="false"><span class="scene-icon shard-icon" aria-hidden="true"></span>Shards</button>
          </fieldset>
          <div class="parameter-row">
            <label>Intensity <output id="intensity-output">72%</output><input id="intensity" type="range" min="0" max="100" value="72" /></label>
            <label>Color shift <output id="hue-output">0°</output><input id="hue" type="range" min="-180" max="180" value="0" /></label>
          </div>
          <label class="note-field">Cue note <input id="cue-note" maxlength="120" placeholder="e.g. chorus opens" /></label>
          <button class="button primary wide" id="add-cue" type="button">Mark cue at <span id="mark-time">0:00.000</span></button>
          <p class="shortcut-hint">Space plays or pauses · M marks a cue · ←/→ nudges 1 second</p>
        </section>

        <section class="timing-panel" aria-labelledby="timing-title">
          <p class="eyebrow">Timing guide</p><h2 id="timing-title">Beat grid</h2>
          <div class="timing-inputs">
            <label>BPM<input id="bpm" type="number" min="20" max="300" step="0.01" value="120" inputmode="decimal" /></label>
            <label>Beat 1 offset (s)<input id="beat-offset" type="number" min="0" step="0.001" value="0" inputmode="decimal" /></label>
          </div>
          <div class="beat-now"><span>Playhead beat</span><strong id="current-beat">1.00</strong></div>
          <p class="advisory"><span aria-hidden="true">≈</span> Beat numbers use the BPM and offset you enter. Cue times stay at the selected track time.</p>
        </section>
      </div>

      <section class="cue-sheet" aria-labelledby="cue-sheet-title">
        <div class="section-heading sheet-heading">
          <div><p class="eyebrow">Run of show</p><h2 id="cue-sheet-title">Cue sheet <span id="cue-count">0</span></h2></div>
          <div class="sheet-actions">
            <button class="button secondary compact" id="import-cues" type="button">Import a cue file</button>
            <button class="button secondary compact" id="export-cues" type="button">Export cue file</button>
          </div>
        </div>
        <div class="cue-empty" id="cue-empty"><span class="empty-beacon" aria-hidden="true"></span><p>No cues yet. Play to a transition, choose a scene, then mark it.</p></div>
        <ol class="cue-list" id="cue-list"></ol>
      </section>
    </section>
  </main>

  <dialog id="replace-audio-dialog" aria-labelledby="replace-audio-title" aria-describedby="replace-audio-copy">
    <div class="dialog-shell">
      <p class="eyebrow">Shorter replacement</p><h2 id="replace-audio-title">Some cues cannot play on this track.</h2>
      <p id="replace-audio-copy"></p>
      <p class="legal-note">Your current track and cues stay unchanged unless you confirm.</p>
      <div class="dialog-actions"><button class="button secondary" id="cancel-audio-replacement" type="button">Keep current track</button><button class="button primary" id="confirm-audio-replacement" type="button">Remove later cues and replace track</button></div>
    </div>
  </dialog>
  <dialog id="delete-cue-dialog" aria-labelledby="delete-cue-title" aria-describedby="delete-cue-copy">
    <div class="dialog-shell">
      <p class="eyebrow">Confirm deletion</p><h2 id="delete-cue-title">Delete this cue?</h2>
      <p id="delete-cue-copy"></p>
      <div class="dialog-actions"><button class="button secondary" id="cancel-cue-deletion" type="button">Keep cue</button><button class="button danger" id="confirm-cue-deletion" type="button">Delete this cue</button></div>
    </div>
  </dialog>
  <input id="cue-file-input" type="file" accept="application/json,.json" hidden />
  <div class="toast" id="toast" role="status" aria-live="polite" hidden></div>
  <div class="sr-only" id="route-announcer" aria-live="polite"></div>
  <footer><span>Cuebook keeps one track and its cues in this browser.</span><nav aria-label="Legal"><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a></nav><span>Built by Param Factory · v${__APP_VERSION__}</span></footer>
`;

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('App root is missing.');
root.innerHTML = template;

class CuebookApp {
  private project?: CueProject;
  private renderer: SceneRenderer;
  private audioUrl?: string;
  private selectedScene: SceneId = 'contour';
  private animationFrame = 0;
  private recorder?: MediaRecorder;
  private chunks: Blob[] = [];
  private pendingSave?: number;
  private saveChain: Promise<void> = Promise.resolve();
  private saveRevision = 0;
  private cueSaveInFlight = false;
  private pendingCueFile?: CueFile;
  private pendingAudioReplacement?: PendingAudioReplacement;
  private pendingDeleteCueId?: string;

  private audio = this.el<HTMLAudioElement>('audio');
  private canvas = this.el<HTMLCanvasElement>('visual-canvas');
  private empty = this.el<HTMLElement>('empty-state');
  private studio = this.el<HTMLElement>('studio');
  private cueList = this.el<HTMLOListElement>('cue-list');
  private cueFileInput = this.el<HTMLInputElement>('cue-file-input');

  constructor() {
    if (DEMO_MODE) {
      document.querySelector<HTMLAnchorElement>('.skip-link')!.textContent = 'Skip to cue editor';
      document.title = 'Demo — Cuebook';
      document.querySelector<HTMLLinkElement>('#canonical-url')?.setAttribute('href', 'https://visualizer-cuebook.sociobot.in/demo/');
      document.querySelector<HTMLMetaElement>('#og-url')?.setAttribute('content', 'https://visualizer-cuebook.sociobot.in/demo/');
      const demoTitle = 'Demo — Cuebook';
      const demoDescription = 'Try a 12-second Cuebook rehearsal with five editable sample cues.';
      document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', demoTitle);
      document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.setAttribute('content', demoTitle);
      document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute('content', demoDescription);
      document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')?.setAttribute('content', demoDescription);
    }
    this.renderer = new SceneRenderer(this.canvas);
    this.bindEvents();
    this.updateNetworkStatus();
    window.setTimeout(() => {
      const title = this.el<HTMLHeadingElement>('page-title');
      title.focus();
      this.el<HTMLElement>('route-announcer').textContent = DEMO_MODE ? 'Demo — Cuebook' : 'Cuebook home';
    }, 0);
    void this.boot();
  }

  private el<T extends HTMLElement>(id: string): T {
    const element = document.getElementById(id);
    if (!element) throw new Error(`Missing #${id}`);
    return element as T;
  }

  private async boot(): Promise<void> {
    try {
      this.project = await loadProject();
      if (DEMO_MODE && !this.project) {
        this.project = this.makeDemoProject();
        await this.persistProject(this.project);
      }
      if (this.project?.audioBlob) this.loadProjectIntoUi();
    } catch {
      this.toast('Local storage could not be opened. You can still rehearse, but refresh will lose this set.', 'error');
    }
    this.registerServiceWorker();
  }

  private bindEvents(): void {
    this.el<HTMLInputElement>('audio-input').addEventListener('change', (event) => void this.onAudioFile(event));
    this.el<HTMLInputElement>('replace-audio-input').addEventListener('change', (event) => void this.onAudioFile(event));
    this.el<HTMLButtonElement>('play').addEventListener('click', () => void this.togglePlay());
    this.audio.addEventListener('play', () => { this.updatePlayButton(); this.tick(); });
    this.audio.addEventListener('pause', () => this.updatePlayButton());
    this.audio.addEventListener('ended', () => this.updatePlayButton());
    this.audio.addEventListener('timeupdate', () => this.updateTimeUi());
    this.audio.addEventListener('error', () => this.toast('This browser could not decode that audio file. Try MP3, WAV, or M4A.', 'error'));
    this.el<HTMLInputElement>('timeline').addEventListener('input', (event) => {
      if (!this.project) return;
      this.audio.currentTime = Number((event.target as HTMLInputElement).value) / 1000 * this.project.duration;
      this.updateTimeUi();
    });
    document.querySelectorAll<HTMLButtonElement>('[data-scene]').forEach((button) => button.addEventListener('click', () => {
      this.selectedScene = button.dataset.scene as SceneId;
      document.querySelectorAll<HTMLButtonElement>('[data-scene]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      this.renderPreview();
    }));
    ['intensity', 'hue'].forEach((id) => this.el<HTMLInputElement>(id).addEventListener('input', () => {
      this.el<HTMLOutputElement>(`${id}-output`).value = `${this.el<HTMLInputElement>(id).value}${id === 'hue' ? '°' : '%'}`;
      this.renderPreview();
    }));
    this.el<HTMLButtonElement>('add-cue').addEventListener('click', () => void this.addCue());
    this.el<HTMLInputElement>('project-title').addEventListener('input', (event) => {
      if (!this.project) return;
      this.project.title = (event.target as HTMLInputElement).value.trim() || 'Untitled set';
      this.queueSave();
    });
    ['bpm', 'beat-offset'].forEach((id) => this.el<HTMLInputElement>(id).addEventListener('change', () => this.updateTiming()));
    this.el<HTMLButtonElement>('export-cues').addEventListener('click', () => this.exportCues());
    this.el<HTMLButtonElement>('import-cues').addEventListener('click', () => this.cueFileInput.click());
    this.el<HTMLButtonElement>('import-cues-empty').addEventListener('click', () => this.cueFileInput.click());
    this.cueFileInput.addEventListener('change', (event) => void this.importCues(event));
    this.el<HTMLButtonElement>('new-set').addEventListener('click', () => void this.newSet());
    this.el<HTMLButtonElement>('record').addEventListener('click', () => void this.toggleRecording());
    this.el<HTMLButtonElement>('reset-demo').addEventListener('click', () => void this.resetDemo());
    this.el<HTMLButtonElement>('confirm-audio-replacement').addEventListener('click', () => void this.confirmAudioReplacement());
    this.el<HTMLButtonElement>('cancel-audio-replacement').addEventListener('click', () => this.cancelAudioReplacement());
    this.el<HTMLDialogElement>('replace-audio-dialog').addEventListener('cancel', (event) => {
      event.preventDefault();
      this.cancelAudioReplacement();
    });
    this.el<HTMLButtonElement>('confirm-cue-deletion').addEventListener('click', () => void this.confirmCueDeletion());
    this.el<HTMLButtonElement>('cancel-cue-deletion').addEventListener('click', () => this.cancelCueDeletion());
    this.el<HTMLDialogElement>('delete-cue-dialog').addEventListener('cancel', (event) => {
      event.preventDefault();
      this.cancelCueDeletion();
    });
    this.cueList.addEventListener('click', (event) => this.onCueListClick(event));
    this.cueList.addEventListener('change', (event) => this.onCueListChange(event));
    window.addEventListener('online', () => this.updateNetworkStatus());
    window.addEventListener('offline', () => this.updateNetworkStatus());
    window.addEventListener('keydown', (event) => this.onShortcut(event));
  }

  private async onAudioFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (!file.type.startsWith('audio/') && !/\.(mp3|wav|m4a|aac|ogg|flac)$/i.test(file.name)) {
      this.toast('Choose an audio file such as MP3, WAV, M4A, or OGG.', 'error');
      return;
    }
    this.setSaveState('Reading audio…');
    try {
      const duration = await this.readDuration(file);
      const affectedCues = this.project?.cues.filter((cue) => cue.time > duration) ?? [];
      if (affectedCues.length > 0) {
        this.pendingAudioReplacement = { file, duration, affectedCueIds: affectedCues.map((cue) => cue.id) };
        const count = affectedCues.length;
        this.el<HTMLElement>('replace-audio-copy').textContent = `${count} ${count === 1 ? 'cue falls' : 'cues fall'} after ${file.name} ends at ${formatTime(duration)}. Remove ${count === 1 ? 'it' : 'them'} and replace the track?`;
        this.el<HTMLButtonElement>('confirm-audio-replacement').textContent = `Remove later ${count === 1 ? 'cue' : 'cues'} and replace track`;
        this.setSaveState('Saved locally');
        this.el<HTMLDialogElement>('replace-audio-dialog').showModal();
        return;
      }
      await this.applyAudioFile(file, duration);
    } catch {
      this.toast('Cuebook could not read that audio file. Try a different format.', 'error');
      this.setSaveState('Not saved');
    }
  }

  private async applyAudioFile(file: File, duration: number, removedCueIds: string[] = []): Promise<void> {
    const previous = this.project;
    const replacing = Boolean(previous);
    const removed = new Set(removedCueIds);
    const nextProject: CueProject = {
      id: 'current',
      title: replacing ? previous?.title ?? file.name.replace(/\.[^.]+$/, '') : file.name.replace(/\.[^.]+$/, ''),
      audioName: file.name,
      audioType: file.type,
      duration,
      bpm: previous?.bpm ?? 120,
      beatOffset: previous?.beatOffset ?? 0,
      cues: replacing ? (previous?.cues ?? []).filter((cue) => !removed.has(cue.id)).map((cue) => ({ ...cue })) : [],
      updatedAt: new Date().toISOString(),
      audioBlob: file
    };
    await this.persistProject(nextProject);
    this.project = nextProject;
    this.loadProjectIntoUi();
    if (this.pendingCueFile) {
      const cueFile = this.pendingCueFile;
      this.pendingCueFile = undefined;
      try {
        this.beginCueImport(cueFile);
      } catch (error) {
        this.toast(error instanceof Error ? error.message : 'Cue file could not be imported.', 'error');
      }
      return;
    }
    if (removedCueIds.length > 0) {
      this.toast(`Track replaced. Removed ${removedCueIds.length} ${removedCueIds.length === 1 ? 'cue' : 'cues'} after ${formatTime(duration)}.`);
    } else {
      this.toast(replacing ? 'Track replaced. Existing cues were kept.' : 'Track saved locally. Mark your first cue when ready.');
    }
  }

  private async confirmAudioReplacement(): Promise<void> {
    const replacement = this.pendingAudioReplacement;
    this.pendingAudioReplacement = undefined;
    this.el<HTMLDialogElement>('replace-audio-dialog').close();
    if (!replacement) return;
    this.setSaveState('Saving…');
    try {
      await this.applyAudioFile(replacement.file, replacement.duration, replacement.affectedCueIds);
    } catch {
      this.setSaveState('Save failed');
      this.toast('The replacement audio was not saved. Your current set is still available.', 'error');
    }
  }

  private cancelAudioReplacement(): void {
    this.pendingAudioReplacement = undefined;
    this.el<HTMLDialogElement>('replace-audio-dialog').close();
    this.setSaveState('Saved locally');
    this.toast('Track replacement cancelled. Your current track and cues were kept.');
  }

  private readDuration(blob: Blob): Promise<number> {
    return new Promise((resolve, reject) => {
      const probe = new Audio();
      const url = URL.createObjectURL(blob);
      probe.preload = 'metadata';
      probe.onloadedmetadata = () => {
        const duration = probe.duration;
        URL.revokeObjectURL(url);
        if (Number.isFinite(duration)) resolve(duration);
        else reject();
      };
      probe.onerror = () => { URL.revokeObjectURL(url); reject(); };
      probe.src = url;
    });
  }

  private loadProjectIntoUi(): void {
    if (!this.project?.audioBlob) return;
    if (this.audioUrl) URL.revokeObjectURL(this.audioUrl);
    this.audioUrl = URL.createObjectURL(this.project.audioBlob);
    this.audio.src = this.audioUrl;
    this.empty.hidden = true;
    this.studio.hidden = false;
    const pageTitle = this.el<HTMLHeadingElement>('page-title');
    pageTitle.textContent = 'Build repeatable visual cues for your track.';
    pageTitle.className = 'sr-only';
    this.studio.prepend(pageTitle);
    this.el<HTMLInputElement>('project-title').value = this.project.title;
    this.el<HTMLElement>('track-name').textContent = this.project.audioName;
    this.el<HTMLElement>('track-duration').textContent = formatTime(this.project.duration);
    this.el<HTMLElement>('total-time').textContent = formatTime(this.project.duration);
    this.el<HTMLInputElement>('bpm').value = String(this.project.bpm);
    this.el<HTMLInputElement>('beat-offset').value = String(this.project.beatOffset);
    this.renderCueList();
    this.updateTimeUi();
    this.setSaveState('Saved locally');
  }

  private async togglePlay(): Promise<void> {
    if (!this.project) return;
    try {
      if (this.audio.paused) await this.audio.play(); else this.audio.pause();
    } catch {
      this.toast('Playback was blocked. Select play again to allow audio.', 'error');
    }
  }

  private updatePlayButton(): void {
    const button = this.el<HTMLButtonElement>('play');
    button.innerHTML = `<span aria-hidden="true">${this.audio.paused ? '▶' : 'Ⅱ'}</span>`;
    button.setAttribute('aria-label', this.audio.paused ? 'Play' : 'Pause');
    if (this.audio.paused) cancelAnimationFrame(this.animationFrame);
  }

  private tick = (): void => {
    this.updateTimeUi();
    if (!this.audio.paused) this.animationFrame = requestAnimationFrame(this.tick);
  };

  private updateTimeUi(): void {
    if (!this.project) return;
    const time = this.audio.currentTime || 0;
    this.el<HTMLElement>('current-time').textContent = formatTime(time);
    this.el<HTMLElement>('mark-time').textContent = formatTime(time);
    this.el<HTMLInputElement>('timeline').value = String(this.project.duration ? time / this.project.duration * 1000 : 0);
    this.el<HTMLElement>('current-beat').textContent = timeToBeat(time, this.project.bpm, this.project.beatOffset).toFixed(2);
    this.renderPreview();
  }

  private previewCue(): Cue {
    return {
      id: 'preview', time: this.audio.currentTime, beat: 0, scene: this.selectedScene,
      intensity: Number(this.el<HTMLInputElement>('intensity').value), hue: Number(this.el<HTMLInputElement>('hue').value), note: ''
    };
  }

  private renderPreview(): void {
    if (!this.project) return;
    const active = cueAt(this.project.cues, this.audio.currentTime);
    const shown = active ?? this.previewCue();
    this.renderer.render(this.audio.currentTime, shown);
    this.el<HTMLElement>('canvas-scene').textContent = SCENE_NAMES[shown.scene];
    this.el<HTMLElement>('canvas-cue').textContent = active ? `${formatTime(active.time)}${active.note ? ` · ${active.note}` : ''}` : 'Before first cue';
    this.el<HTMLElement>('canvas-description').textContent = `${SCENE_NAMES[shown.scene]} at ${formatTime(this.audio.currentTime)}. ${active?.note ?? 'No saved cue active yet.'}`;
  }

  private async addCue(): Promise<void> {
    if (!this.project || this.cueSaveInFlight) return;
    const cue = makeCue(this.audio.currentTime, this.project, this.selectedScene);
    cue.intensity = Number(this.el<HTMLInputElement>('intensity').value);
    cue.hue = Number(this.el<HTMLInputElement>('hue').value);
    cue.note = this.el<HTMLInputElement>('cue-note').value.trim();
    const nextProject: CueProject = {
      ...this.project,
      cues: [...this.project.cues, cue].sort((a, b) => a.time - b.time)
    };
    if (this.pendingSave) {
      clearTimeout(this.pendingSave);
      this.pendingSave = undefined;
    }
    const revision = ++this.saveRevision;
    const markButton = this.el<HTMLButtonElement>('add-cue');
    this.cueSaveInFlight = true;
    this.studio.inert = true;
    this.studio.setAttribute('aria-busy', 'true');
    markButton.disabled = true;
    markButton.setAttribute('aria-busy', 'true');
    this.setSaveState('Saving…');
    try {
      await this.persistProject(nextProject);
      this.project = nextProject;
      this.el<HTMLInputElement>('cue-note').value = '';
      this.renderCueList();
      if (revision === this.saveRevision) this.setSaveState('Saved locally');
      this.toast(`Cue marked at ${formatTime(cue.time)}.`);
    } catch {
      this.setSaveState('Save failed');
      this.toast('The cue was not saved. Keep this page open and try marking it again.', 'error');
    } finally {
      this.cueSaveInFlight = false;
      this.studio.inert = false;
      this.studio.removeAttribute('aria-busy');
      markButton.disabled = false;
      markButton.removeAttribute('aria-busy');
    }
  }

  private renderCueList(): void {
    if (!this.project) return;
    const duration = this.project.duration;
    this.el<HTMLElement>('cue-count').textContent = String(this.project.cues.length);
    this.el<HTMLElement>('cue-empty').hidden = this.project.cues.length > 0;
    this.cueList.innerHTML = this.project.cues.map((cue, index) => `
      <li data-id="${cue.id}" class="cue-row">
        <button class="cue-seek" type="button" data-action="seek" aria-label="Go to cue ${index + 1} at ${formatTime(cue.time)}"><span>${String(index + 1).padStart(2, '0')}</span><i aria-hidden="true"></i></button>
        <label class="cue-time"><span>Time</span><input data-field="time" type="number" min="0" max="${duration}" step="0.001" value="${cue.time.toFixed(3)}" /></label>
        <div class="cue-beat"><span>Beat</span><strong>${cue.beat.toFixed(2)}</strong></div>
        <label class="cue-scene"><span>Scene</span><select data-field="scene">${Object.entries(SCENE_NAMES).map(([id, name]) => `<option value="${id}" ${cue.scene === id ? 'selected' : ''}>${name}</option>`).join('')}</select></label>
        <label class="cue-note"><span>Note</span><input data-field="note" maxlength="120" value="${this.escape(cue.note)}" aria-label="Cue ${index + 1} note" /></label>
        <button class="icon-button" type="button" data-action="delete" aria-label="Delete cue ${index + 1}">×</button>
      </li>`).join('');
  }

  private escape(value: string): string {
    const node = document.createElement('span'); node.textContent = value; return node.innerHTML;
  }

  private onCueListClick(event: Event): void {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button');
    const row = (event.target as HTMLElement).closest<HTMLLIElement>('[data-id]');
    if (!button || !row || !this.project) return;
    const cue = this.project.cues.find((item) => item.id === row.dataset.id);
    if (!cue) return;
    if (button.dataset.action === 'seek') { this.audio.currentTime = cue.time; this.updateTimeUi(); }
    if (button.dataset.action === 'delete') {
      const cueNumber = this.project.cues.indexOf(cue) + 1;
      const note = cue.note ? ` “${cue.note}”` : '';
      this.pendingDeleteCueId = cue.id;
      this.el<HTMLElement>('delete-cue-copy').textContent = `Delete cue ${cueNumber} at ${formatTime(cue.time)}?${note} will be removed from this set.`;
      this.el<HTMLDialogElement>('delete-cue-dialog').showModal();
    }
  }

  private cancelCueDeletion(): void {
    this.pendingDeleteCueId = undefined;
    this.el<HTMLDialogElement>('delete-cue-dialog').close();
  }

  private async confirmCueDeletion(): Promise<void> {
    const cueId = this.pendingDeleteCueId;
    this.pendingDeleteCueId = undefined;
    this.el<HTMLDialogElement>('delete-cue-dialog').close();
    if (!cueId || !this.project) return;
    const nextProject: CueProject = { ...this.project, cues: this.project.cues.filter((cue) => cue.id !== cueId) };
    if (nextProject.cues.length === this.project.cues.length) return;
    if (this.pendingSave) {
      clearTimeout(this.pendingSave);
      this.pendingSave = undefined;
    }
    const revision = ++this.saveRevision;
    this.studio.inert = true;
    this.studio.setAttribute('aria-busy', 'true');
    this.setSaveState('Saving…');
    try {
      await this.persistProject(nextProject);
      this.project = nextProject;
      this.renderCueList();
      this.renderPreview();
      if (revision === this.saveRevision) this.setSaveState('Saved locally');
      this.toast('Cue deleted.');
    } catch {
      this.setSaveState('Save failed');
      this.toast('The cue was not deleted. Keep this page open and try again.', 'error');
    } finally {
      this.studio.inert = false;
      this.studio.removeAttribute('aria-busy');
    }
  }

  private onCueListChange(event: Event): void {
    const input = event.target as HTMLInputElement | HTMLSelectElement;
    const row = input.closest<HTMLLIElement>('[data-id]');
    if (!row || !this.project || !input.dataset.field) return;
    const cue = this.project.cues.find((item) => item.id === row.dataset.id);
    if (!cue) return;
    if (input.dataset.field === 'time') {
      const entered = Number(input.value);
      cue.time = Number.isFinite(entered) ? Math.min(this.project.duration, Math.max(0, entered)) : cue.time;
      cue.beat = timeToBeat(cue.time, this.project.bpm, this.project.beatOffset);
    } else if (input.dataset.field === 'scene') cue.scene = input.value as SceneId;
    else if (input.dataset.field === 'note') cue.note = input.value.trim();
    this.project.cues.sort((a, b) => a.time - b.time);
    this.renderCueList(); this.queueSave(); this.renderPreview();
  }

  private updateTiming(): void {
    if (!this.project) return;
    const bpmInput = this.el<HTMLInputElement>('bpm');
    const offsetInput = this.el<HTMLInputElement>('beat-offset');
    const enteredBpm = Number(bpmInput.value);
    const enteredOffset = Number(offsetInput.value);
    const bpm = Number.isFinite(enteredBpm) ? Math.min(300, Math.max(20, enteredBpm)) : 120;
    const offset = Number.isFinite(enteredOffset) ? Math.max(0, enteredOffset) : 0;
    const wasAdjusted = bpm !== enteredBpm || offset !== enteredOffset;
    this.project.bpm = bpm;
    this.project.beatOffset = offset;
    bpmInput.value = String(bpm);
    offsetInput.value = String(offset);
    this.project.cues.forEach((cue) => cue.beat = timeToBeat(cue.time, this.project!.bpm, this.project!.beatOffset));
    this.renderCueList(); this.updateTimeUi(); this.queueSave();
    if (wasAdjusted) this.toast('Timing adjusted: BPM is 20–300 and Beat 1 offset cannot be negative.', 'error');
  }

  private exportCues(): void {
    if (!this.project) return;
    const output: CueFile = {
      format: 'cuebook/v1', title: this.project.title,
      audio: { name: this.project.audioName, duration: this.project.duration },
      timing: { bpm: this.project.bpm, beatOffset: this.project.beatOffset, clock: 'media-currentTime' },
      cues: this.project.cues, exportedAt: new Date().toISOString()
    };
    this.download(new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' }), `${this.slug(this.project.title)}.cuebook.json`);
    this.toast('Cue file exported. Audio was not included.');
  }

  private async importCues(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0]; input.value = '';
    if (!file) return;
    try {
      const parsed = parseCueFile(JSON.parse(await file.text()));
      if (!this.project) {
        this.toast('Cue file loaded. Choose its matching track to continue.');
        this.pendingCueFile = parsed;
        this.el<HTMLInputElement>('audio-input').click();
        return;
      }
      this.beginCueImport(parsed);
    } catch (error) {
      this.toast(error instanceof Error ? error.message : 'Cue file could not be read.', 'error');
    }
  }

  private beginCueImport(file: CueFile): void {
    if (!this.project) return;
    validateCueFileDuration(file, this.project.duration);
    this.applyCueFile(file);
  }

  private applyCueFile(file: CueFile): void {
    if (!this.project) return;
    validateCueFileDuration(file, this.project.duration);
    this.project.title = file.title || this.project.title;
    this.project.bpm = file.timing.bpm;
    this.project.beatOffset = file.timing.beatOffset;
    this.project.cues = file.cues.map((cue) => ({
      ...cue, beat: timeToBeat(cue.time, file.timing.bpm, file.timing.beatOffset)
    }));
    this.loadProjectIntoUi(); this.queueSave();
    this.toast('Cue sheet imported. Check that the track matches.');
  }

  private async newSet(): Promise<void> {
    if (!confirm(`Start a new set? “${this.project?.title ?? 'This set'}” will be removed from this device. Export first if you want a copy.`)) return;
    this.audio.pause();
    await clearProject();
    this.project = undefined;
    if (this.audioUrl) URL.revokeObjectURL(this.audioUrl);
    this.audio.removeAttribute('src');
    this.studio.hidden = true; this.empty.hidden = false;
    const pageTitle = this.el<HTMLHeadingElement>('page-title');
    pageTitle.textContent = 'Build repeatable visual cues for your track.';
    pageTitle.className = 'hero-title';
    this.el<HTMLElement>('hero-copy').querySelector('.eyebrow')?.after(pageTitle);
    this.toast('Local set removed.');
  }

  private makeDemoProject(): CueProject {
    const duration = 12;
    const cues = [
      { time: 0, scene: 'contour' as const, note: 'Opening contour', intensity: 46, hue: -18 },
      { time: 2.4, scene: 'orbital' as const, note: 'First pulse', intensity: 68, hue: 22 },
      { time: 4.8, scene: 'shards' as const, note: 'Break into shards', intensity: 82, hue: 64 },
      { time: 7.2, scene: 'orbital' as const, note: 'Return to orbit', intensity: 58, hue: -42 },
      { time: 9.6, scene: 'contour' as const, note: 'Closing horizon', intensity: 74, hue: 10 }
    ].map((cue, index) => ({
      id: `demo-${index + 1}`,
      beat: timeToBeat(cue.time, 100, 0),
      hue: cue.hue,
      intensity: cue.intensity,
      note: cue.note,
      scene: cue.scene,
      time: cue.time
    }));
    return {
      id: 'current',
      title: 'Neon classroom rehearsal',
      audioName: 'sample-beacon-rhythm.wav',
      audioType: 'audio/wav',
      duration,
      bpm: 100,
      beatOffset: 0,
      cues,
      updatedAt: new Date().toISOString(),
      audioBlob: this.makeSampleWav(duration)
    };
  }

  /** Original 100 BPM click-and-tone rehearsal loop. It is generated locally so
   * the demo works offline and no sample is fetched or uploaded. */
  private makeSampleWav(seconds: number): Blob {
    const sampleRate = 16_000;
    const samples = sampleRate * seconds;
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);
    const write = (offset: number, value: string): void => [...value].forEach((char, index) => view.setUint8(offset + index, char.charCodeAt(0)));
    write(0, 'RIFF'); view.setUint32(4, 36 + samples * 2, true); write(8, 'WAVEfmt ');
    view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true); view.setUint16(34, 16, true); write(36, 'data'); view.setUint32(40, samples * 2, true);
    // A short low kick on each beat plus a brighter tone on cue boundaries.
    // Keep the envelope deterministic: tests can measure non-zero PCM energy.
    for (let index = 0; index < samples; index += 1) {
      const time = index / sampleRate;
      const beatPhase = time % 0.6;
      const cuePhase = time % 2.4;
      const kick = beatPhase < 0.13 ? Math.sin(2 * Math.PI * 92 * beatPhase) * Math.exp(-beatPhase * 20) * 0.48 : 0;
      const tone = cuePhase < 0.32 ? Math.sin(2 * Math.PI * 440 * cuePhase) * Math.exp(-cuePhase * 6) * 0.20 : 0;
      const pulse = Math.sin(2 * Math.PI * 55 * time) * 0.035;
      view.setInt16(44 + index * 2, Math.max(-1, Math.min(1, kick + tone + pulse)) * 32767, true);
    }
    return new Blob([buffer], { type: 'audio/wav' });
  }

  private async resetDemo(): Promise<void> {
    if (!DEMO_MODE) return;
    this.audio.pause();
    await clearProject();
    this.project = this.makeDemoProject();
    await this.persistProject(this.project);
    this.loadProjectIntoUi();
    this.toast('Demo reset to the five sample cues.');
  }

  private async toggleRecording(): Promise<void> {
    if (this.recorder?.state === 'recording') { this.recorder.stop(); return; }
    if (!('MediaRecorder' in window) || !this.canvas.captureStream) {
      this.toast('This browser cannot capture track audio. Use a browser that supports track-audio capture.', 'error'); return;
    }
    try {
      const canvasStream = this.canvas.captureStream(30);
      const audioCapture = (this.audio as HTMLAudioElement & { captureStream?: () => MediaStream }).captureStream?.();
      if (!audioCapture) throw new Error('Audio capture unavailable');
      const stream = new MediaStream([...canvasStream.getVideoTracks(), ...audioCapture.getAudioTracks()]);
      const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus' : 'video/webm';
      this.chunks = [];
      this.recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 4_000_000 });
      this.recorder.ondataavailable = (event) => { if (event.data.size) this.chunks.push(event.data); };
      this.recorder.onstop = () => {
        this.download(new Blob(this.chunks, { type: mime }), `${this.slug(this.project?.title ?? 'rehearsal')}-rehearsal.webm`);
        this.el<HTMLElement>('record-badge').hidden = true;
        this.el<HTMLButtonElement>('record').textContent = 'Record rehearsal';
        stream.getTracks().forEach((track) => track.stop());
        this.toast('Rehearsal video saved.');
      };
      this.recorder.start(1000);
      this.el<HTMLElement>('record-badge').hidden = false;
      this.el<HTMLButtonElement>('record').textContent = 'Stop & save';
      if (this.audio.paused) await this.audio.play();
    } catch {
      this.toast('This browser cannot capture track audio. Use a browser that supports track-audio capture.', 'error');
    }
  }

  private onShortcut(event: KeyboardEvent): void {
    if (!this.project || event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target as HTMLElement;
    if (/INPUT|SELECT|TEXTAREA|BUTTON/.test(target.tagName)) return;
    if (event.code === 'Space') { event.preventDefault(); void this.togglePlay(); }
    if (event.key.toLowerCase() === 'm') { event.preventDefault(); void this.addCue(); }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); this.audio.currentTime = Math.max(0, Math.min(this.project.duration, this.audio.currentTime + (event.key === 'ArrowRight' ? 1 : -1))); this.updateTimeUi();
    }
  }

  private queueSave(): void {
    if (!this.project) return;
    const revision = ++this.saveRevision;
    this.setSaveState('Saving…');
    if (this.pendingSave) clearTimeout(this.pendingSave);
    this.pendingSave = window.setTimeout(async () => {
      this.pendingSave = undefined;
      try {
        if (this.project) await this.persistProject(this.project);
        if (revision === this.saveRevision) this.setSaveState('Saved locally');
      } catch {
        if (revision === this.saveRevision) this.setSaveState('Save failed');
        this.toast('Changes could not be saved locally. Export a cue file before closing.', 'error');
      }
    }, 250);
  }

  private persistProject(project: CueProject): Promise<void> {
    const snapshot: CueProject = { ...project, cues: project.cues.map((cue) => ({ ...cue })) };
    const save = this.saveChain.catch(() => undefined).then(() => saveProject(snapshot));
    this.saveChain = save;
    return save;
  }

  private setSaveState(value: string): void {
    this.el<HTMLElement>('save-state').textContent = DEMO_MODE ? 'Demo changes reset on reload' : value;
  }
  private updateNetworkStatus(): void { this.el<HTMLElement>('offline-banner').hidden = navigator.onLine; }
  private slug(value: string): string { return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'cuebook'; }
  private download(blob: Blob, name: string): void { const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 500); }
  private toast(message: string, type: 'info' | 'error' = 'info'): void { const toast = this.el<HTMLElement>('toast'); toast.textContent = message; toast.dataset.type = type; toast.hidden = false; setTimeout(() => toast.hidden = true, 5000); }

  private registerServiceWorker(): void {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        worker?.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) this.toast('An update is ready. Refresh when your rehearsal is paused.');
        });
      });
    }).catch(() => { /* Offline support is an enhancement; the editor remains usable. */ });
  }
}

new CuebookApp();
