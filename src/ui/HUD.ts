import { EventBus } from '../core/EventBus';

export class HUD {
  private container: HTMLElement;
  private healthBar!: HTMLElement;
  private signalGauge!: HTMLElement;
  private signalText!: HTMLElement;
  private promptBox!: HTMLElement;
  private dialogueBox!: HTMLElement;
  private toastBox!: HTMLElement;
  private eventBus = EventBus.getInstance();

  constructor(parent: HTMLElement) {
    this.container = document.createElement('div');
    this.container.id = 'hud';
    this.container.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    `;
    parent.appendChild(this.container);

    this.renderElements();
    this.bindEvents();
  }

  private renderElements(): void {
    // Crosshair
    const crosshair = document.createElement('div');
    crosshair.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 6px;
      height: 6px;
      transform: translate(-50%, -50%);
      background-color: rgba(56, 189, 248, 0.8);
      border-radius: 50%;
      box-shadow: 0 0 8px rgba(56, 189, 248, 0.9);
    `;
    this.container.appendChild(crosshair);

    // Top-Left Status Panel
    const statusPanel = document.createElement('div');
    statusPanel.style.cssText = `
      position: absolute;
      top: 24px;
      left: 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: rgba(15, 23, 42, 0.7);
      padding: 16px;
      border-radius: 8px;
      border: 1px solid rgba(56, 189, 248, 0.2);
      backdrop-filter: blur(8px);
      min-width: 240px;
    `;

    // Health
    statusPanel.innerHTML = `
      <div style="font-size: 11px; letter-spacing: 1px; color: #94a3b8; font-weight: 600;">VITAL SIGNS</div>
      <div style="width: 100%; height: 8px; background: rgba(30, 41, 59, 0.8); border-radius: 4px; overflow: hidden;">
        <div id="hud-health-fill" style="width: 100%; height: 100%; background: #38bdf8; transition: width 0.3s ease;"></div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
        <span style="font-size: 11px; letter-spacing: 1px; color: #94a3b8; font-weight: 600;">SIGNAL DETECTOR</span>
        <span id="hud-signal-text" style="font-size: 12px; color: #38bdf8; font-family: monospace;">0.00 MHz</span>
      </div>
      <div style="width: 100%; height: 6px; background: rgba(30, 41, 59, 0.8); border-radius: 4px; overflow: hidden;">
        <div id="hud-signal-fill" style="width: 0%; height: 100%; background: #06b6d4; transition: width 0.2s ease;"></div>
      </div>
    `;
    this.container.appendChild(statusPanel);
    this.healthBar = statusPanel.querySelector('#hud-health-fill')!;
    this.signalGauge = statusPanel.querySelector('#hud-signal-fill')!;
    this.signalText = statusPanel.querySelector('#hud-signal-text')!;

    // Interaction Prompt
    this.promptBox = document.createElement('div');
    this.promptBox.style.cssText = `
      position: absolute;
      bottom: 25%;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid #38bdf8;
      color: #f8fafc;
      padding: 10px 20px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.5px;
      display: none;
      backdrop-filter: blur(8px);
      box-shadow: 0 0 15px rgba(56, 189, 248, 0.3);
    `;
    this.container.appendChild(this.promptBox);

    // Dialogue Overlay
    this.dialogueBox = document.createElement('div');
    this.dialogueBox.className = 'interactive';
    this.dialogueBox.style.cssText = `
      position: absolute;
      bottom: 40px;
      left: 50%;
      transform: translateX(-50%);
      width: 600px;
      max-width: 90vw;
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid rgba(56, 189, 248, 0.3);
      border-radius: 12px;
      padding: 24px;
      display: none;
      backdrop-filter: blur(12px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
    `;
    this.container.appendChild(this.dialogueBox);

    // Toast Notifications
    this.toastBox = document.createElement('div');
    this.toastBox.style.cssText = `
      position: absolute;
      top: 24px;
      right: 24px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    `;
    this.container.appendChild(this.toastBox);
  }

  private bindEvents(): void {
    this.eventBus.on('PLAYER_HEALTH_CHANGED', (payload) => {
      const pct = Math.max(0, Math.min(100, (payload.current / payload.max) * 100));
      this.healthBar.style.width = `${pct}%`;
    });

    this.eventBus.on('SIGNAL_STRENGTH_CHANGED', (payload) => {
      this.signalGauge.style.width = `${payload.strength * 100}%`;
      this.signalText.innerText = `${payload.frequency.toFixed(1)} MHz`;
    });

    this.eventBus.on('INTERACTION_AVAILABLE', (payload) => {
      if (payload) {
        this.promptBox.innerText = payload.label;
        this.promptBox.style.display = 'block';
      } else {
        this.promptBox.style.display = 'none';
      }
    });

    this.eventBus.on('DIALOGUE_START', (node) => {
      this.showDialogue(node);
    });

    this.eventBus.on('DIALOGUE_END', () => {
      this.dialogueBox.style.display = 'none';
    });

    this.eventBus.on('ITEM_COLLECTED', (payload) => {
      this.showToast(`+ ${payload.quantity}x ${payload.item.name}`);
    });
  }

  private showDialogue(node: any): void {
    let optionsHtml = '';
    if (node.options && node.options.length > 0) {
      optionsHtml = `
        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 16px;">
          ${node.options
            .map(
              (opt: any, idx: number) => `
            <button class="dialogue-opt-btn" data-idx="${idx}" style="
              background: rgba(30, 41, 59, 0.8);
              border: 1px solid rgba(56, 189, 248, 0.3);
              color: #f1f5f9;
              padding: 10px 14px;
              border-radius: 6px;
              text-align: left;
              cursor: pointer;
              font-size: 14px;
              transition: all 0.2s;
            ">${opt.text}</button>
          `
            )
            .join('')}
        </div>
      `;
    }

    this.dialogueBox.innerHTML = `
      <div style="font-size: 13px; color: #38bdf8; font-weight: 700; margin-bottom: 6px;">${node.speaker}</div>
      <div style="font-size: 15px; color: #e2e8f0; line-height: 1.5;">${node.text}</div>
      ${optionsHtml}
    `;
    this.dialogueBox.style.display = 'block';

    const buttons = this.dialogueBox.querySelectorAll('.dialogue-opt-btn');
    buttons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt((e.currentTarget as HTMLElement).getAttribute('data-idx') || '0', 10);
        const opt = node.options[idx];
        this.eventBus.emit('DIALOGUE_SELECT_OPTION', opt);
      });
    });
  }

  public showToast(text: string): void {
    const toast = document.createElement('div');
    toast.style.cssText = `
      background: rgba(15, 23, 42, 0.9);
      border-left: 3px solid #38bdf8;
      color: #f8fafc;
      padding: 10px 16px;
      border-radius: 4px;
      font-size: 13px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      transition: opacity 0.5s ease;
    `;
    toast.innerText = text;
    this.toastBox.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 500);
    }, 2800);
  }
}
