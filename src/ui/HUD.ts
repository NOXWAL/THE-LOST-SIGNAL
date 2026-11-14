import { EventBus } from '../core/EventBus';
import { DistrictInfo, Quest } from '../types';
import { QuestManager } from '../missions/QuestManager';

export class HUD {
  private container: HTMLElement;
  private questManager?: QuestManager;
  private staminaBar!: HTMLElement;
  private signalGauge!: HTMLElement;
  private signalText!: HTMLElement;
  private beaconText!: HTMLElement;
  private districtNameText!: HTMLElement;
  private districtSubText!: HTMLElement;
  private promptBox!: HTMLElement;
  private dialogueBox!: HTMLElement;
  private toastBox!: HTMLElement;
  private missionBox!: HTMLElement;

  // Mini-map radar canvas
  private radarCanvas!: HTMLCanvasElement;
  private radarCtx!: CanvasRenderingContext2D;
  private playerRotation = 0;
  private playerPos = { x: 0, z: 0 };

  private eventBus = EventBus.getInstance();

  constructor(parent: HTMLElement, questManager?: QuestManager) {
    this.questManager = questManager;
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
    // Center Reticle
    const reticle = document.createElement('div');
    reticle.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 4px;
      height: 4px;
      transform: translate(-50%, -50%);
      background-color: rgba(56, 189, 248, 0.85);
      border-radius: 50%;
      box-shadow: 0 0 6px #38bdf8;
    `;
    this.container.appendChild(reticle);

    // Top-Left: District & Scanner Status
    const topPanel = document.createElement('div');
    topPanel.style.cssText = `
      position: absolute;
      top: 24px;
      left: 24px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: rgba(15, 23, 42, 0.85);
      padding: 16px 20px;
      border-radius: 10px;
      border: 1px solid rgba(56, 189, 248, 0.25);
      backdrop-filter: blur(12px);
      min-width: 270px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    `;

    topPanel.innerHTML = `
      <div>
        <div id="hud-district-name" style="font-size: 13px; font-weight: 800; color: #38bdf8; letter-spacing: 1.5px; text-transform: uppercase;">WESTSIDE RESIDENTIAL</div>
        <div id="hud-district-sub" style="font-size: 10px; color: #94a3b8; font-family: monospace; margin-top: 2px;">Sector 2 • Safehouse Vicinity</div>
      </div>

      <!-- Stamina Bar -->
      <div>
        <div style="font-size: 10px; letter-spacing: 1px; color: #64748b; font-weight: 700; margin-bottom: 4px;">SPRINT STAMINA</div>
        <div style="width: 100%; height: 5px; background: rgba(30, 41, 59, 0.9); border-radius: 3px; overflow: hidden;">
          <div id="hud-stamina-fill" style="width: 100%; height: 100%; background: #38bdf8; transition: width 0.1s linear;"></div>
        </div>
      </div>

      <!-- Signal Resonance Detector -->
      <div style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <span style="font-size: 10px; letter-spacing: 1px; color: #64748b; font-weight: 700;">SIGNAL SCANNER</span>
          <span id="hud-signal-freq" style="font-size: 11px; color: #06b6d4; font-family: monospace; font-weight: 700;">142.8 MHz</span>
        </div>
        <div style="width: 100%; height: 6px; background: rgba(30, 41, 59, 0.9); border-radius: 3px; overflow: hidden;">
          <div id="hud-signal-fill" style="width: 25%; height: 100%; background: linear-gradient(90deg, #0284c7, #06b6d4); transition: width 0.2s ease;"></div>
        </div>
        <div id="hud-beacon-name" style="font-size: 10px; color: #94a3b8; margin-top: 4px; font-style: italic;">Tracking transmission echo...</div>
      </div>
    `;
    this.container.appendChild(topPanel);

    this.districtNameText = topPanel.querySelector('#hud-district-name')!;
    this.districtSubText = topPanel.querySelector('#hud-district-sub')!;
    this.staminaBar = topPanel.querySelector('#hud-stamina-fill')!;
    this.signalGauge = topPanel.querySelector('#hud-signal-fill')!;
    this.signalText = topPanel.querySelector('#hud-signal-freq')!;
    this.beaconText = topPanel.querySelector('#hud-beacon-name')!;

    // Top-Right: Active Mission Objective Tracker
    this.missionBox = document.createElement('div');
    this.missionBox.style.cssText = `
      position: absolute;
      top: 24px;
      right: 24px;
      background: rgba(15, 23, 42, 0.85);
      border-right: 3px solid #38bdf8;
      border-radius: 8px;
      padding: 14px 18px;
      min-width: 260px;
      max-width: 320px;
      backdrop-filter: blur(12px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    `;
    this.missionBox.innerHTML = `
      <div style="font-size: 10px; letter-spacing: 1px; color: #38bdf8; font-weight: 800;">ACTIVE MISSION</div>
      <div id="hud-mission-title" style="font-size: 14px; font-weight: 700; color: #f8fafc; margin-top: 2px;">MISSION 01: THE ARRIVAL</div>
      <div id="hud-mission-desc" style="font-size: 12px; color: #94a3b8; margin-top: 6px; line-height: 1.4;">Locate Dr. Vance's Safehouse Apartment in Westside Residential.</div>
    `;
    this.container.appendChild(this.missionBox);

    // Bottom-Right: HUD Circular Mini-Map Radar
    const radarContainer = document.createElement('div');
    radarContainer.style.cssText = `
      position: absolute;
      bottom: 24px;
      right: 24px;
      width: 140px;
      height: 140px;
      border-radius: 50%;
      background: rgba(15, 23, 42, 0.9);
      border: 2px solid rgba(56, 189, 248, 0.4);
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.7), inset 0 0 15px rgba(56, 189, 248, 0.2);
      overflow: hidden;
      backdrop-filter: blur(8px);
    `;
    this.radarCanvas = document.createElement('canvas');
    this.radarCanvas.width = 140;
    this.radarCanvas.height = 140;
    radarContainer.appendChild(this.radarCanvas);
    this.radarCtx = this.radarCanvas.getContext('2d')!;
    this.container.appendChild(radarContainer);

    // Center-Bottom: Interaction Prompt Tooltip
    this.promptBox = document.createElement('div');
    this.promptBox.style.cssText = `
      position: absolute;
      bottom: 22%;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.9);
      border: 1px solid #38bdf8;
      color: #f8fafc;
      padding: 10px 22px;
      border-radius: 24px;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.5px;
      display: none;
      backdrop-filter: blur(8px);
      box-shadow: 0 0 20px rgba(56, 189, 248, 0.35);
    `;
    this.container.appendChild(this.promptBox);

    // Dialogue Overlay Window
    this.dialogueBox = document.createElement('div');
    this.dialogueBox.className = 'interactive';
    this.dialogueBox.style.cssText = `
      position: absolute;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      width: 640px;
      max-width: 92vw;
      background: rgba(15, 23, 42, 0.96);
      border: 1px solid rgba(56, 189, 248, 0.4);
      border-radius: 12px;
      padding: 24px;
      display: none;
      backdrop-filter: blur(16px);
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
      z-index: 50;
    `;
    this.container.appendChild(this.dialogueBox);

    // Notification Toast Area
    this.toastBox = document.createElement('div');
    this.toastBox.style.cssText = `
      position: absolute;
      top: 130px;
      right: 24px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 40;
    `;
    this.container.appendChild(this.toastBox);
  }

  private bindEvents(): void {
    this.eventBus.on('DISTRICT_ENTERED', (district: DistrictInfo) => {
      this.districtNameText.textContent = district.name;
      this.districtSubText.textContent = district.subtitle;
      this.showToast(district.name, district.subtitle, 'info');
    });

    this.eventBus.on('PLAYER_STAMINA_CHANGED', (payload) => {
      const pct = (payload.current / payload.max) * 100;
      this.staminaBar.style.width = `${pct}%`;
    });

    this.eventBus.on('SIGNAL_STRENGTH_CHANGED', (payload) => {
      this.signalGauge.style.width = `${Math.min(100, payload.strength * 100)}%`;
      this.signalText.textContent = `${payload.frequency.toFixed(1)} MHz`;
      this.beaconText.textContent = payload.strength > 0.05 ? `Proximity: ${payload.beaconName}` : 'Weak anomalous static...';
    });

    this.eventBus.on('PLAYER_MOVED', (payload) => {
      this.playerPos.x = payload.position.x;
      this.playerPos.z = payload.position.z;
      this.playerRotation = payload.rotation;
      this.drawRadar();
    });

    this.eventBus.on('INTERACTION_AVAILABLE', (payload) => {
      if (payload) {
        this.promptBox.textContent = payload.label;
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

    this.eventBus.on('QUEST_STARTED', () => this.updateMissionDisplay());
    this.eventBus.on('QUEST_UPDATED', () => this.updateMissionDisplay());
    this.eventBus.on('QUEST_COMPLETED', (payload) => {
      this.showToast(`${payload.quest.missionNumber} COMPLETED`, payload.quest.title, 'success');
      this.updateMissionDisplay();
    });

    this.eventBus.on('NOTIFICATION', (payload) => {
      this.showToast(payload.title, payload.message, payload.type);
    });
  }

  public updateMissionDisplay(questTitle?: string, objectiveDesc?: string): void {
    const titleEl = this.missionBox.querySelector('#hud-mission-title');
    const descEl = this.missionBox.querySelector('#hud-mission-desc');

    if (questTitle && titleEl) {
      titleEl.textContent = questTitle;
    }
    if (objectiveDesc && descEl) {
      descEl.textContent = objectiveDesc;
    }

    if (!questTitle && this.questManager) {
      const active = this.questManager.getActiveQuests()[0];
      if (active) {
        if (titleEl) titleEl.textContent = `${active.missionNumber}: ${active.title}`;
        const activeObj = active.objectives.find((o) => !o.completed) || active.objectives[0];
        if (descEl && activeObj) {
          descEl.textContent = activeObj.description;
        }
      } else {
        if (titleEl) titleEl.textContent = 'ALL MISSIONS RESOLVED';
        if (descEl) descEl.textContent = 'The anomalous signal has been stabilized.';
      }
    }
  }

  private drawRadar(): void {
    const w = this.radarCanvas.width;
    const h = this.radarCanvas.height;
    const ctx = this.radarCtx;

    ctx.clearRect(0, 0, w, h);

    // Concentric sweep rings
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 25, 0, Math.PI * 2);
    ctx.arc(w / 2, h / 2, 50, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(w / 2, 10);
    ctx.lineTo(w / 2, h - 10);
    ctx.moveTo(10, h / 2);
    ctx.lineTo(w - 10, h / 2);
    ctx.stroke();

    // Center player arrow
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(this.playerRotation);

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(5, 5);
    ctx.lineTo(0, 2);
    ctx.lineTo(-5, 5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // Cardinal N
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('N', w / 2 - 3, 14);
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
              background: rgba(30, 41, 59, 0.85);
              border: 1px solid rgba(56, 189, 248, 0.3);
              color: #f1f5f9;
              padding: 10px 16px;
              border-radius: 6px;
              text-align: left;
              cursor: pointer;
              font-size: 13px;
              transition: all 0.2s;
            ">${opt.text}</button>
          `
            )
            .join('')}
        </div>
      `;
    }

    this.dialogueBox.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span style="font-size: 14px; color: #38bdf8; font-weight: 800; letter-spacing: 1px;">${node.speaker}</span>
        <span style="font-size: 11px; color: #94a3b8; font-family: monospace;">${node.speakerTitle || ''}</span>
      </div>
      <div style="font-size: 15px; color: #e2e8f0; line-height: 1.6; margin-top: 6px;">${node.text}</div>
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

  public showToast(title: string, message: string, type: 'info' | 'success' | 'warning' | 'story' = 'info'): void {
    const toast = document.createElement('div');
    const color = type === 'success' ? '#22c55e' : type === 'story' ? '#38bdf8' : '#eab308';

    toast.style.cssText = `
      background: rgba(15, 23, 42, 0.95);
      border-left: 4px solid ${color};
      color: #f8fafc;
      padding: 12px 18px;
      border-radius: 6px;
      min-width: 240px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
      transition: opacity 0.5s ease;
      backdrop-filter: blur(8px);
    `;
    toast.innerHTML = `
      <div style="font-size: 11px; font-weight: 800; color: ${color}; letter-spacing: 1px; text-transform: uppercase;">${title}</div>
      <div style="font-size: 13px; color: #e2e8f0; margin-top: 2px;">${message}</div>
    `;

    this.toastBox.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 500);
    }, 3800);
  }
}
