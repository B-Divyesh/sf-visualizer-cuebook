import './styles.css';
import { BUY_URL, cachedUnlock, captureLicenseFromUrl, forgetLicense, storeLicense, verifyLicense } from './license';
import { SceneRenderer } from './scenes';
import { clearProject, loadProject, saveProject } from './storage';
import type { Cue, CueFile, CueProject, SceneId } from './types';
import { SCENE_NAMES, cueAt, formatTime, makeCue, parseCueFile, timeToBeat } from './utils';

const FREE_CUE_LIMIT = 5;

const template = `
  <header class="topbar">
    <a class="brand" href="/" aria-label="Cuebook home"><span class="brand-mark" aria-hidden="true"></span><h1>Cuebook</h1></a>
    <div class="top-status"><span id="save-state">Saved locally</span><span class="status-dot" aria-hidden="true"></span></div>
    <button class="ghost small" id="support-button" type="button">Cuebook Plus</button>
  </header>
  <div class="offline-banner" id="offline-banner" role="status" hidden><span aria-hidden="true">↯</span> Offline and ready. Your saved set is on this device.</div>
  <main id="main" tabindex="-1">
    <section class="hero" id="empty-state">
      <div class="hero-copy">
        <p class="eyebrow">Private visual rehearsal</p>
        <h2 class="hero-title">Make every visual cue land on time.</h2>
        <p class="lede">Import a track you own, mark the moments that matter, and replay the same deterministic scene changes—offline, on your clock.</p>
        <div class="hero-actions">
          <label class="button primary file-label">Choose an audio track<input id="audio-input" type="file" accept="audio/*" /></label>
          <button class="button secondary" id="import-cues-empty" type="button">Import cue JSON</button>
        </div>
        <p class="privacy-note"><span aria-hidden="true">◉</span> Audio stays in this browser. Nothing is uploaded.</p>
      </div>
      <figure class="hero-art">
        <img src="/assets/cue-landscape.webp" srcset="/assets/cue-landscape-720.webp 720w, /assets/cue-landscape.webp 1200w" sizes="(max-width: 620px) calc(100vw - 40px), (max-width: 900px) 80vw, 52vw" width="1200" height="800" fetchpriority="high" decoding="async" alt="Five lime cue beacons positioned across an abstract glass rehearsal timeline" />
        <figcaption>Five moments. One repeatable run.</figcaption>
      </figure>
    </section>

    <section class="studio" id="studio" hidden aria-label="Cue editor">
      <div class="studio-heading">
        <div>
          <p class="eyebrow">Current set</p>
          <input class="project-title" id="project-title" aria-label="Set title" value="Untitled set" maxlength="60" />
          <p class="track-meta"><span id="track-name"></span><span aria-hidden="true">·</span><span id="track-duration"></span></p>
        </div>
        <div class="studio-actions">
          <label class="button secondary compact file-label">Replace audio<input id="replace-audio-input" type="file" accept="audio/*" /></label>
          <button class="button secondary compact" id="new-set" type="button">New set</button>
        </div>
      </div>

      <div class="performance-frame">
        <canvas id="visual-canvas" width="1280" height="720" role="img" aria-label="Deterministic visual preview. The current scene and cue are described below."></canvas>
        <div class="canvas-overlay"><span id="canvas-scene">Contour field</span><span id="canvas-cue">Before first cue</span></div>
        <div class="record-badge" id="record-badge" hidden><span></span> Recording rehearsal</div>
      </div>
      <p class="sr-only" id="canvas-description">Contour field at the start of the track.</p>
      <audio id="audio" preload="metadata"></audio>

      <div class="transport" aria-label="Audio transport">
        <button class="play-button" id="play" type="button" aria-label="Play"><span aria-hidden="true">▶</span></button>
        <div class="time-readout"><strong id="current-time">0:00.000</strong><span>/</span><span id="total-time">0:00.000</span></div>
        <label class="timeline-label"><span class="sr-only">Track position</span><input id="timeline" type="range" min="0" max="1000" value="0" /></label>
        <button class="button secondary compact" id="record" type="button">Record rehearsal</button>
      </div>

      <div class="workspace-grid">
        <section class="cue-maker" aria-labelledby="cue-maker-title">
          <div class="section-heading"><div><p class="eyebrow">At the playhead</p><h2 id="cue-maker-title">Shape the next moment</h2></div><kbd>M</kbd></div>
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

        <aside class="timing-panel" aria-labelledby="timing-title">
          <p class="eyebrow">Timing guide</p><h2 id="timing-title">Beat grid</h2>
          <div class="timing-inputs">
            <label>BPM<input id="bpm" type="number" min="20" max="300" step="0.01" value="120" inputmode="decimal" /></label>
            <label>Beat 1 offset (s)<input id="beat-offset" type="number" min="0" step="0.001" value="0" inputmode="decimal" /></label>
          </div>
          <div class="beat-now"><span>Playhead beat</span><strong id="current-beat">1.00</strong></div>
          <p class="advisory"><span aria-hidden="true">≈</span> Beat numbers are a manual guide. Cuebook always saves the exact audio time.</p>
        </aside>
      </div>

      <section class="cue-sheet" aria-labelledby="cue-sheet-title">
        <div class="section-heading sheet-heading">
          <div><p class="eyebrow">Run of show</p><h2 id="cue-sheet-title">Cue sheet <span id="cue-count">0</span></h2></div>
          <div class="sheet-actions">
            <button class="button secondary compact" id="import-cues" type="button">Import JSON</button>
            <button class="button secondary compact" id="export-cues" type="button">Export JSON</button>
          </div>
        </div>
        <div class="cue-empty" id="cue-empty"><span class="empty-beacon" aria-hidden="true"></span><p>No cues yet. Play to a transition, choose a scene, then mark it.</p></div>
        <ol class="cue-list" id="cue-list"></ol>
      </section>
    </section>
  </main>

  <dialog id="plus-dialog" aria-labelledby="plus-title">
    <form method="dialog" class="dialog-shell"><button class="dialog-close" value="close" aria-label="Close Cuebook Plus">×</button>
      <p class="eyebrow">One-time unlock</p><h2 id="plus-title">Rehearse without limits.</h2>
      <p>Cuebook Plus adds unlimited cues and downloadable rehearsal recordings. Core cue export, all scenes, and accessibility stay free.</p>
      <p class="price"><strong>US$12</strong> one time <span>No subscription</span></p>
      <a class="button primary wide" href="${BUY_URL}">Buy Cuebook Plus</a>
      <div class="restore-block"><label for="license-input">Already purchased? Paste your license</label><div><input id="license-input" autocomplete="off" spellcheck="false" /><button id="restore-license" class="button secondary" type="button">Verify</button></div></div>
      <p class="license-status" id="license-status" role="status"></p>
      <p class="legal-note">Checkout is hosted by Sociobot, with Dodo as merchant of record. Refunds are handled there. <a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a></p>
    </form>
  </dialog>
  <input id="cue-file-input" type="file" accept="application/json,.json" hidden />
  <div class="toast" id="toast" role="status" aria-live="polite" hidden></div>
  <footer><span>Cuebook runs locally.</span><nav aria-label="Legal"><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a></nav><span>Original visuals · AI-generated onboarding art</span></footer>
`;

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('App root is missing.');
root.innerHTML = template;

class CuebookApp {
  private project?: CueProject;
  private renderer: SceneRenderer;
  private audioUrl?: string;
  private selectedScene: SceneId = 'contour';
  private unlocked = cachedUnlock();
  private animationFrame = 0;
  private recorder?: MediaRecorder;
  private chunks: Blob[] = [];
  private pendingSave?: number;
  private pendingCueFile?: CueFile;

  private audio = this.el<HTMLAudioElement>('audio');
  private canvas = this.el<HTMLCanvasElement>('visual-canvas');
  private empty = this.el<HTMLElement>('empty-state');
  private studio = this.el<HTMLElement>('studio');
  private cueList = this.el<HTMLOListElement>('cue-list');
  private cueFileInput = this.el<HTMLInputElement>('cue-file-input');

  constructor() {
    this.renderer = new SceneRenderer(this.canvas);
    this.bindEvents();
    this.updateNetworkStatus();
    captureLicenseFromUrl();
    this.unlocked = cachedUnlock();
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
      if (this.project?.audioBlob) this.loadProjectIntoUi();
    } catch {
      this.toast('Local storage could not be opened. You can still rehearse, but refresh will lose this set.', 'error');
    }
    const verdict = await verifyLicense();
    if (verdict !== undefined) {
      this.unlocked = verdict;
      this.updateLicenseUi();
      if (!verdict && localStorage.getItem('sb_license:visualizer-cuebook')) this.toast('Your license is no longer active.', 'error');
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
    this.el<HTMLButtonElement>('add-cue').addEventListener('click', () => this.addCue());
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
    this.el<HTMLButtonElement>('support-button').addEventListener('click', () => this.el<HTMLDialogElement>('plus-dialog').showModal());
    this.el<HTMLButtonElement>('restore-license').addEventListener('click', () => void this.restoreLicense());
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
      const replacing = Boolean(this.project);
      this.project = {
        id: 'current', title: replacing ? this.project?.title ?? file.name.replace(/\.[^.]+$/, '') : file.name.replace(/\.[^.]+$/, ''),
        audioName: file.name, audioType: file.type, duration, bpm: this.project?.bpm ?? 120,
        beatOffset: this.project?.beatOffset ?? 0, cues: replacing ? this.project?.cues ?? [] : [], updatedAt: new Date().toISOString(), audioBlob: file
      };
      await saveProject(this.project);
      this.loadProjectIntoUi();
      if (this.pendingCueFile) {
        this.applyCueFile(this.pendingCueFile);
        this.pendingCueFile = undefined;
      }
      this.toast(replacing ? 'Audio replaced. Existing cues were kept.' : 'Track saved locally. Mark your first cue when ready.');
    } catch {
      this.toast('Cuebook could not read that audio file. Try a different format.', 'error');
      this.setSaveState('Not saved');
    }
  }

  private readDuration(blob: Blob): Promise<number> {
    return new Promise((resolve, reject) => {
      const probe = new Audio();
      const url = URL.createObjectURL(blob);
      probe.preload = 'metadata';
      probe.onloadedmetadata = () => { const duration = probe.duration; URL.revokeObjectURL(url); Number.isFinite(duration) ? resolve(duration) : reject(); };
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
    this.el<HTMLInputElement>('project-title').value = this.project.title;
    this.el<HTMLElement>('track-name').textContent = this.project.audioName;
    this.el<HTMLElement>('track-duration').textContent = formatTime(this.project.duration);
    this.el<HTMLElement>('total-time').textContent = formatTime(this.project.duration);
    this.el<HTMLInputElement>('bpm').value = String(this.project.bpm);
    this.el<HTMLInputElement>('beat-offset').value = String(this.project.beatOffset);
    this.renderCueList();
    this.updateTimeUi();
    this.updateLicenseUi();
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

  private addCue(): void {
    if (!this.project) return;
    if (!this.unlocked && this.project.cues.length >= FREE_CUE_LIMIT) {
      this.el<HTMLElement>('license-status').textContent = 'The free cue sheet holds five cues. Your existing work is safe.';
      this.el<HTMLDialogElement>('plus-dialog').showModal();
      return;
    }
    const cue = makeCue(this.audio.currentTime, this.project, this.selectedScene);
    cue.intensity = Number(this.el<HTMLInputElement>('intensity').value);
    cue.hue = Number(this.el<HTMLInputElement>('hue').value);
    cue.note = this.el<HTMLInputElement>('cue-note').value.trim();
    this.project.cues.push(cue);
    this.project.cues.sort((a, b) => a.time - b.time);
    this.el<HTMLInputElement>('cue-note').value = '';
    this.renderCueList();
    this.queueSave();
    this.toast(`Cue marked at ${formatTime(cue.time)}.`);
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
      this.project.cues = this.project.cues.filter((item) => item.id !== cue.id);
      this.renderCueList(); this.queueSave(); this.toast('Cue removed.');
    }
  }

  private onCueListChange(event: Event): void {
    const input = event.target as HTMLInputElement | HTMLSelectElement;
    const row = input.closest<HTMLLIElement>('[data-id]');
    if (!row || !this.project || !input.dataset.field) return;
    const cue = this.project.cues.find((item) => item.id === row.dataset.id);
    if (!cue) return;
    if (input.dataset.field === 'time') {
      cue.time = Math.min(this.project.duration, Math.max(0, Number(input.value)));
      cue.beat = timeToBeat(cue.time, this.project.bpm, this.project.beatOffset);
    } else if (input.dataset.field === 'scene') cue.scene = input.value as SceneId;
    else if (input.dataset.field === 'note') cue.note = input.value.trim();
    this.project.cues.sort((a, b) => a.time - b.time);
    this.renderCueList(); this.queueSave(); this.renderPreview();
  }

  private updateTiming(): void {
    if (!this.project) return;
    const bpm = Number(this.el<HTMLInputElement>('bpm').value);
    const offset = Number(this.el<HTMLInputElement>('beat-offset').value);
    this.project.bpm = Number.isFinite(bpm) ? Math.min(300, Math.max(20, bpm)) : 120;
    this.project.beatOffset = Number.isFinite(offset) ? Math.max(0, offset) : 0;
    this.project.cues.forEach((cue) => cue.beat = timeToBeat(cue.time, this.project!.bpm, this.project!.beatOffset));
    this.renderCueList(); this.updateTimeUi(); this.queueSave();
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
    this.toast('Cue JSON exported. Audio was not included.');
  }

  private async importCues(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0]; input.value = '';
    if (!file) return;
    try {
      const parsed = parseCueFile(JSON.parse(await file.text()));
      if (!this.project) {
        this.toast('Cue JSON loaded. Choose its matching audio track to continue.');
        this.pendingCueFile = parsed;
        this.el<HTMLInputElement>('audio-input').click();
        return;
      }
      this.applyCueFile(parsed);
    } catch (error) {
      this.toast(error instanceof Error ? error.message : 'Cue JSON could not be read.', 'error');
    }
  }

  private applyCueFile(file: CueFile): void {
    if (!this.project) return;
    if (!this.unlocked && file.cues.length > FREE_CUE_LIMIT) {
      this.toast(`Imported the first ${FREE_CUE_LIMIT} cues. Plus unlocks the full sheet.`, 'error');
    }
    this.project.title = file.title || this.project.title;
    this.project.bpm = file.timing.bpm;
    this.project.beatOffset = file.timing.beatOffset;
    this.project.cues = this.unlocked ? file.cues : file.cues.slice(0, FREE_CUE_LIMIT);
    this.loadProjectIntoUi(); this.queueSave(); this.toast('Cue sheet imported. Check that the audio matches.');
  }

  private async newSet(): Promise<void> {
    if (!confirm(`Start a new set? “${this.project?.title ?? 'This set'}” will be removed from this device. Export first if you want a copy.`)) return;
    this.audio.pause();
    await clearProject();
    this.project = undefined;
    if (this.audioUrl) URL.revokeObjectURL(this.audioUrl);
    this.audio.removeAttribute('src');
    this.studio.hidden = true; this.empty.hidden = false;
    this.toast('Local set removed.');
  }

  private async toggleRecording(): Promise<void> {
    if (!this.unlocked) { this.el<HTMLDialogElement>('plus-dialog').showModal(); return; }
    if (this.recorder?.state === 'recording') { this.recorder.stop(); return; }
    if (!('MediaRecorder' in window) || !this.canvas.captureStream) {
      this.toast('Rehearsal recording is not supported here. Use a current Chromium or Firefox browser.', 'error'); return;
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
      this.toast('This browser cannot capture track audio. Try Chrome on desktop.', 'error');
    }
  }

  private async restoreLicense(): Promise<void> {
    const input = this.el<HTMLInputElement>('license-input');
    const status = this.el<HTMLElement>('license-status');
    if (!input.value.trim()) { status.textContent = 'Paste the license from your receipt.'; return; }
    storeLicense(input.value);
    status.textContent = 'Checking license…';
    const verdict = await verifyLicense(true);
    if (verdict === true) { this.unlocked = true; status.textContent = 'Plus is unlocked on this device.'; input.value = ''; this.updateLicenseUi(); }
    else if (verdict === false) { forgetLicense(); this.unlocked = false; status.textContent = 'That license is not active. Check the token and try again.'; }
    else status.textContent = 'Could not reach verification. Check your connection and try again.';
  }

  private updateLicenseUi(): void {
    this.el<HTMLButtonElement>('support-button').textContent = this.unlocked ? 'Plus unlocked' : 'Cuebook Plus';
    this.el<HTMLButtonElement>('record').title = this.unlocked ? 'Capture the canvas and track audio as WebM' : 'Available with Cuebook Plus';
  }

  private onShortcut(event: KeyboardEvent): void {
    if (!this.project || event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target as HTMLElement;
    if (/INPUT|SELECT|TEXTAREA|BUTTON/.test(target.tagName)) return;
    if (event.code === 'Space') { event.preventDefault(); void this.togglePlay(); }
    if (event.key.toLowerCase() === 'm') { event.preventDefault(); this.addCue(); }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); this.audio.currentTime = Math.max(0, Math.min(this.project.duration, this.audio.currentTime + (event.key === 'ArrowRight' ? 1 : -1))); this.updateTimeUi();
    }
  }

  private queueSave(): void {
    if (!this.project) return;
    this.setSaveState('Saving…');
    if (this.pendingSave) clearTimeout(this.pendingSave);
    this.pendingSave = window.setTimeout(async () => {
      try { if (this.project) await saveProject(this.project); this.setSaveState('Saved locally'); }
      catch { this.setSaveState('Save failed'); this.toast('Changes could not be saved locally. Export a cue JSON before closing.', 'error'); }
    }, 250);
  }

  private setSaveState(value: string): void { this.el<HTMLElement>('save-state').textContent = value; }
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
