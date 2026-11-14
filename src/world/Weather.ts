import * as THREE from 'three';
import { EventBus } from '../core/EventBus';

export class Weather {
  private particles: THREE.Points;
  private particleCount = 1200;
  private geometry: THREE.BufferGeometry;
  private eventBus = EventBus.getInstance();
  private intensity = 0.5;

  constructor(scene: THREE.Scene) {
    this.geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.particleCount * 3);

    for (let i = 0; i < this.particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 160;
      positions[i + 1] = Math.random() * 40;
      positions[i + 2] = (Math.random() - 0.5) * 160;
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.15,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(this.geometry, material);
    scene.add(this.particles);

    this.eventBus.on('WEATHER_CHANGED', (payload) => {
      this.intensity = payload.intensity;
      material.opacity = 0.3 + payload.intensity * 0.5;
    });
  }

  public update(delta: number, playerPos: THREE.Vector3): void {
    const positions = this.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < this.particleCount * 3; i += 3) {
      positions[i + 1] -= (6.0 + this.intensity * 8.0) * delta;

      // Wrap around player position
      if (positions[i + 1] < 0) {
        positions[i + 1] = 40;
        positions[i] = playerPos.x + (Math.random() - 0.5) * 100;
        positions[i + 2] = playerPos.z + (Math.random() - 0.5) * 100;
      }
    }

    this.geometry.attributes.position.needsUpdate = true;
  }
}
