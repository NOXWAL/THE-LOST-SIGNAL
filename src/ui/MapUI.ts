import { EventBus } from '../core/EventBus';
import { MapSystem } from '../systems/MapSystem';
import { DISTRICTS } from '../world/DistrictData';

export class MapUI {
  private overlay: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mapSystem: MapSystem;
  private eventBus = EventBus.getInstance();
  private isOpen = false;

  private zoom = 1.0;
  private offsetX = 0;
  private offsetY = 0;

  constructor(parent: HTMLElement, mapSystem: MapSystem) {
    this.mapSystem = mapSystem;

    this.overlay = document.createElement('div');
    this.overlay.className = 'interactive';
    this.overlay.id = 'map-ui';
    this.overlay.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 780px;
      max-width: 95vw;
      height: 640px;
      max-height: 90vh;
      background: radial-gradient(circle at center, rgba(15, 23, 42, 0.98) 0%, rgba(3, 7, 18, 0.99) 100%);
      border: 1px solid rgba(56, 189, 248, 0.4);
      border-radius: 12px;
      padding: 20px;
      display: none;
      box-shadow: 0 0 50px rgba(0, 0, 0, 0.9), 0 0 25px rgba(56, 189, 248, 0.2);
      backdrop-filter: blur(16px);
      z-index: 60;
      flex-direction: column;
    `;

    this.overlay.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(56, 189, 248, 0.2); padding-bottom: 12px; margin-bottom: 12px;">
        <div>
          <div style="font-size: 16px; font-weight: 800; color: #38bdf8; letter-spacing: 2px;">TACTICAL DISTRICT SATELLITE GRID</div>
          <div style="font-size: 11px; color: #94a3b8; font-family: monospace;">REAL-TIME GPS TELEMETRY • FREQUENCY SYNCHRONIZED</div>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <button id="map-zoom-in" style="background: rgba(30, 41, 59, 0.8); border: 1px solid #38bdf8; color: #f8fafc; width: 28px; height: 28px; border-radius: 4px; cursor: pointer;">+</button>
          <button id="map-zoom-out" style="background: rgba(30, 41, 59, 0.8); border: 1px solid #38bdf8; color: #f8fafc; width: 28px; height: 28px; border-radius: 4px; cursor: pointer;">-</button>
          <button id="map-close-btn" style="background: none; border: none; color: #94a3b8; font-size: 20px; cursor: pointer; margin-left: 8px;">✕</button>
        </div>
      </div>

      <div style="position: relative; flex: 1; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); background: #020617;">
        <canvas id="world-map-canvas" width="740" height="480" style="width: 100%; height: 100%;"></canvas>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; font-size: 11px; color: #94a3b8;">
        <div style="display: flex; gap: 16px;">
          <span><b style="color: #38bdf8;">●</b> Player</span>
          <span><b style="color: #ef4444;">◆</b> Main Mission</span>
          <span><b style="color: #f59e0b;">■</b> Informant / NPC</span>
          <span><b style="color: #06b6d4;">▲</b> Resonance Beacon</span>
        </div>
        <div id="map-coords-display" style="font-family: monospace; color: #38bdf8;">X: 0.0 | Z: 0.0</div>
      </div>
    `;

    parent.appendChild(this.overlay);
    this.canvas = this.overlay.querySelector('#world-map-canvas')!;
    this.ctx = this.canvas.getContext('2d')!;

    this.bindEvents();
  }

  private bindEvents(): void {
    this.eventBus.on('MAP_TOGGLED', (open) => {
      this.isOpen = open;
      this.overlay.style.display = this.isOpen ? 'flex' : 'none';
      if (this.isOpen) this.draw();
    });

    this.overlay.querySelector('#map-close-btn')!.addEventListener('click', () => {
      this.mapSystem.toggle();
    });

    this.overlay.querySelector('#map-zoom-in')!.addEventListener('click', () => {
      this.zoom = Math.min(2.5, this.zoom + 0.3);
      this.draw();
    });

    this.overlay.querySelector('#map-zoom-out')!.addEventListener('click', () => {
      this.zoom = Math.max(0.6, this.zoom - 0.3);
      this.draw();
    });

    this.eventBus.on('PLAYER_MOVED', (payload) => {
      const display = this.overlay.querySelector('#map-coords-display');
      if (display) {
        display.textContent = `X: ${payload.position.x.toFixed(1)} | Z: ${payload.position.z.toFixed(1)} | Y: ${payload.position.y.toFixed(1)}`;
      }
      if (this.isOpen) this.draw();
    });
  }

  public draw(): void {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, w, h);

    // Coordinate mapping center
    const cx = w / 2 + this.offsetX;
    const cy = h / 2 + this.offsetY;
    const scale = 0.55 * this.zoom;

    // Grid lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Draw District Sectors
    const districtDrawings = [
      { name: 'DOWNTOWN HUB', x1: 80, x2: 380, z1: 80, z2: 380, color: 'rgba(56, 189, 248, 0.12)', border: '#38bdf8' },
      { name: 'WESTSIDE RESIDENTIAL', x1: -240, x2: 80, z1: 80, z2: 380, color: 'rgba(245, 158, 11, 0.12)', border: '#f59e0b' },
      { name: 'SOUTHPORT INDUSTRIAL', x1: 80, x2: 380, z1: -240, z2: 80, color: 'rgba(16, 185, 129, 0.12)', border: '#10b981' },
      { name: 'NORTHWOOD FOREST', x1: -360, x2: 80, z1: -360, z2: 80, color: 'rgba(99, 102, 241, 0.12)', border: '#6366f1' },
      { name: 'SITE-ZERO (UNDERGROUND)', x1: 450, x2: 750, z1: 450, z2: 750, color: 'rgba(6, 182, 212, 0.15)', border: '#06b6d4' }
    ];

    districtDrawings.forEach((d) => {
      const rx = cx + d.x1 * scale;
      const ry = cy + d.z1 * scale;
      const rw = (d.x2 - d.x1) * scale;
      const rh = (d.z2 - d.z1) * scale;

      ctx.fillStyle = d.color;
      ctx.fillRect(rx, ry, rw, rh);
      ctx.strokeStyle = d.border;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(rx, ry, rw, rh);

      ctx.fillStyle = d.border;
      ctx.font = '10px monospace';
      ctx.fillText(d.name, rx + 10, ry + 18);
    });

    // Draw Markers
    const markers = this.mapSystem.getMarkers();
    markers.forEach((m) => {
      const mx = cx + m.position.x * scale;
      const my = cy + m.position.z * scale;

      if (m.type === 'player') {
        // Player cursor
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(mx, my, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('YOU', mx + 10, my + 4);
      } else if (m.type === 'main_quest') {
        // Quest Diamond
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(mx, my - 7);
        ctx.lineTo(mx + 7, my);
        ctx.lineTo(mx, my + 7);
        ctx.lineTo(mx - 7, my);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#f87171';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(m.title, mx + 10, my + 4);
      } else {
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(mx, my, 4, 0, Math.PI * 2);
        ctx.fill();

        if (m.discovered) {
          ctx.fillStyle = '#cbd5e1';
          ctx.font = '10px sans-serif';
          ctx.fillText(m.title, mx + 8, my + 3);
        }
      }
    });
  }
}
