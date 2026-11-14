import * as THREE from 'three';
import { Renderer } from './Renderer';
import { SceneManager } from './SceneManager';
import { AssetManager } from './AssetManager';
import { EventBus } from './EventBus';
import { SoundManager } from './SoundManager';
import { GameContext, ISystem } from '../types';

// Player & Physics
import { Physics } from '../systems/Physics';
import { Player } from '../player/Player';

// World
import { World } from '../world/World';

// Gameplay Systems
import { QuestManager } from '../missions/QuestManager';
import { Inventory } from '../systems/Inventory';
import { Dialogue } from '../systems/Dialogue';
import { Interaction } from '../systems/Interaction';
import { NPCManager } from '../systems/NPCManager';
import { Investigation } from '../systems/Investigation';
import { MapSystem } from '../systems/MapSystem';
import { SaveSystem } from '../systems/SaveSystem';

// UI
import { HUD } from '../ui/HUD';
import { MapUI } from '../ui/MapUI';
import { JournalUI } from '../ui/JournalUI';
import { InventoryUI } from '../ui/InventoryUI';
import { SettingsUI } from '../ui/SettingsUI';
import { PauseMenu } from '../ui/PauseMenu';
import { MainMenu } from '../ui/MainMenu';

export class Game {
  public renderer!: Renderer;
  public sceneManager!: SceneManager;
  public assetManager!: AssetManager;
  public soundManager!: SoundManager;
  public eventBus!: EventBus;

  // Systems
  private systems: ISystem[] = [];
  public physics!: Physics;
  public player!: Player;
  public world!: World;
  public questManager!: QuestManager;
  public inventory!: Inventory;
  public dialogue!: Dialogue;
  public interaction!: Interaction;
  public npcManager!: NPCManager;
  public investigation!: Investigation;
  public mapSystem!: MapSystem;
  public saveSystem!: SaveSystem;

  // UI
  public hud!: HUD;
  public mapUI!: MapUI;
  public journalUI!: JournalUI;
  public inventoryUI!: InventoryUI;
  public settingsUI!: SettingsUI;
  public pauseMenu!: PauseMenu;
  public mainMenu!: MainMenu;

  // Game Loop
  private clock = new THREE.Clock();
  private isRunning = false;
  private gameState: 'MENU' | 'PLAYING' | 'PAUSED' | 'CUTSCENE' | 'GAME_OVER' | 'VICTORY' = 'MENU';

  constructor(canvas: HTMLCanvasElement, uiContainer: HTMLElement) {
    this.initCore(canvas);
    this.initSystems();
    this.initUI(uiContainer);
    this.setupStoryInteractions();
    this.bindEvents();
  }

  private initCore(canvas: HTMLCanvasElement): void {
    this.renderer = new Renderer(canvas);
    this.sceneManager = new SceneManager();
    this.assetManager = new AssetManager();
    this.soundManager = new SoundManager();
    this.eventBus = EventBus.getInstance();
  }

  private initSystems(): void {
    const context: GameContext = {
      scene: this.sceneManager.scene,
      camera: this.sceneManager.camera,
      renderer: this.renderer.instance,
      eventBus: this.eventBus,
      assetManager: this.assetManager,
      soundManager: this.soundManager
    };

    // Instantiate systems
    this.physics = new Physics();
    this.player = new Player();
    this.world = new World(this.physics);
    this.interaction = new Interaction();
    this.dialogue = new Dialogue();
    this.npcManager = new NPCManager();
    this.investigation = new Investigation();
    this.inventory = new Inventory();
    this.questManager = new QuestManager();
    this.mapSystem = new MapSystem();
    this.saveSystem = new SaveSystem();

    // Dependency injection
    this.player.setPhysics(this.physics);
    this.npcManager.setDependencies(this.interaction, this.dialogue);
    this.saveSystem.setDependencies(this.inventory, this.questManager, this.investigation, this.player);

    // Registration order
    this.systems = [
      this.physics,
      this.world,
      this.player,
      this.interaction,
      this.npcManager,
      this.dialogue,
      this.investigation,
      this.inventory,
      this.questManager,
      this.mapSystem,
      this.saveSystem
    ];

    // Initialize all
    this.systems.forEach((system) => {
      system.init(context);
    });
  }

  private initUI(uiContainer: HTMLElement): void {
    this.hud = new HUD(uiContainer, this.questManager);
    this.mapUI = new MapUI(uiContainer, this.mapSystem);
    this.journalUI = new JournalUI(uiContainer, this.investigation);
    this.inventoryUI = new InventoryUI(uiContainer, this.inventory);
    this.settingsUI = new SettingsUI(uiContainer);
    this.pauseMenu = new PauseMenu(uiContainer, this.saveSystem);
    this.mainMenu = new MainMenu(uiContainer, this.saveSystem);
  }

  private setupStoryInteractions(): void {
    // 1. Mission 01: Safehouse Desk (Westside Residential)
    this.interaction.register({
      id: 'interact_safehouse_desk',
      position: new THREE.Vector3(-84, 0, 175),
      radius: 3.5,
      prompt: 'Search Dr. Vance\'s Desk Compartment [E]',
      promptType: 'inspect',
      onInteract: () => {
        this.soundManager.playEvidenceFound();
        const clue = this.investigation.collectClue('clue_evelyn_ledger');
        if (clue) {
          this.eventBus.emit('INSPECT_EVIDENCE', clue);
          this.eventBus.emit('JOURNAL_TOGGLED', true);
        }
      }
    });

    // 2. Mission 02: Abandoned ChronoTech Office Safe (Industrial Zone)
    this.interaction.register({
      id: 'interact_office_safe',
      position: new THREE.Vector3(150, 0, -80),
      radius: 4.5,
      prompt: 'Open Security Safe & Inspect Blueprints [E]',
      promptType: 'inspect',
      onInteract: () => {
        this.soundManager.playEvidenceFound();
        const clue = this.investigation.collectClue('clue_office_blueprints');
        if (clue) {
          this.eventBus.emit('INSPECT_EVIDENCE', clue);
          this.eventBus.emit('JOURNAL_TOGGLED', true);
        }
      }
    });

    // 3. Mission 04: Industrial Canal Drainage Hatch (Descend to Site-Zero)
    this.interaction.register({
      id: 'interact_bunker_hatch',
      position: new THREE.Vector3(180, 0, -120),
      radius: 4.0,
      prompt: 'Unlock Submerged Canal Hatch & Descend Underground [E]',
      promptType: 'use',
      onInteract: () => {
        this.soundManager.playInteract();
        this.eventBus.emit('NOTIFICATION', {
          title: 'ACCESSING SITE-ZERO',
          message: 'Descending into Subterranean Research Complex...',
          type: 'story'
        });
        setTimeout(() => {
          this.player.teleport(600, -35, 540);
        }, 600);
      }
    });

    // 4. Mission 05: Sub-Zero Resonance Core Console (Underground Site-Zero)
    this.interaction.register({
      id: 'interact_resonance_console',
      position: new THREE.Vector3(600, -35, 600),
      radius: 5.0,
      prompt: 'Override Frequency & Stabilize Resonance Core [E]',
      promptType: 'use',
      onInteract: () => {
        this.soundManager.playQuestComplete();
        this.investigation.collectClue('clue_core_telemetry');
        this.questManager.advanceObjective('mission_05_truth', 'obj_align_resonance', 1);
      }
    });
  }

  private bindEvents(): void {
    this.eventBus.on('GAME_STATE_CHANGED', (state) => {
      this.gameState = state;
      if (state === 'PLAYING') {
        this.clock.start();
      } else if (state === 'VICTORY') {
        this.showVictoryEnding();
      }
    });

    // Audio Event Bindings
    this.eventBus.on('PLAYER_FOOTSTEP', (payload) => {
      this.soundManager.playFootstep(payload.surface);
    });

    this.eventBus.on('PLAYER_JUMP', () => {
      this.soundManager.playJump();
    });

    this.eventBus.on('PLAYER_LAND', () => {
      this.soundManager.playLand();
    });

    this.eventBus.on('DIALOGUE_START', () => {
      this.soundManager.playDialogueBlip();
    });

    this.eventBus.on('QUEST_COMPLETED', () => {
      this.soundManager.playQuestComplete();
    });

    this.eventBus.on('THUNDER_STRIKE', () => {
      this.soundManager.playThunder();
    });

    this.eventBus.on('SIGNAL_STRENGTH_CHANGED', (payload) => {
      this.soundManager.playRadioStatic(payload.strength);
    });

    this.eventBus.on('SETTINGS_CHANGED', (settings) => {
      this.soundManager.setMasterVolume(settings.masterVolume);
      this.soundManager.setSfxVolume(settings.sfxVolume);
      this.soundManager.setMusicVolume(settings.musicVolume);
    });

    // Dialogue custom action handlers
    this.eventBus.on('INPUT_ACTION', (payload) => {
      if (payload.action === 'rewardMarcus' && payload.value) {
        this.soundManager.playEvidenceFound();
        const clue = this.investigation.collectClue('clue_audio_marcus');
        if (clue) {
          this.eventBus.emit('JOURNAL_TOGGLED', true);
        }
      } else if (payload.action === 'downloadTelemetry' && payload.value) {
        this.soundManager.playEvidenceFound();
        const clue = this.investigation.collectClue('clue_core_telemetry');
        if (clue) {
          this.eventBus.emit('JOURNAL_TOGGLED', true);
        }
      } else if (payload.action === 'triggerEnding' && payload.value) {
        this.soundManager.playQuestComplete();
        this.questManager.advanceObjective('mission_05_truth', 'obj_align_resonance', 1);
      } else if (payload.action === 'toggleSettings' && payload.value) {
        this.settingsUI.toggle();
      }
    });
  }

  private showVictoryEnding(): void {
    const victoryOverlay = document.createElement('div');
    victoryOverlay.className = 'interactive';
    victoryOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: radial-gradient(circle at center, rgba(15, 23, 42, 0.95) 0%, rgba(2, 6, 23, 1) 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 100;
      color: #f8fafc;
      text-align: center;
      padding: 30px;
    `;

    victoryOverlay.innerHTML = `
      <div style="max-width: 650px;">
        <div style="font-size: 13px; letter-spacing: 5px; color: #38bdf8; font-weight: 800; text-transform: uppercase;">
          TRANSMISSION STABILIZED • FREQUENCY 142.8 MHZ
        </div>
        <h1 style="font-size: 44px; font-weight: 900; letter-spacing: 6px; margin-top: 12px; margin-bottom: 20px; text-shadow: 0 0 35px rgba(56, 189, 248, 0.8);">
          THE TRUTH REVEALED
        </h1>
        <p style="font-size: 16px; line-height: 1.8; color: #cbd5e1; margin-bottom: 24px;">
          As the resonance pillars locked into harmonic alignment, the spacetime interference collapsed. 
          Dr. Evelyn Vance\'s final quantum reflection appeared on the central console, her voice clear across the silence:
        </p>
        <blockquote style="font-style: italic; background: rgba(30, 41, 59, 0.6); border-left: 3px solid #38bdf8; padding: 18px; border-radius: 6px; font-size: 15px; color: #38bdf8; margin-bottom: 30px;">
          "The signal has finally found a listener. The loop is closed. Thank you for searching for me."
        </blockquote>
        <button id="victory-restart-btn" style="
          background: #0284c7;
          color: white;
          border: none;
          padding: 14px 32px;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 1.5px;
          border-radius: 6px;
          cursor: pointer;
          box-shadow: 0 0 25px rgba(2, 132, 199, 0.5);
        ">RETURN TO MAIN MENU</button>
      </div>
    `;

    document.body.appendChild(victoryOverlay);
    victoryOverlay.querySelector('#victory-restart-btn')!.addEventListener('click', () => {
      victoryOverlay.remove();
      this.mainMenu.show();
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
      this.soundManager.update(delta);
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
