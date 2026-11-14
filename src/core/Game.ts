import * as THREE from 'three';
import { Renderer } from './Renderer';
import { SceneManager } from './SceneManager';
import { AssetManager } from './AssetManager';
import { EventBus } from './EventBus';
import { GameContext, ISystem } from '../types';

// Player & World
import { Player } from '../player/Player';
import { World } from '../world/World';

// Missions & Systems
import { QuestManager } from '../missions/QuestManager';
import { Inventory } from '../systems/Inventory';
import { Dialogue } from '../systems/Dialogue';
import { Interaction } from '../systems/Interaction';
import { NPCManager } from '../systems/NPCManager';
import { MapSystem } from '../systems/MapSystem';
import { SaveSystem } from '../systems/SaveSystem';

// UI
import { HUD } from '../ui/HUD';
import { MapUI } from '../ui/MapUI';
import { QuestUI } from '../ui/QuestUI';
import { MainMenu } from '../ui/MainMenu';

export class Game {
  public renderer!: Renderer;
  public sceneManager!: SceneManager;
  public assetManager!: AssetManager;
  public eventBus!: EventBus;

  // Systems
  private systems: ISystem[] = [];
  public player!: Player;
  public world!: World;
  public questManager!: QuestManager;
  public inventory!: Inventory;
  public dialogue!: Dialogue;
  public interaction!: Interaction;
  public npcManager!: NPCManager;
  public mapSystem!: MapSystem;
  public saveSystem!: SaveSystem;

  // UI
  public hud!: HUD;
  public mapUI!: MapUI;
  public questUI!: QuestUI;
  public mainMenu!: MainMenu;

  // Loop
  private clock = new THREE.Clock();
  private isRunning = false;
  private gameState: 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' = 'MENU';

  constructor(canvas: HTMLCanvasElement, uiContainer: HTMLElement) {
    this.initCore(canvas);
    this.initSystems();
    this.initUI(uiContainer);
    this.bindEvents();
  }

  private initCore(canvas: HTMLCanvasElement): void {
    this.renderer = new Renderer(canvas);
    this.sceneManager = new SceneManager();
    this.assetManager = new AssetManager();
    this.eventBus = EventBus.getInstance();
  }

  private initSystems(): void {
    const context: GameContext = {
      scene: this.sceneManager.scene,
      camera: this.sceneManager.camera,
      renderer: this.renderer.instance,
      eventBus: this.eventBus,
      assetManager: this.assetManager
    };

    // Instantiate systems
    this.player = new Player();
    this.world = new World();
    this.questManager = new QuestManager();
    this.inventory = new Inventory();
    this.dialogue = new Dialogue();
    this.interaction = new Interaction();
    this.npcManager = new NPCManager();
    this.mapSystem = new MapSystem();
    this.saveSystem = new SaveSystem();

    // Link dependencies through clean setter injection
    this.npcManager.setDependencies(this.interaction, this.dialogue);
    this.saveSystem.setDependencies(this.inventory, this.questManager, this.player);

    // Register execution order
    this.systems = [
      this.world,
      this.player,
      this.interaction,
      this.npcManager,
      this.dialogue,
      this.inventory,
      this.questManager,
      this.mapSystem,
      this.saveSystem
    ];

    // Initialize all registered systems
    this.systems.forEach((system) => {
      system.init(context);
    });
  }

  private initUI(uiContainer: HTMLElement): void {
    this.hud = new HUD(uiContainer);
    this.mapUI = new MapUI(uiContainer, this.mapSystem);
    this.questUI = new QuestUI(uiContainer, this.questManager);
    this.mainMenu = new MainMenu(uiContainer, this.saveSystem);
  }

  private bindEvents(): void {
    this.eventBus.on('GAME_STATE_CHANGED', (state) => {
      this.gameState = state;
    });

    // Simulated beacon frequency signal detector update based on proximity
    this.eventBus.on('PLAYER_MOVED', (payload) => {
      const beaconDist = Math.hypot(payload.position.x - (-30), payload.position.z - (-40));
      const strength = Math.max(0, 1 - beaconDist / 60);
      const frequency = 142.8 + (1 - strength) * 4.2;
      this.eventBus.emit('SIGNAL_STRENGTH_CHANGED', { strength, frequency });
    });
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.clock.start();
    this.loop();
  }

  private loop = (): void => {
    if (!this.isRunning) return;
    requestAnimationFrame(this.loop);

    const delta = Math.min(this.clock.getDelta(), 0.1);

    if (this.gameState === 'PLAYING') {
      for (let i = 0; i < this.systems.length; i++) {
        this.systems[i].update(delta);
      }
    }

    this.renderer.render(this.sceneManager.scene, this.sceneManager.camera);
  };

  public destroy(): void {
    this.isRunning = false;
    this.systems.forEach((s) => s.destroy?.());
    this.renderer.destroy();
    this.sceneManager.destroy();
  }
}
