import { GameContext, ISystem } from '../types';
import { Terrain } from './Terrain';
import { Environment } from './Environment';
import { Weather } from './Weather';
import * as THREE from 'three';
import { EventBus } from '../core/EventBus';

export class World implements ISystem {
  public name = 'World';
  public terrain!: Terrain;
  public environment!: Environment;
  public weather!: Weather;

  private playerPosition = new THREE.Vector3();
  private eventBus = EventBus.getInstance();

  public init(context: GameContext): void {
    this.terrain = new Terrain();
    context.scene.add(this.terrain.mesh);

    this.environment = new Environment(context.scene);
    this.weather = new Weather(context.scene);

    this.eventBus.on('PLAYER_MOVED', (payload) => {
      this.playerPosition.copy(payload.position);
    });
  }

  public update(delta: number): void {
    this.environment?.update(delta);
    this.weather?.update(delta, this.playerPosition);
  }

  public destroy(): void {
    // Cleanup meshes
  }
}
