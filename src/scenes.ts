import type { Cue } from './types';

const TAU = Math.PI * 2;

export class SceneRenderer {
  private context: CanvasRenderingContext2D;
  private width = 1280;
  private height = 720;
  private reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  private lastTime = 0;
  private lastCue?: Cue;

  constructor(private canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Canvas rendering is unavailable in this browser.');
    this.context = context;
    const observer = new ResizeObserver(() => this.resize());
    observer.observe(canvas);
    this.resize();
  }

  private resize(): void {
    const bounds = this.canvas.getBoundingClientRect();
    const ratio = Math.min(devicePixelRatio, 2);
    this.width = Math.max(640, Math.floor(bounds.width * ratio));
    this.height = Math.max(360, Math.floor(bounds.height * ratio));
    if (this.canvas.width !== this.width || this.canvas.height !== this.height) {
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this.render(this.lastTime, this.lastCue);
    }
  }

  render(time: number, cue?: Cue): void {
    this.lastTime = time;
    this.lastCue = cue;
    const scene = cue?.scene ?? 'contour';
    const intensity = (cue?.intensity ?? 55) / 100;
    const hue = cue?.hue ?? 0;
    const t = this.reducedMotion ? Math.floor(time * 2) / 2 : time;
    const ctx = this.context;
    const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
    gradient.addColorStop(0, `hsl(${160 + hue} 46% 6%)`);
    gradient.addColorStop(0.55, `hsl(${171 + hue} 54% 10%)`);
    gradient.addColorStop(1, `hsl(${147 + hue} 42% 5%)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);
    if (scene === 'orbital') this.orbital(t, intensity, hue);
    else if (scene === 'shards') this.shards(t, intensity, hue);
    else this.contours(t, intensity, hue);
    this.vignette();
  }

  private contours(time: number, intensity: number, hue: number): void {
    const ctx = this.context;
    ctx.lineWidth = Math.max(1.5, this.width / 800);
    for (let row = 0; row < 13; row += 1) {
      const yBase = this.height * (0.18 + row * 0.052);
      ctx.beginPath();
      for (let x = -20; x <= this.width + 20; x += 12) {
        const wave = Math.sin(x / 95 + time * (0.55 + intensity) + row * 0.6) * (12 + intensity * 25);
        const ridge = Math.cos(x / 230 - time * 0.2 + row) * 11;
        const y = yBase + wave + ridge;
        if (x < 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `hsla(${164 + hue + row * 1.3} 82% ${55 + row}% / ${0.12 + intensity * 0.055})`;
      ctx.stroke();
    }
    const x = (time * 86) % (this.width + 160) - 80;
    const beam = ctx.createLinearGradient(x - 18, 0, x + 18, 0);
    beam.addColorStop(0, 'rgba(88,230,210,0)');
    beam.addColorStop(0.5, `rgba(88,230,210,${0.25 + intensity * 0.45})`);
    beam.addColorStop(1, 'rgba(88,230,210,0)');
    ctx.fillStyle = beam;
    ctx.fillRect(x - 18, this.height * 0.12, 36, this.height * 0.72);
  }

  private orbital(time: number, intensity: number, hue: number): void {
    const ctx = this.context;
    const cx = this.width / 2;
    const cy = this.height / 2;
    for (let ring = 5; ring >= 0; ring -= 1) {
      const radius = Math.min(this.width, this.height) * (0.1 + ring * 0.065);
      ctx.beginPath();
      ctx.ellipse(cx, cy, radius * 1.55, radius, time * 0.08 + ring * 0.28, 0, TAU);
      ctx.strokeStyle = `hsla(${156 + hue + ring * 8} 88% 64% / ${0.1 + intensity * 0.09})`;
      ctx.lineWidth = 2 + (5 - ring) * 0.5;
      ctx.stroke();
    }
    for (let dot = 0; dot < 9; dot += 1) {
      const angle = time * (0.24 + intensity * 0.5) + dot * TAU / 9;
      const radius = Math.min(this.width, this.height) * (0.16 + (dot % 3) * 0.07);
      const x = cx + Math.cos(angle) * radius * 1.5;
      const y = cy + Math.sin(angle) * radius;
      ctx.beginPath();
      ctx.arc(x, y, 3 + intensity * 7, 0, TAU);
      ctx.fillStyle = dot === 0 ? '#b8ff5a' : `hsla(${176 + hue} 88% 66% / .7)`;
      ctx.fill();
    }
  }

  private shards(time: number, intensity: number, hue: number): void {
    const ctx = this.context;
    const count = 18;
    for (let index = 0; index < count; index += 1) {
      const seed = (index * 7919) % 997;
      const x = (seed / 997) * this.width;
      const phase = time * (0.08 + intensity * 0.18) + index;
      const y = this.height * (0.2 + ((seed * 17) % 700) / 1000) + Math.sin(phase) * 25;
      const size = this.width * (0.025 + ((seed * 11) % 50) / 1000);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.sin(phase * 0.4) * 0.42);
      const fill = ctx.createLinearGradient(-size, -size, size, size);
      fill.addColorStop(0, `hsla(${160 + hue} 84% 65% / ${0.08 + intensity * 0.13})`);
      fill.addColorStop(1, `hsla(${91 + hue} 94% 67% / ${0.13 + intensity * 0.2})`);
      ctx.fillStyle = fill;
      ctx.strokeStyle = `hsla(${173 + hue} 92% 76% / .32)`;
      ctx.beginPath();
      ctx.moveTo(0, -size * 1.8);
      ctx.lineTo(size, size);
      ctx.lineTo(-size * 0.7, size * 0.55);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  private vignette(): void {
    const ctx = this.context;
    const radial = ctx.createRadialGradient(this.width / 2, this.height / 2, this.height * 0.1, this.width / 2, this.height / 2, this.width * 0.66);
    radial.addColorStop(0, 'rgba(7,17,15,0)');
    radial.addColorStop(1, 'rgba(3,9,8,.66)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, this.width, this.height);
  }
}
