import { EventBus } from '../core/EventBus';
import { SaveSystem } from '../systems/SaveSystem';

export class MainMenu {
  private overlay: HTMLElement;
  private saveSystem: SaveSystem;
  private eventBus = EventBus.getInstance();
  private isVisible = true;

  constructor(parent: HTMLElement, saveSystem: SaveSystem) {
    this.saveSystem = saveSystem;

    this.overlay = document.createElement('div');
    this.overlay.className = 'interactive';
    this.overlay.id = 'main-menu';
    this.overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle at center, rgba(15, 23, 42, 0.85) 0%, rgba(3, 7, 18, 0.98) 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 50;
      backdrop-filter: blur(16px);
    `;

    this.overlay.innerHTML = `
      <div style="text-align: center; max-width: 500px; padding: 20px;">
        <h1 style="font-size: 42px; letter-spacing: 6px; font-weight: 800; color: #f8fafc; margin-bottom: 8px; text-shadow: 0 0 20px rgba(56, 189, 248, 0.5);">
          THE LOST SIGNAL
        </h1>
        <p style="color: #64748b; font-size: 14px; letter-spacing: 2px; margin-bottom: 36px; text-transform: uppercase;">
          Tactical Sci-Fi Exploration
        </p>

        <div style="display: flex; flex-direction: column; gap: 14px; width: 280px; margin: 0 auto;">
          <button id="btn-start" style="
            background: #0284c7;
            color: white;
            border: none;
            padding: 14px 24px;
            font-size: 15px;
            font-weight: 600;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 4px 14px rgba(2, 132, 199, 0.4);
          ">INITIATE EXPEDITION</button>

          <button id="btn-load" style="
            background: rgba(30, 41, 59, 0.8);
            color: #e2e8f0;
            border: 1px solid rgba(56, 189, 248, 0.3);
            padding: 12px 24px;
            font-size: 14px;
            font-weight: 500;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
          ">CONTINUE TRANSMISSION</button>
        </div>

        <div style="margin-top: 48px; border-top: 1px solid rgba(56, 189, 248, 0.1); padding-top: 20px; color: #94a3b8; font-size: 12px; line-height: 1.8;">
          <div><b style="color: #cbd5e1;">WASD</b> - Movement &bull; <b style="color: #cbd5e1;">Mouse</b> - Look</div>
          <div><b style="color: #cbd5e1;">E</b> - Interact &bull; <b style="color: #cbd5e1;">M</b> - Radar Map &bull; <b style="color: #cbd5e1;">I</b> - Inventory</div>
        </div>
      </div>
    `;

    parent.appendChild(this.overlay);
    this.bindEvents();
  }

  private bindEvents(): void {
    const startBtn = this.overlay.querySelector('#btn-start')!;
    const loadBtn = this.overlay.querySelector('#btn-load')!;

    startBtn.addEventListener('click', () => {
      this.hide();
      this.eventBus.emit('GAME_STATE_CHANGED', 'PLAYING');
    });

    loadBtn.addEventListener('click', () => {
      const loaded = this.saveSystem.load();
      if (loaded) {
        this.hide();
        this.eventBus.emit('GAME_STATE_CHANGED', 'PLAYING');
      } else {
        alert('No saved signal profile detected.');
      }
    });

    // Handle Escape for pause menu toggle
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Escape') {
        this.toggle();
      }
    });
  }

  public show(): void {
    this.isVisible = true;
    this.overlay.style.display = 'flex';
    this.eventBus.emit('GAME_STATE_CHANGED', 'PAUSED');
  }

  public hide(): void {
    this.isVisible = false;
    this.overlay.style.display = 'none';
  }

  public toggle(): void {
    if (this.isVisible) {
      this.hide();
      this.eventBus.emit('GAME_STATE_CHANGED', 'PLAYING');
    } else {
      this.show();
    }
  }
}
