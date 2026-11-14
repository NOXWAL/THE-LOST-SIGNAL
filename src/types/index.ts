import * as THREE from 'three';

export type DistrictId = 'downtown' | 'residential' | 'industrial' | 'forest' | 'underground';

export interface DistrictInfo {
  id: DistrictId;
  name: string;
  subtitle: string;
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  ambientColor: number;
  fogDensity: number;
  fogColor: number;
}

export interface GameContext {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  eventBus: IEventBus;
  assetManager: IAssetManager;
  soundManager: ISoundManager;
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

export interface BoxCollider {
  min: THREE.Vector3;
  max: THREE.Vector3;
  tag?: string;
  isTrigger?: boolean;
}

export interface EvidenceItem {
  id: string;
  title: string;
  category: 'document' | 'photograph' | 'audio_log' | 'physical_clue';
  description: string;
  dateFound?: string;
  locationFound?: string;
  content: string; // Text content, transcript, or image description
  thumbnail?: string;
  unlocked: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type: 'evidence' | 'key' | 'tool' | 'consumable';
  quantity: number;
  icon?: string;
  usable?: boolean;
}

export interface QuestObjective {
  id: string;
  description: string;
  current: number;
  target: number;
  completed: boolean;
  location?: { x: number; y: number; z: number; radius?: number };
}

export interface Quest {
  id: string;
  missionNumber: string; // e.g. "MISSION 01"
  title: string;
  description: string;
  district: DistrictId;
  objectives: QuestObjective[];
  rewards: {
    xp: number;
    items?: InventoryItem[];
    evidence?: EvidenceItem[];
  };
  status: 'inactive' | 'active' | 'completed' | 'failed';
  isMainMission: boolean;
}

export interface DialogueChoice {
  text: string;
  nextId?: string;
  action?: string;
  requiredClueId?: string;
}

export interface DialogueNode {
  id: string;
  speaker: string;
  speakerTitle?: string;
  text: string;
  options?: DialogueChoice[];
  voiceTone?: 'urgent' | 'calm' | 'suspicious' | 'static';
}

export interface MapMarker {
  id: string;
  title: string;
  district: DistrictId;
  position: { x: number; z: number };
  type: 'player' | 'main_quest' | 'side_quest' | 'npc' | 'poi' | 'bunker_entry';
  discovered: boolean;
  description?: string;
}

export interface GameSettings {
  graphicsQuality: 'low' | 'medium' | 'high' | 'ultra';
  shadows: boolean;
  postProcessing: boolean;
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  mouseSensitivity: number;
  fov: number;
}

export interface GameEvents {
  // Player
  'PLAYER_MOVED': { position: THREE.Vector3; rotation: number; speed: number; isSprinting: boolean; isCrouching: boolean };
  'PLAYER_JUMP': void;
  'PLAYER_LAND': void;
  'PLAYER_FOOTSTEP': { surface: 'pavement' | 'wood' | 'metal' | 'dirt' | 'water' };
  'PLAYER_STAMINA_CHANGED': { current: number; max: number };
  'DISTRICT_ENTERED': DistrictInfo;

  // Signal & Scanning
  'SIGNAL_STRENGTH_CHANGED': { strength: number; frequency: number; beaconName: string; targetPosition?: THREE.Vector3 };
  'SCANNER_PING': { position: THREE.Vector3 };

  // Input & Interaction
  'INPUT_ACTION': { action: string; value: boolean | number };
  'INTERACTION_AVAILABLE': { id: string; label: string; action: () => void; promptType?: 'inspect' | 'talk' | 'use' | 'collect' } | null;

  // Investigation & Evidence
  'EVIDENCE_COLLECTED': EvidenceItem;
  'INSPECT_EVIDENCE': EvidenceItem;
  'JOURNAL_TOGGLED': boolean;

  // Inventory
  'ITEM_COLLECTED': { item: InventoryItem; quantity: number };
  'ITEM_USED': { itemId: string };
  'INVENTORY_TOGGLED': boolean;

  // Missions
  'QUEST_STARTED': { questId: string };
  'QUEST_UPDATED': { questId: string; objectiveId: string; progress: number };
  'QUEST_COMPLETED': { questId: string; quest: Quest };

  // Dialogue
  'DIALOGUE_START': DialogueNode;
  'DIALOGUE_SELECT_OPTION': DialogueChoice;
  'DIALOGUE_END': void;

  // Environment & Weather
  'WEATHER_CHANGED': { type: 'clear' | 'fog' | 'rain' | 'storm'; intensity: number };
  'TIME_OF_DAY_CHANGED': { hour: number; isNight: boolean };
  'THUNDER_STRIKE': { position: THREE.Vector3 };

  // UI & Flow
  'MAP_TOGGLED': boolean;
  'PAUSE_TOGGLED': boolean;
  'GAME_STATE_CHANGED': 'MENU' | 'PLAYING' | 'PAUSED' | 'CUTSCENE' | 'GAME_OVER' | 'VICTORY';
  'GAME_SAVED': { timestamp: number; manual: boolean };
  'GAME_LOADED': void;
  'SETTINGS_CHANGED': GameSettings;
  'NOTIFICATION': { title: string; message: string; type?: 'info' | 'success' | 'warning' | 'story' };
}

export interface IEventBus {
  on<K extends keyof GameEvents>(event: K, handler: (payload: GameEvents[K]) => void): void;
  off<K extends keyof GameEvents>(event: K, handler: (payload: GameEvents[K]) => void): void;
  emit<K extends keyof GameEvents>(event: K, payload: GameEvents[K]): void;
}

export interface IAssetManager {
  resolvePath(url: string): string;
  loadTexture(url: string): Promise<THREE.Texture>;
  loadAudio(url: string): Promise<AudioBuffer>;
  get<T>(key: string): T | undefined;
  set<T>(key: string, asset: T): void;
  preloadAll(): Promise<void>;
}

export interface ISoundManager {
  playFootstep(surface?: string): void;
  playJump(): void;
  playLand(): void;
  playInteract(): void;
  playEvidenceFound(): void;
  playQuestComplete(): void;
  playDialogueBlip(): void;
  playRadioStatic(intensity: number): void;
  playThunder(): void;
  setMasterVolume(val: number): void;
  setSfxVolume(val: number): void;
  setMusicVolume(val: number): void;
  update(delta: number): void;
}
