import { MapMarker, ISystem, GameContext } from '../types';
import { EventBus } from '../core/EventBus';

export class MapSystem implements ISystem {
  public name = 'MapSystem';
  private markers: Map<string, MapMarker> = new Map();
  private isOpen = false;
  private eventBus = EventBus.getInstance();

  public init(_context: GameContext): void {
    this.registerDefaultMarkers();

    this.eventBus.on('INPUT_ACTION', (payload) => {
      if (payload.action === 'toggleMap' && payload.value) {
        this.toggle();
      }
    });

    this.eventBus.on('PLAYER_MOVED', (payload) => {
      this.updatePlayerMarker(payload.position.x, payload.position.z);
    });
  }

  private registerDefaultMarkers(): void {
    const defaultMarkers: MapMarker[] = [
      {
        id: 'player',
        title: 'Player',
        position: { x: 0, z: 0 },
        type: 'player',
        discovered: true
      },
      {
        id: 'beacon_alpha',
        title: 'Beacon Alpha (Sector 4)',
        position: { x: -30, z: -40 },
        type: 'signal_beacon',
        discovered: true
      },
      {
        id: 'beacon_beta',
        title: 'Beacon Beta (Perimeter)',
        position: { x: 50, z: -60 },
        type: 'signal_beacon',
        discovered: false
      },
      {
        id: 'outpost',
        title: 'Forward Outpost',
        position: { x: 5, z: -10 },
        type: 'npc',
        discovered: true
      }
    ];

    defaultMarkers.forEach((m) => this.markers.set(m.id, m));
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
    if (marker) {
      marker.discovered = true;
    }
  }

  public update(_delta: number): void {}
}
