import { EventBus } from '../core/EventBus';
import { GameSettings } from '../types';

export class SettingsUI {
  private overlay: HTMLElement;
  private eventBus = EventBus.getInstance();
  private isOpen = false;

  private currentSettings: GameSettings = {
    graphicsQuality: 'high',
    shadows: true,
    postProcessing: true,
    masterVolume: 0.8,
    sfxVolume: 0.8,
    musicVolume: 0.5,
    mouseSensitivity: 1.0,
    fov: 60
  };

  constructor(parent: HTMLElement) {
    this.overlay = document.createElement('div');
    this.overlay.className = 'interactive';
    this.overlay.id = 'settings-ui';
    this.overlay.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 520px;
      max-width: 90vw;
      background: radial-gradient(circle at center, rgba(15, 23, 42, 0.98) 0%, rgba(3, 7, 18, 0.99) 100%);
      border: 1px solid rgba(56, 189, 248, 0.4);
      border-radius: 12px;
      padding: 24px;
      display: none;
      box-shadow: 0 0 50px rgba(0, 0, 0, 0.9);
      backdrop-filter: blur(16px);
      z-index: 70;
      flex-direction: column;
      gap: 16px;
    `;

    this.render();
    parent.appendChild(this.overlay);
    this.bindEvents();
  }

  private render(): void {
    this.overlay.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(56, 189, 248, 0.2); padding-bottom: 12px;">
        <div style="font-size: 16px; font-weight: 800; color: #38bdf8; letter-spacing: 2px;">SYSTEM CONFIGURATION</div>
        <button id="settings-close-btn" style="background: none; border: none; color: #94a3b8; font-size: 20px; cursor: pointer;">✕</button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 14px; font-size: 13px;">
        <!-- Graphics Preset -->
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #cbd5e1;">Graphics Preset</span>
          <select id="setting-graphics" style="background: #1e293b; border: 1px solid #38bdf8; color: #f8fafc; padding: 6px 12px; border-radius: 4px;">
            <option value="low">Low (High FPS)</option>
            <option value="medium">Medium</option>
            <option value="high" selected>High (Recommended)</option>
            <option value="ultra">Ultra (Cinematic)</option>
          </select>
        </div>

        <!-- Master Volume -->
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #cbd5e1;">Master Audio</span>
          <input type="range" id="setting-master-vol" min="0" max="1" step="0.05" value="${this.currentSettings.masterVolume}" style="width: 140px;" />
        </div>

        <!-- SFX Volume -->
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #cbd5e1;">SFX Volume (Footsteps/Atmosphere)</span>
          <input type="range" id="setting-sfx-vol" min="0" max="1" step="0.05" value="${this.currentSettings.sfxVolume}" style="width: 140px;" />
        </div>

        <!-- Music Volume -->
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #cbd5e1;">Synthesizer Ambient Score</span>
          <input type="range" id="setting-music-vol" min="0" max="1" step="0.05" value="${this.currentSettings.musicVolume}" style="width: 140px;" />
        </div>

        <!-- Mouse Sensitivity -->
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #cbd5e1;">Camera Mouse Sensitivity</span>
          <input type="range" id="setting-mouse-sens" min="0.5" max="2.5" step="0.1" value="${this.currentSettings.mouseSensitivity}" style="width: 140px;" />
        </div>
      </div>

      <button id="settings-apply-btn" style="
        background: #0284c7;
        color: white;
        border: none;
        padding: 10px;
        border-radius: 6px;
        font-weight: 700;
        cursor: pointer;
        margin-top: 8px;
        transition: background 0.2s;
      ">APPLY SETTINGS</button>
    `;
  }

  private bindEvents(): void {
    this.overlay.querySelector('#settings-close-btn')!.addEventListener('click', () => {
      this.toggle();
    });

    this.overlay.querySelector('#settings-apply-btn')!.addEventListener('click', () => {
      const gSelect = this.overlay.querySelector('#setting-graphics') as HTMLSelectElement;
      const mVol = this.overlay.querySelector('#setting-master-vol') as HTMLInputElement;
      const sVol = this.overlay.querySelector('#setting-sfx-vol') as HTMLInputElement;
      const musVol = this.overlay.querySelector('#setting-music-vol') as HTMLInputElement;
      const mSens = this.overlay.querySelector('#setting-mouse-sens') as HTMLInputElement;

      this.currentSettings.graphicsQuality = gSelect.value as any;
      this.currentSettings.masterVolume = parseFloat(mVol.value);
      this.currentSettings.sfxVolume = parseFloat(sVol.value);
      this.currentSettings.musicVolume = parseFloat(musVol.value);
      this.currentSettings.mouseSensitivity = parseFloat(mSens.value);

      this.eventBus.emit('SETTINGS_CHANGED', this.currentSettings);
      this.eventBus.emit('NOTIFICATION', {
        title: 'SETTINGS APPLIED',
        message: 'Configuration successfully updated',
        type: 'info'
      });
      this.toggle();
    });
  }

  public toggle(): void {
    this.isOpen = !this.isOpen;
    this.overlay.style.display = this.isOpen ? 'flex' : 'none';
  }
}
