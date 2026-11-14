import { MapMarker, ISystem, GameContext } from '../types';
import { EventBus } from '../core/EventBus';

export class MapSystem implements ISystem {
  public name = 'MapSystem';
  private markers: Map<string, MapMarker> = new Map();
  private isOpen = false;
  private eventBus = EventBus.getInstance();

  public init(_context: GameContext): void {
    this.registerStoryMarkers();

    this.eventBus.on('INPUT_ACTION', (payload) => {
      if (payload.action === 'toggleMap' && payload.value) {
        this.toggle();
      }
    });

    this.eventBus.on('PLAYER_MOVED', (payload) => {
      this.updatePlayerMarker(payload.position.x, payload.position.z);
    });

    this.eventBus.on('QUEST_STARTED', (payload) => {
      this.updateActiveQuestMarker(payload.questId);
    });
  }

  private registerStoryMarkers(): void {
    const defaultMarkers: MapMarker[] = [
      {
        id: 'player',
        title: 'Investigator Position',
        district: 'residential',
        position: { x: -70, z: 165 },
        type: 'player',
        discovered: true
      },
      {
        id: 'poi_safehouse',
        title: 'Safehouse Apartment 304',
        district: 'residential',
        position: { x: -84, z: 175 },
        type: 'main_quest',
        discovered: true,
        description: 'Dr. Evelyn Vance\'s former residence'
      },
      {
        id: 'poi_office',
        title: 'Abandoned ChronoTech Office',
        district: 'industrial',
        position: { x: 150, z: -80 },
        type: 'poi',
        discovered: false,
        description: 'Former research administrative building'
      },
      {
        id: 'poi_cabin',
        title: 'Marcus\'s Forest Cabin',
        district: 'forest',
        position: { x: -180, z: -180 },
        type: 'poi',
        discovered: false,
        description: 'Informant hideout in the pine ridge'
      },
      {
        id: 'poi_bunker_hatch',
        title: 'Canal Drainage Hatch (Site-Zero Entrance)',
        district: 'industrial',
        position: { x: 180, z: -120 },
        type: 'bunker_entry',
        discovered: false,
        description: 'Submerged access hatch to underground facility'
      },
      {
        id: 'poi_resonance_core',
        title: 'Sub-Zero Resonance Core',
        district: 'underground',
        position: { x: 600, z: 600 },
        type: 'main_quest',
        discovered: false,
        description: 'Origin of the anomalous 142.8 MHz loop'
      }
    ];

    defaultMarkers.forEach((m) => this.markers.set(m.id, m));
  }

  private updateActiveQuestMarker(questId: string): void {
    if (questId === 'mission_02_office') {
      this.discover('poi_office');
      const m = this.markers.get('poi_office');
      if (m) m.type = 'main_quest';
    } else if (questId === 'mission_03_stranger') {
      this.discover('poi_cabin');
      const m = this.markers.get('poi_cabin');
      if (m) m.type = 'main_quest';
    } else if (questId === 'mission_04_beneath') {
      this.discover('poi_bunker_hatch');
      const m = this.markers.get('poi_bunker_hatch');
      if (m) m.type = 'main_quest';
    } else if (questId === 'mission_05_truth') {
      this.discover('poi_resonance_core');
      const m = this.markers.get('poi_resonance_core');
      if (m) m.type = 'main_quest';
    }
  }

  public updatePlayerMarker(x: number, z: number): void {
    const playerMarker = this.markers.get('player');
    if (playerMarker) {
      playerMarker.position.x = x;
      playerMarker.position.z = z;
    }
  }

  public toggle(): void {
    this.isOpen = !this.isOpen;
    this.eventBus.emit('MAP_TOGGLED', this.isOpen);
  }

  public getMarkers(): MapMarker[] {
    return Array.from(this.markers.values());
  }

  public discover(id: string): void {
    const marker = this.markers.get(id);
    if (marker && !marker.discovered) {
      marker.discovered = true;
      this.eventBus.emit('NOTIFICATION', {
        title: 'LOCATION DISCOVERED',
        message: marker.title,
        type: 'info'
      });
    }
  }

  public update(_delta: number): void {}
}
