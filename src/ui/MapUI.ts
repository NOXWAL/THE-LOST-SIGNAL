import { EventBus } from '../core/EventBus';
import { MapSystem } from '../systems/MapSystem';

export class MapUI {
  private overlay: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mapSystem: MapSystem;
  private eventBus = EventBus.getInstance();
  private isOpen = false;

  constructor(parent: HTMLElement, mapSystem: MapSystem) {
    this.mapSystem = mapSystem;

    this.overlay = document.createElement('div');
    this.overlay.className = 'interactive';
    this.overlay.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 500px;
      height: 500px;
      background: rgba(10, 15, 30, 0.95);
      border: 2px solid #38bdf8;
      border-radius: 12px;
      padding: 16px;
      display: none;
      box-shadow: 0 0 40px rgba(56, 189, 248, 0.25);
      backdrop-filter: blur(12px);
    `;

    this.overlay.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span style="font-size: 14px; font-weight: 700; color: #38bdf8; letter-spacing: 1px;">SECTOR FREQUENCY RADAR [M]</span>
        <button id="map-close-btn" style="background: none; border: none; color: #94a3b8; font-size: 18px; cursor: pointer;">✕</button>
      </div>
      <canvas id="map-canvas" width="468" height="420" style="background: #030712; border-radius: 6px;"></canvas>
    `;
    parent.appendChild(this.overlay);

    this.canvas = this.overlay.querySelector('#map-canvas')!;
    this.ctx = this.canvas.getContext('2d')!;

    this.bindEvents();
  }

  private bindEvents(): void {
    this.eventBus.on('MAP_TOGGLED', (open) => {
      this.isOpen = open;
      this.overlay.style.display = this.isOpen ? 'block' : 'none';
      if (this.isOpen) this.draw();
    });

    this.overlay.querySelector('#map-close-btn')!.addEventListener('click', () => {
      this.mapSystem.toggle();
    });

    this.eventBus.on('PLAYER_MOVED', () => {
      if (this.isOpen) this.draw();
    });
  }

  public draw(): void {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, w, h);

    // Draw radar grid
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
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

    // Concentric circles
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 80, 0, Math.PI * 2);
    ctx.arc(w / 2, h / 2, 160, 0, Math.PI * 2);
    ctx.stroke();

    const scale = 2.0; // World to map ratio
    const markers = this.mapSystem.getMarkers();

    markers.forEach((m) => {
      const mapX = w / 2 + m.position.x * scale;
      const mapY = h / 2 + m.position.z * scale;

      if (mapX < 0 || mapX > w || mapY < 0 || mapY > h) return;

      if (m.type === 'player') {
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(mapX, mapY, 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (m.type === 'signal_beacon') {
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.arc(mapX, mapY, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px monospace';
        ctx.fillText(m.title, mapX + 8, mapY + 3);
      } else if (m.type === 'npc') {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(mapX, mapY, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px monospace';
        ctx.fillText(m.title, mapX + 8, mapY + 3);
      }
    });
  }
}
