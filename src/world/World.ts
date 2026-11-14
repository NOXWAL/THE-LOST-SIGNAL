import * as THREE from 'three';
import { GameContext, ISystem, DistrictInfo } from '../types';
import { Terrain } from './Terrain';
import { Environment } from './Environment';
import { Weather } from './Weather';
import { CityBuilder } from './CityBuilder';
import { Physics } from '../systems/Physics';
import { getDistrictAt } from './DistrictData';
import { EventBus } from '../core/EventBus';

export class World implements ISystem {
  public name = 'World';
  public terrain!: Terrain;
  public environment!: Environment;
  public weather!: Weather;
  public cityBuilder!: CityBuilder;

  private scene!: THREE.Scene;
  private physics: Physics;
  private eventBus = EventBus.getInstance();
  private playerPosition = new THREE.Vector3();
  private currentDistrict: DistrictInfo | null = null;

  constructor(physics: Physics) {
    this.physics = physics;
  }

  public init(context: GameContext): void {
    this.scene = context.scene;

    this.terrain = new Terrain();
    context.scene.add(this.terrain.mesh);

    this.cityBuilder = new CityBuilder(this.physics);
    const cityGroup = this.cityBuilder.buildEntireWorld();
    context.scene.add(cityGroup);

    this.environment = new Environment(context.scene);
    this.weather = new Weather(context.scene);

    this.eventBus.on('PLAYER_MOVED', (payload) => {
      this.playerPosition.copy(payload.position);
      this.checkDistrictTransition(payload.position);
      this.calculateSignalResonance(payload.position);
    });
  }

  private checkDistrictTransition(pos: THREE.Vector3): void {
    const district = getDistrictAt(pos.x, pos.z, pos.y);
    if (!this.currentDistrict || this.currentDistrict.id !== district.id) {
      this.currentDistrict = district;
      this.environment.updateDistrictAmbiance(district, pos.y);
      this.eventBus.emit('DISTRICT_ENTERED', district);
    }
  }

  private calculateSignalResonance(pos: THREE.Vector3): void {
    // The anomalous signal radiates from:
    // 1. Safehouse in Residential (-84, 175)
    // 2. Abandoned Office in Industrial (150, -80)
    // 3. Relay Tower in Forest (-260, -240)
    // 4. Central Core in Underground (600, 600)
    const beacons = [
      { name: 'Safehouse Beacon', x: -84, z: 175, y: 0 },
      { name: 'ChronoTech Industrial Relay', x: 150, z: -80, y: 0 },
      { name: 'Mountain Transmitter Tower', x: -260, z: -240, y: 0 },
      { name: 'Site-Zero Resonance Core', x: 600, z: 600, y: -35 }
    ];

    let maxStrength = 0;
    let closestBeacon = beacons[0];

    for (const b of beacons) {
      const dist = Math.hypot(pos.x - b.x, pos.z - b.z) + Math.abs(pos.y - b.y) * 2;
      const strength = Math.max(0, 1 - dist / 90);
      if (strength > maxStrength) {
        maxStrength = strength;
        closestBeacon = b;
      }
    }

    const frequency = 142.8 + (1 - maxStrength) * (Math.sin(Date.now() * 0.005) * 1.5 + 2.5);
    this.eventBus.emit('SIGNAL_STRENGTH_CHANGED', {
      strength: maxStrength,
      frequency,
      beaconName: closestBeacon.name,
      targetPosition: new THREE.Vector3(closestBeacon.x, closestBeacon.y, closestBeacon.z)
    });
  }

  public update(delta: number): void {
    this.environment?.update(delta, this.playerPosition);
    this.weather?.update(delta, this.playerPosition, this.scene);
  }

  public destroy(): void {}
}
