import { InventoryItem, ISystem, GameContext } from '../types';
import { EventBus } from '../core/EventBus';

export class Inventory implements ISystem {
  public name = 'Inventory';
  private items: Map<string, InventoryItem> = new Map();
  private maxSlots = 20;
  private eventBus = EventBus.getInstance();

  public init(_context: GameContext): void {
    // Listen to collection events
    this.eventBus.on('ITEM_COLLECTED', (payload) => {
      this.addItem(payload.item, payload.quantity);
    });

    // Listen to input toggle
    this.eventBus.on('INPUT_ACTION', (payload) => {
      if (payload.action === 'toggleInventory' && payload.value) {
        this.toggle();
      }
    });
  }

  public addItem(item: InventoryItem, qty = 1): boolean {
    if (this.items.has(item.id)) {
      const existing = this.items.get(item.id)!;
      existing.quantity += qty;
    } else {
      if (this.items.size >= this.maxSlots) {
        console.warn('[Inventory] Inventory full!');
        return false;
      }
      this.items.set(item.id, { ...item, quantity: qty });
    }
    return true;
  }

  public removeItem(itemId: string, qty = 1): boolean {
    if (!this.items.has(itemId)) return false;
    const item = this.items.get(itemId)!;
    if (item.quantity < qty) return false;

    item.quantity -= qty;
    if (item.quantity <= 0) {
      this.items.delete(itemId);
    }
    return true;
  }

  public hasItem(itemId: string, minQty = 1): boolean {
    const item = this.items.get(itemId);
    return !!item && item.quantity >= minQty;
  }

  public getItems(): InventoryItem[] {
    return Array.from(this.items.values());
  }

  private isOpen = false;
  public toggle(): void {
    this.isOpen = !this.isOpen;
    this.eventBus.emit('INVENTORY_TOGGLED', this.isOpen);
  }

  public update(_delta: number): void {}

  public serialize(): any {
    return Array.from(this.items.entries());
  }

  public deserialize(data: [string, InventoryItem][]): void {
    this.items = new Map(data);
  }
}
