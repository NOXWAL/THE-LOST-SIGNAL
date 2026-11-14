import * as THREE from 'three';
import { EventBus } from '../core/EventBus';

export class Weather {
  private particles: THREE.Points;
  private particleCount = 2400;
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private eventBus = EventBus.getInstance();

  private isRaining = true;
  private intensity = 0.8;
  private thunderTimer = 0;

  constructor(scene: THREE.Scene) {
    this.geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.particleCount * 3);

    for (let i = 0; i < this.particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 200;
      positions[i + 1] = Math.random() * 50;
      positions[i + 2] = (Math.random() - 0.5) * 200;
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    this.material = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.22,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(this.geometry, this.material);
    scene.add(this.particles);

    this.eventBus.on('WEATHER_CHANGED', (payload) => {
      this.intensity = payload.intensity;
      this.isRaining = payload.type === 'rain' || payload.type === 'storm';
      this.particles.visible = this.isRaining;
    });
  }

  public update(delta: number, playerPos: THREE.Vector3, scene: THREE.Scene): void {
    if (!this.isRaining || playerPos.y < -15) {
      this.particles.visible = false;
      return;
    }
    this.particles.visible = true;

    const positions = this.geometry.attributes.position.array as Float32Array;
    const fallSpeed = 38.0 * this.intensity;

    for (let i = 0; i < this.particleCount * 3; i += 3) {
      positions[i + 1] -= fallSpeed * delta;
      positions[i] += 4.0 * delta; // Wind drift

      if (positions[i + 1] < 0) {
        positions[i + 1] = 45;
        positions[i] = playerPos.x + (Math.random() - 0.5) * 160;
        positions[i + 2] = playerPos.z + (Math.random() - 0.5) * 160;
      }
    }

    this.geometry.attributes.position.needsUpdate = true;

    // Thunder flashes
    this.thunderTimer += delta;
    if (this.thunderTimer > 14 + Math.random() * 10) {
      this.thunderTimer = 0;
      this.triggerThunder(scene, playerPos);
    }
  }

  private triggerThunder(scene: THREE.Scene, playerPos: THREE.Vector3): void {
    const flashLight = new THREE.PointLight(0xe0f2fe, 15, 300);
    flashLight.position.set(playerPos.x + 30, 90, playerPos.z + 20);
    scene.add(flashLight);

    this.eventBus.emit('THUNDER_STRIKE', { position: flashLight.position });

    setTimeout(() => {
      flashLight.intensity = 5;
      setTimeout(() => {
        scene.remove(flashLight);
        flashLight.dispose();
      }, 80);
    }, 120);
  }
}
