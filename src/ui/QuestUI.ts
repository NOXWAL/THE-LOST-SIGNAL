import { EventBus } from '../core/EventBus';
import { QuestManager } from '../missions/QuestManager';

export class QuestUI {
  private panel: HTMLElement;
  private questManager: QuestManager;
  private eventBus = EventBus.getInstance();

  constructor(parent: HTMLElement, questManager: QuestManager) {
    this.questManager = questManager;

    this.panel = document.createElement('div');
    this.panel.style.cssText = `
      position: absolute;
      top: 140px;
      left: 24px;
      background: rgba(15, 23, 42, 0.7);
      border-left: 3px solid #38bdf8;
      border-radius: 4px;
      padding: 14px;
      width: 260px;
      backdrop-filter: blur(8px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    `;
    parent.appendChild(this.panel);

    this.bindEvents();
    this.render();
  }

  private bindEvents(): void {
    this.eventBus.on('QUEST_STARTED', () => this.render());
    this.eventBus.on('QUEST_UPDATED', () => this.render());
    this.eventBus.on('QUEST_COMPLETED', () => this.render());
  }

  public render(): void {
    const activeQuests = this.questManager.getActiveQuests();
    if (activeQuests.length === 0) {
      this.panel.innerHTML = `
        <div style="font-size: 11px; letter-spacing: 1px; color: #64748b; font-weight: 600;">ACTIVE MISSION</div>
        <div style="font-size: 13px; color: #94a3b8; margin-top: 4px;">No signal tracked.</div>
      `;
      return;
    }

    const quest = activeQuests[0];
    const objectivesHtml = quest.objectives
      .map(
        (obj) => `
        <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: ${
          obj.completed ? '#4ade80' : '#cbd5e1'
        };">
          <span>${obj.completed ? '✓' : '○'}</span>
          <span>${obj.description} (${obj.current}/${obj.target})</span>
        </div>
      `
      )
      .join('');

    this.panel.innerHTML = `
      <div style="font-size: 11px; letter-spacing: 1px; color: #38bdf8; font-weight: 700;">CURRENT TRANSMISSION</div>
      <div style="font-size: 14px; font-weight: 600; color: #f1f5f9; margin-top: 4px; margin-bottom: 8px;">${quest.title}</div>
      <div style="display: flex; flex-direction: column; gap: 6px;">
        ${objectivesHtml}
      </div>
    `;
  }
}
