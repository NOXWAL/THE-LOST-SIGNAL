import { EventBus } from '../core/EventBus';
import { SaveSystem } from '../systems/SaveSystem';

export class PauseMenu {
  private overlay: HTMLElement;
  private saveSystem: SaveSystem;
  private eventBus = EventBus.getInstance();
  private isOpen = false;

  constructor(parent: HTMLElement, saveSystem: SaveSystem) {
    this.saveSystem = saveSystem;

    this.overlay = document.createElement('div');
    this.overlay.className = 'interactive';
    this.overlay.id = 'pause-menu';
    this.overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle at center, rgba(15, 23, 42, 0.85) 0%, rgba(3, 7, 18, 0.96) 100%);
      display: none;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 55;
      backdrop-filter: blur(12px);
    `;

    this.overlay.innerHTML = `
      <div style="text-align: center; max-width: 400px; width: 100%; padding: 20px;">
        <h2 style="font-size: 28px; letter-spacing: 4px; font-weight: 800; color: #38bdf8; margin-bottom: 24px;">
          EXPEDITION PAUSED
        </h2>

        <div style="display: flex; flex-direction: column; gap: 12px; width: 280px; margin: 0 auto;">
          <button id="pause-btn-resume" class="pause-menu-btn" style="background: #0284c7; color: white;">RESUME EXPEDITION</button>
          <button id="pause-btn-map" class="pause-menu-btn">TACTICAL MAP [M]</button>
          <button id="pause-btn-journal" class="pause-menu-btn">CASE DOSSIER [J]</button>
          <button id="pause-btn-inventory" class="pause-menu-btn">INVENTORY [I]</button>
          <button id="pause-btn-save" class="pause-menu-btn">SAVE MISSION PROGRESS</button>
          <button id="pause-btn-menu" class="pause-menu-btn" style="border-color: rgba(239, 68, 68, 0.4); color: #f87171;">ABORT TO MAIN MENU</button>
        </div>
      </div>
    `;

    // Apply button styling
    const style = document.createElement('style');
    style.textContent = `
      .pause-menu-btn {
        background: rgba(30, 41, 59, 0.8);
        color: #e2e8f0;
        border: 1px solid rgba(56, 189, 248, 0.25);
        padding: 12px 20px;
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 1px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .pause-menu-btn:hover {
        background: rgba(56, 189, 248, 0.2);
        border-color: #38bdf8;
      }
    `;
    document.head.appendChild(style);

    parent.appendChild(this.overlay);
    this.bindEvents();
  }

  private bindEvents(): void {
    this.eventBus.on('INPUT_ACTION', (payload) => {
      if (payload.action === 'pauseGame' && payload.value) {
        this.toggle();
      }
    });

    this.overlay.querySelector('#pause-btn-resume')!.addEventListener('click', () => {
      this.toggle();
    });

    this.overlay.querySelector('#pause-btn-map')!.addEventListener('click', () => {
      this.eventBus.emit('INPUT_ACTION', { action: 'toggleMap', value: true });
    });

    this.overlay.querySelector('#pause-btn-journal')!.addEventListener('click', () => {
      this.eventBus.emit('INPUT_ACTION', { action: 'toggleJournal', value: true });
    });

    this.overlay.querySelector('#pause-btn-inventory')!.addEventListener('click', () => {
      this.eventBus.emit('INPUT_ACTION', { action: 'toggleInventory', value: true });
    });

    this.overlay.querySelector('#pause-btn-save')!.addEventListener('click', () => {
      this.saveSystem.save(true);
      this.eventBus.emit('NOTIFICATION', {
        title: 'MISSION SAVED',
        message: 'Telemetry archived in browser storage',
        type: 'success'
      });
    });

    this.overlay.querySelector('#pause-btn-menu')!.addEventListener('click', () => {
      this.hide();
      this.eventBus.emit('GAME_STATE_CHANGED', 'MENU');
    });
  }

  public show(): void {
    this.isOpen = true;
    this.overlay.style.display = 'flex';
    this.eventBus.emit('GAME_STATE_CHANGED', 'PAUSED');
  }

  public hide(): void {
    this.isOpen = false;
    this.overlay.style.display = 'none';
    this.eventBus.emit('GAME_STATE_CHANGED', 'PLAYING');
  }

  public toggle(): void {
    if (this.isOpen) {
      this.hide();
    } else {
      this.show();
    }
  }
}
