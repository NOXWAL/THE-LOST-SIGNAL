import * as THREE from 'three';
import { DistrictInfo } from '../types';

export class Environment {
  public group = new THREE.Group();
  private sunLight!: THREE.DirectionalLight;
  private ambientLight!: THREE.AmbientLight;
  private scene: THREE.Scene;

  private timeOfDay = 21.0; // Starts at 9:00 PM (noir atmosphere)

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.setupLighting();
    this.setupFog();
    scene.add(this.group);
  }

  private setupLighting(): void {
    // Ambient light with midnight blue sci-fi tint
    this.ambientLight = new THREE.AmbientLight(0x1e293b, 0.7);
    this.scene.add(this.ambientLight);

    // Directional moonlight with shadows
    this.sunLight = new THREE.DirectionalLight(0x93c5fd, 1.1);
    this.sunLight.position.set(120, 160, 90);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 400;

    const d = 140;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0005;

    this.scene.add(this.sunLight);
  }

  private setupFog(): void {
    this.scene.fog = new THREE.FogExp2(0x0a1020, 0.009);
  }

  public updateDistrictAmbiance(district: DistrictInfo, playerY: number): void {
    if (playerY < -15) {
      // Subterranean facility fog and mood
      (this.scene.fog as THREE.FogExp2).density = 0.025;
      (this.scene.fog as THREE.FogExp2).color.setHex(0x020812);
      this.ambientLight.color.setHex(0x083344);
      this.ambientLight.intensity = 0.9;
      this.sunLight.intensity = 0.0;
    } else {
      (this.scene.fog as THREE.FogExp2).density = district.fogDensity;
      (this.scene.fog as THREE.FogExp2).color.setHex(district.fogColor);
      this.ambientLight.color.setHex(district.ambientColor);
      this.ambientLight.intensity = 0.7;
      this.sunLight.intensity = 1.1;
    }
  }

  public update(delta: number, playerPos: THREE.Vector3): void {
    // Sun follows player for stable shadow map frustum
    this.sunLight.position.set(playerPos.x + 80, 160, playerPos.z + 60);
    this.sunLight.target.position.set(playerPos.x, playerPos.y, playerPos.z);
    this.sunLight.target.updateMatrixWorld();
  }
}
