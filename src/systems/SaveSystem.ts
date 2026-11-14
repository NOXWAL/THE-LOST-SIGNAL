import { ISystem, GameContext } from '../types';
import { EventBus } from '../core/EventBus';
import { Inventory } from './Inventory';
import { QuestManager } from '../missions/QuestManager';
import { Player } from '../player/Player';

const SAVE_KEY = 'the_lost_signal_save';

export class SaveSystem implements ISystem {
  public name = 'SaveSystem';
  private inventory!: Inventory;
  private questManager!: QuestManager;
  private player!: Player;
  private eventBus = EventBus.getInstance();

  public setDependencies(inventory: Inventory, questManager: QuestManager, player: Player): void {
    this.inventory = inventory;
    this.questManager = questManager;
    this.player = player;
  }

  public init(_context: GameContext): void {
    // Check auto-load on start if saved
    console.log('[SaveSystem] Initialized.');
  }

  public save(): boolean {
    try {
      const saveData = {
        timestamp: Date.now(),
        player: {
          position: {
            x: this.player.position.x,
            y: this.player.position.y,
            z: this.player.position.z
          },
          health: this.player.health
        },
        inventory: this.inventory?.serialize(),
        quests: this.questManager?.serialize()
      };

      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
      this.eventBus.emit('GAME_SAVED', { timestamp: saveData.timestamp });
      return true;
    } catch (e) {
      console.error('[SaveSystem] Save failed', e);
      return false;
    }
  }

  public load(): boolean {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;

      const data = JSON.parse(raw);
      if (data.player && this.player) {
        this.player.position.set(data.player.position.x, data.player.position.y, data.player.position.z);
        this.player.health = data.player.health;
      }

      if (data.inventory && this.inventory) {
        this.inventory.deserialize(data.inventory);
      }

      if (data.quests && this.questManager) {
        this.questManager.deserialize(data.quests);
      }

      this.eventBus.emit('GAME_LOADED', undefined);
      return true;
    } catch (e) {
      console.error('[SaveSystem] Load failed', e);
      return false;
    }
  }

  public hasSave(): boolean {
    try {
      return !!localStorage.getItem(SAVE_KEY);
    } catch {
      return false;
    }
  }

  public clearSave(): void {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (e) {
      console.error('[SaveSystem] Clear save failed', e);
    }
  }

  public update(_delta: number): void {}
}
