import { EventBus } from '../core/EventBus';
import { Investigation } from '../systems/Investigation';
import { EvidenceItem } from '../types';

export class JournalUI {
  private overlay: HTMLElement;
  private investigation: Investigation;
  private eventBus = EventBus.getInstance();
  private isOpen = false;
  private selectedClue: EvidenceItem | null = null;

  constructor(parent: HTMLElement, investigation: Investigation) {
    this.investigation = investigation;

    this.overlay = document.createElement('div');
    this.overlay.className = 'interactive';
    this.overlay.id = 'journal-ui';
    this.overlay.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 820px;
      max-width: 95vw;
      height: 600px;
      max-height: 90vh;
      background: radial-gradient(circle at center, rgba(15, 23, 42, 0.98) 0%, rgba(3, 7, 18, 0.99) 100%);
      border: 1px solid rgba(56, 189, 248, 0.4);
      border-radius: 12px;
      padding: 24px;
      display: none;
      box-shadow: 0 0 50px rgba(0, 0, 0, 0.9);
      backdrop-filter: blur(16px);
      z-index: 60;
      flex-direction: column;
    `;

    this.overlay.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(56, 189, 248, 0.2); padding-bottom: 14px; margin-bottom: 16px;">
        <div>
          <div style="font-size: 18px; font-weight: 800; color: #38bdf8; letter-spacing: 2px;">CASE DOSSIER: THE LOST SIGNAL</div>
          <div style="font-size: 12px; color: #94a3b8;">DISAPPEARANCE OF DR. EVELYN VANCE • EVIDENCE ARCHIVE</div>
        </div>
        <button id="journal-close-btn" style="background: none; border: none; color: #94a3b8; font-size: 22px; cursor: pointer;">✕</button>
      </div>

      <div style="display: flex; flex: 1; gap: 20px; overflow: hidden;">
        <!-- Evidence List -->
        <div id="journal-clue-list" style="width: 280px; display: flex; flex-direction: column; gap: 8px; overflow-y: auto; padding-right: 6px;">
        </div>

        <!-- Evidence Inspection Reader -->
        <div id="journal-reader" style="flex: 1; background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 20px; display: flex; flex-direction: column; overflow-y: auto;">
          <div style="color: #64748b; font-size: 14px; margin: auto; text-align: center;">Select an evidence file from the dossier to inspect.</div>
        </div>
      </div>
    `;

    parent.appendChild(this.overlay);
    this.bindEvents();
  }

  private bindEvents(): void {
    this.eventBus.on('JOURNAL_TOGGLED', (open) => {
      this.isOpen = open;
      this.overlay.style.display = this.isOpen ? 'flex' : 'none';
      if (this.isOpen) this.render();
    });

    this.eventBus.on('EVIDENCE_COLLECTED', (clue) => {
      this.selectedClue = clue;
      if (this.isOpen) this.render();
    });

    this.overlay.querySelector('#journal-close-btn')!.addEventListener('click', () => {
      this.isOpen = false;
      this.overlay.style.display = 'none';
    });
  }

  public render(): void {
    const list = this.overlay.querySelector('#journal-clue-list')!;
    const reader = this.overlay.querySelector('#journal-reader')!;

    const allClues = this.investigation.getAllClues();

    list.innerHTML = allClues
      .map((clue) => {
        const isSelected = this.selectedClue?.id === clue.id;
        if (!clue.unlocked) {
          return `
            <div style="background: rgba(15, 23, 42, 0.4); border: 1px dashed rgba(255, 255, 255, 0.1); padding: 12px; border-radius: 6px; color: #475569; font-size: 13px;">
              🔒 [RESTRICTED EVIDENCE FILE]
            </div>
          `;
        }

        return `
          <div class="clue-item-btn" data-id="${clue.id}" style="
            background: ${isSelected ? 'rgba(56, 189, 248, 0.2)' : 'rgba(30, 41, 59, 0.6)'};
            border: 1px solid ${isSelected ? '#38bdf8' : 'rgba(56, 189, 248, 0.2)'};
            padding: 12px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
          ">
            <div style="font-size: 10px; color: #38bdf8; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">${clue.category}</div>
            <div style="font-size: 13px; font-weight: 600; color: #f1f5f9; margin-top: 2px;">${clue.title}</div>
          </div>
        `;
      })
      .join('');

    // Attach click listeners to clue items
    list.querySelectorAll('.clue-item-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-id')!;
        this.selectedClue = allClues.find((c) => c.id === id) || null;
        this.render();
      });
    });

    // Render selected clue details in reader
    if (this.selectedClue && this.selectedClue.unlocked) {
      reader.innerHTML = `
        <div style="font-size: 11px; color: #38bdf8; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">EXHIBIT ${this.selectedClue.category}</div>
        <div style="font-size: 20px; font-weight: 800; color: #f8fafc; margin-top: 4px; margin-bottom: 6px;">${this.selectedClue.title}</div>
        <div style="font-size: 12px; color: #94a3b8; font-family: monospace; margin-bottom: 16px;">
          ORIGIN: ${this.selectedClue.locationFound} • LOGGED: ${this.selectedClue.dateFound}
        </div>
        <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 8px; padding: 16px; font-size: 14px; line-height: 1.7; color: #e2e8f0; white-space: pre-line; font-family: 'Courier New', Courier, monospace;">
          ${this.selectedClue.content.trim()}
        </div>
        <div style="font-size: 12px; color: #64748b; margin-top: 14px; font-style: italic;">
          Investigation Notes: ${this.selectedClue.description}
        </div>
      `;
    }
  }
}
