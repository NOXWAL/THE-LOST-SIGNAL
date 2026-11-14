import * as THREE from 'three';

export class Environment {
  public group = new THREE.Group();
  private sunLight!: THREE.DirectionalLight;
  private ambientLight!: THREE.AmbientLight;

  constructor(scene: THREE.Scene) {
    this.setupLighting(scene);
    this.setupFog(scene);
    this.createSignalMonoliths();
    scene.add(this.group);
  }

  private setupLighting(scene: THREE.Scene): void {
    this.ambientLight = new THREE.AmbientLight(0x38bdf8, 0.4);
    scene.add(this.ambientLight);

    this.sunLight = new THREE.DirectionalLight(0xe0f2fe, 1.2);
    this.sunLight.position.set(50, 80, 40);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 200;
    const d = 50;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    scene.add(this.sunLight);
  }

  private setupFog(scene: THREE.Scene): void {
    scene.fog = new THREE.FogExp2(0x090d16, 0.015);
  }

  private createSignalMonoliths(): void {
    // Atmospheric beacon structures for "The Lost Signal"
    const beaconGeometry = new THREE.CylinderGeometry(0.8, 1.4, 18, 8);
    const beaconMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3,
      metalness: 0.8
    });

    const lightMaterial = new THREE.MeshBasicMaterial({
      color: 0x06b6d4
    });

    const positions = [
      { x: -30, z: -40 },
      { x: 50, z: -60 },
      { x: 20, z: 70 }
    ];

    positions.forEach((pos) => {
      const tower = new THREE.Mesh(beaconGeometry, beaconMaterial);
      tower.position.set(pos.x, 9, pos.z);
      tower.castShadow = true;

      const emitter = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 16), lightMaterial);
      emitter.position.set(pos.x, 18, pos.z);

      const beaconLight = new THREE.PointLight(0x06b6d4, 3, 40);
      beaconLight.position.set(pos.x, 19, pos.z);

      this.group.add(tower);
      this.group.add(emitter);
      this.group.add(beaconLight);
    });
  }

  public update(_delta: number): void {
    // Dynamic sun/ambient color shifts if day-night cycle is active
  }
}
