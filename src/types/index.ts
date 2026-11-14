import * as THREE from 'three';

export interface GameContext {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  eventBus: IEventBus;
  assetManager: IAssetManager;
}

export interface ISystem {
  name: string;
  init(context: GameContext): void | Promise<void>;
  update(delta: number): void;
  destroy?(): void;
}

export interface IUpdatable {
  update(delta: number): void;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type: 'quest' | 'consumable' | 'gear' | 'signal_decoder';
  quantity: number;
  icon?: string;
}

export interface QuestObjective {
  id: string;
  description: string;
  current: number;
  target: number;
  completed: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  objectives: QuestObjective[];
  rewards?: {
    xp?: number;
    items?: InventoryItem[];
  };
  status: 'inactive' | 'active' | 'completed' | 'failed';
}

export interface DialogueNode {
  id: string;
  speaker: string;
  text: string;
  options?: Array<{
    text: string;
    nextId?: string;
    action?: string;
  }>;
}

export interface MapMarker {
  id: string;
  title: string;
  position: { x: number; z: number };
  type: 'player' | 'quest' | 'signal_beacon' | 'npc' | 'landmark';
  discovered: boolean;
}

export interface GameEvents {
  // Player
  'PLAYER_MOVED': { position: THREE.Vector3; rotation: number };
  'PLAYER_HEALTH_CHANGED': { current: number; max: number };
  'SIGNAL_STRENGTH_CHANGED': { strength: number; frequency: number };

  // Input / Action
  'INPUT_ACTION': { action: string; value: boolean | number };
  'INTERACTION_AVAILABLE': { id: string; label: string; action: () => void } | null;

  // Inventory
  'ITEM_COLLECTED': { item: InventoryItem; quantity: number };
  'ITEM_USED': { itemId: string };
  'INVENTORY_TOGGLED': boolean;

  // Missions / Quests
  'QUEST_STARTED': { questId: string };
  'QUEST_UPDATED': { questId: string; objectiveId: string; progress: number };
  'QUEST_COMPLETED': { questId: string };

  // Dialogue
  'DIALOGUE_START': DialogueNode;
  'DIALOGUE_SELECT_OPTION': { nextId?: string; action?: string };
  'DIALOGUE_END': void;

  // World / Weather
  'WEATHER_CHANGED': { type: 'clear' | 'fog' | 'storm'; intensity: number };
  'TIME_OF_DAY_CHANGED': { hour: number };

  // UI / State
  'MAP_TOGGLED': boolean;
  'GAME_STATE_CHANGED': 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';
  'GAME_SAVED': { timestamp: number };
  'GAME_LOADED': void;
}

export interface IEventBus {
  on<K extends keyof GameEvents>(event: K, handler: (payload: GameEvents[K]) => void): void;
  off<K extends keyof GameEvents>(event: K, handler: (payload: GameEvents[K]) => void): void;
  emit<K extends keyof GameEvents>(event: K, payload: GameEvents[K]): void;
}

export interface IAssetManager {
  loadTexture(url: string): Promise<THREE.Texture>;
  loadAudio(url: string): Promise<AudioBuffer>;
  get<T>(key: string): T | undefined;
  preloadAll(): Promise<void>;
}
