import { ISystem, GameContext } from '../types';
import { EventBus } from '../core/EventBus';
import { Inventory } from './Inventory';
import { QuestManager } from '../missions/QuestManager';
import { Investigation } from './Investigation';
import { Player } from '../player/Player';

const STORAGE_KEY = 'the_lost_signal_telemetry_v2';
const DB_NAME = 'LostSignalDB';
const DB_VERSION = 1;
const STORE_NAME = 'save_state';

export class SaveSystem implements ISystem {
  public name = 'SaveSystem';
  private inventory!: Inventory;
  private questManager!: QuestManager;
  private investigation!: Investigation;
  private player!: Player;
  private eventBus = EventBus.getInstance();
  private db: IDBDatabase | null = null;

  public setDependencies(
    inventory: Inventory,
    questManager: QuestManager,
    investigation: Investigation,
    player: Player
  ): void {
    this.inventory = inventory;
    this.questManager = questManager;
    this.investigation = investigation;
    this.player = player;
  }

  public async init(_context: GameContext): Promise<void> {
    await this.initIndexedDB();
    console.log('[SaveSystem] Storage subsystem online (IndexedDB + LocalStorage fallback)');
  }

  private initIndexedDB(): Promise<void> {
    return new Promise((resolve) => {
      if (!window.indexedDB) {
        resolve();
        return;
      }
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };
        request.onsuccess = (event) => {
          this.db = (event.target as IDBOpenDBRequest).result;
          resolve();
        };
        request.onerror = () => {
          console.warn('[SaveSystem] IndexedDB unavailable, using LocalStorage');
          resolve();
        };
      } catch {
        resolve();
      }
    });
  }

  public save(manual = false): boolean {
    try {
      const saveData = {
        timestamp: Date.now(),
        player: {
          position: {
            x: this.player.position.x,
            y: this.player.position.y,
            z: this.player.position.z
          }
        },
        inventory: this.inventory?.serialize(),
        quests: this.questManager?.serialize(),
        clues: this.investigation?.serialize()
      };

      const serialized = JSON.stringify(saveData);

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, serialized);

      // Save to IndexedDB if active
      if (this.db) {
        const tx = this.db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(saveData, 'active_profile');
      }

      this.eventBus.emit('GAME_SAVED', { timestamp: saveData.timestamp, manual });
      return true;
    } catch (e) {
      console.error('[SaveSystem] Save failed', e);
      return false;
    }
  }

  public load(): boolean {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;

      const data = JSON.parse(raw);
      if (data.player && this.player) {
        this.player.teleport(data.player.position.x, data.player.position.y, data.player.position.z);
      }

      if (data.inventory && this.inventory) {
        this.inventory.deserialize(data.inventory);
      }

      if (data.quests && this.questManager) {
        this.questManager.deserialize(data.quests);
      }

      if (data.clues && this.investigation) {
        this.investigation.deserialize(data.clues);
      }

      this.eventBus.emit('GAME_LOADED', undefined);
      this.eventBus.emit('NOTIFICATION', {
        title: 'ARCHIVE RESTORED',
        message: 'Expedition telemetry reloaded successfully',
        type: 'info'
      });
      return true;
    } catch (e) {
      console.error('[SaveSystem] Load failed', e);
      return false;
    }
  }

  public hasSave(): boolean {
    try {
      return !!localStorage.getItem(STORAGE_KEY);
    } catch {
      return false;
    }
  }

  public clearSave(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      if (this.db) {
        const tx = this.db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete('active_profile');
      }
    } catch (e) {
      console.error('[SaveSystem] Clear failed', e);
    }
  }

  public update(_delta: number): void {}
}
