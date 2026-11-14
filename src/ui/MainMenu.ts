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
      background: radial-gradient(circle at center, rgba(15, 23, 42, 0.9) 0%, rgba(3, 7, 18, 0.99) 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 80;
      backdrop-filter: blur(16px);
    `;

    this.render();
    parent.appendChild(this.overlay);
    this.bindEvents();
  }

  private render(): void {
    const hasSave = this.saveSystem.hasSave();

    this.overlay.innerHTML = `
      <div style="text-align: center; max-width: 580px; padding: 24px;">
        <div style="font-size: 12px; letter-spacing: 4px; color: #38bdf8; font-weight: 700; text-transform: uppercase; margin-bottom: 8px;">
          CHRONOTECH ARCHIVES • PROTOCOL 142.8
        </div>
        <h1 style="font-size: 46px; letter-spacing: 8px; font-weight: 900; color: #f8fafc; text-shadow: 0 0 30px rgba(56, 189, 248, 0.6); margin-bottom: 6px;">
          THE LOST SIGNAL
        </h1>
        <p style="color: #64748b; font-size: 14px; letter-spacing: 2.5px; margin-bottom: 36px; text-transform: uppercase;">
          A Realistic 3D Open-World Mystery Adventure
        </p>

        <div style="display: flex; flex-direction: column; gap: 14px; width: 300px; margin: 0 auto;">
          <button id="btn-start" style="
            background: #0284c7;
            color: white;
            border: none;
            padding: 14px 24px;
            font-size: 15px;
            font-weight: 700;
            letter-spacing: 1px;
            border-radius: 6px;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(2, 132, 199, 0.4);
            transition: all 0.2s;
          ">INITIATE EXPEDITION</button>

          <button id="btn-load" style="
            background: ${hasSave ? 'rgba(30, 41, 59, 0.9)' : 'rgba(15, 23, 42, 0.5)'};
            color: ${hasSave ? '#e2e8f0' : '#475569'};
            border: 1px solid ${hasSave ? 'rgba(56, 189, 248, 0.3)' : 'rgba(255, 255, 255, 0.05)'};
            padding: 12px 24px;
            font-size: 14px;
            font-weight: 600;
            border-radius: 6px;
            cursor: ${hasSave ? 'pointer' : 'not-allowed'};
            transition: all 0.2s;
          ">CONTINUE ARCHIVE</button>

          <button id="btn-settings-menu" style="
            background: rgba(30, 41, 59, 0.7);
            color: #cbd5e1;
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 12px 24px;
            font-size: 13px;
            font-weight: 600;
            border-radius: 6px;
            cursor: pointer;
          ">SETTINGS</button>
        </div>

        <div style="margin-top: 40px; border-top: 1px solid rgba(56, 189, 248, 0.15); padding-top: 18px; color: #94a3b8; font-size: 12px; line-height: 1.8;">
          <div><b style="color: #f1f5f9;">WASD</b> - Move &bull; <b style="color: #f1f5f9;">Mouse</b> - Look &bull; <b style="color: #f1f5f9;">Shift</b> - Sprint &bull; <b style="color: #f1f5f9;">Space</b> - Jump</div>
          <div><b style="color: #f1f5f9;">E</b> - Interact &bull; <b style="color: #f1f5f9;">M</b> - World Map &bull; <b style="color: #f1f5f9;">J</b> - Case Dossier &bull; <b style="color: #f1f5f9;">F</b> - Flashlight</div>
        </div>
      </div>
    `;
  }

  private bindEvents(): void {
    const startBtn = this.overlay.querySelector('#btn-start')!;
    const loadBtn = this.overlay.querySelector('#btn-load')!;
    const settingsBtn = this.overlay.querySelector('#btn-settings-menu')!;

    startBtn.addEventListener('click', () => {
      this.hide();
      this.eventBus.emit('GAME_STATE_CHANGED', 'PLAYING');
    });

    loadBtn.addEventListener('click', () => {
      if (this.saveSystem.hasSave()) {
        const loaded = this.saveSystem.load();
        if (loaded) {
          this.hide();
          this.eventBus.emit('GAME_STATE_CHANGED', 'PLAYING');
        }
      }
    });

    settingsBtn.addEventListener('click', () => {
      this.eventBus.emit('INPUT_ACTION', { action: 'toggleSettings', value: true });
    });
  }

  public show(): void {
    this.isVisible = true;
    this.overlay.style.display = 'flex';
    this.render();
    this.bindEvents();
    this.eventBus.emit('GAME_STATE_CHANGED', 'MENU');
  }

  public hide(): void {
    this.isVisible = false;
    this.overlay.style.display = 'none';
  }

  public toggle(): void {
    if (this.isVisible) this.hide();
    else this.show();
  }
}
