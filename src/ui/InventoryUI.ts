import { EventBus } from '../core/EventBus';
import { Inventory } from '../systems/Inventory';
import { InventoryItem } from '../types';

export class InventoryUI {
  private overlay: HTMLElement;
  private inventory: Inventory;
  private eventBus = EventBus.getInstance();
  private isOpen = false;
  private selectedItem: InventoryItem | null = null;

  constructor(parent: HTMLElement, inventory: Inventory) {
    this.inventory = inventory;

    this.overlay = document.createElement('div');
    this.overlay.className = 'interactive';
    this.overlay.id = 'inventory-ui';
    this.overlay.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 680px;
      max-width: 95vw;
      height: 520px;
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
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(56, 189, 248, 0.2); padding-bottom: 12px; margin-bottom: 16px;">
        <div>
          <div style="font-size: 16px; font-weight: 800; color: #38bdf8; letter-spacing: 2px;">TACTICAL INVENTORY & GEAR</div>
          <div style="font-size: 11px; color: #94a3b8; font-family: monospace;">KEYS • PASSWORDS • HARDWARE GADGETS</div>
        </div>
        <button id="inv-close-btn" style="background: none; border: none; color: #94a3b8; font-size: 20px; cursor: pointer;">✕</button>
      </div>

      <div style="display: flex; flex: 1; gap: 20px; overflow: hidden;">
        <div id="inv-grid" style="flex: 1.2; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; overflow-y: auto; padding: 4px;">
        </div>

        <div id="inv-detail-panel" style="flex: 0.8; background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 18px; display: flex; flex-direction: column; justify-content: space-between;">
          <div id="inv-detail-content" style="color: #64748b; font-size: 13px; text-align: center; margin: auto;">
            Select an inventory item to inspect properties.
          </div>
        </div>
      </div>
    `;

    parent.appendChild(this.overlay);
    this.bindEvents();
  }

  private bindEvents(): void {
    this.eventBus.on('INVENTORY_TOGGLED', (open) => {
      this.isOpen = open;
      this.overlay.style.display = this.isOpen ? 'flex' : 'none';
      if (this.isOpen) this.render();
    });

    this.overlay.querySelector('#inv-close-btn')!.addEventListener('click', () => {
      this.inventory.toggle();
    });
  }

  public render(): void {
    const grid = this.overlay.querySelector('#inv-grid')!;
    const detail = this.overlay.querySelector('#inv-detail-content')!;

    const items = this.inventory.getItems();
    grid.innerHTML = '';

    for (let i = 0; i < 16; i++) {
      const item = items[i];
      const slot = document.createElement('div');
      const isSelected = item && this.selectedItem?.id === item.id;

      slot.style.cssText = `
        height: 70px;
        background: ${isSelected ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.6)'};
        border: 1px solid ${isSelected ? '#38bdf8' : 'rgba(56, 189, 248, 0.2)'};
        border-radius: 6px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: ${item ? 'pointer' : 'default'};
        position: relative;
        padding: 4px;
        transition: all 0.15s;
      `;

      if (item) {
        slot.innerHTML = `
          <div style="font-size: 11px; font-weight: 700; color: #f8fafc; text-align: center; word-break: break-word;">${item.name}</div>
          <span style="position: absolute; bottom: 4px; right: 6px; font-size: 10px; color: #38bdf8; font-weight: 700;">x${item.quantity}</span>
        `;
        slot.addEventListener('click', () => {
          this.selectedItem = item;
          this.render();
        });
      }

      grid.appendChild(slot);
    }

    if (this.selectedItem) {
      detail.innerHTML = `
        <div style="text-align: left;">
          <div style="font-size: 10px; color: #38bdf8; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">${this.selectedItem.type}</div>
          <div style="font-size: 16px; font-weight: 800; color: #f8fafc; margin-top: 4px; margin-bottom: 8px;">${this.selectedItem.name}</div>
          <div style="font-size: 13px; color: #cbd5e1; line-height: 1.5;">${this.selectedItem.description}</div>
          <div style="font-size: 11px; color: #94a3b8; font-family: monospace; margin-top: 16px;">QUANTITY: ${this.selectedItem.quantity}</div>
        </div>
      `;
    }
  }
}
