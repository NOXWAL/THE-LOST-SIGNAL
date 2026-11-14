import * as THREE from 'three';
import { BoxCollider, ISystem, GameContext } from '../types';

export class Physics implements ISystem {
  public name = 'Physics';
  private colliders: BoxCollider[] = [];
  private staticColliders: THREE.Box3[] = [];
  private triggerColliders: { box: THREE.Box3; tag: string; onEnter?: () => void }[] = [];

  // Spatial partitioning grid for high-performance collision checks
  private cellSize = 40;
  private grid: Map<string, THREE.Box3[]> = new Map();

  public init(_context: GameContext): void {
    console.log('[Physics] Initialized spatial physics system');
  }

  private getCellKey(x: number, z: number): string {
    const cx = Math.floor(x / this.cellSize);
    const cz = Math.floor(z / this.cellSize);
    return `${cx}:${cz}`;
  }

  public addBoxCollider(min: THREE.Vector3, max: THREE.Vector3, tag?: string, isTrigger = false): void {
    const box = new THREE.Box3(min.clone(), max.clone());
    if (isTrigger) {
      this.triggerColliders.push({ box, tag: tag || 'trigger' });
    } else {
      this.staticColliders.push(box);
      this.insertIntoGrid(box);
    }
  }

  public addMeshCollider(mesh: THREE.Mesh, tag?: string): void {
    mesh.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(mesh);
    this.staticColliders.push(box);
    this.insertIntoGrid(box);
  }

  private insertIntoGrid(box: THREE.Box3): void {
    const minCx = Math.floor(box.min.x / this.cellSize);
    const maxCx = Math.floor(box.max.x / this.cellSize);
    const minCz = Math.floor(box.min.z / this.cellSize);
    const maxCz = Math.floor(box.max.z / this.cellSize);

    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cz = minCz; cz <= maxCz; cz++) {
        const key = `${cx}:${cz}`;
        if (!this.grid.has(key)) {
          this.grid.set(key, []);
        }
        this.grid.get(key)!.push(box);
      }
    }
  }

  public checkPlayerCollision(
    currentPos: THREE.Vector3,
    desiredMove: THREE.Vector3,
    playerRadius = 0.4,
    playerHeight = 1.8
  ): THREE.Vector3 {
    const targetPos = currentPos.clone().add(desiredMove);
    const candidateBoxes = this.getNearbyColliders(targetPos.x, targetPos.z);

    // Resolve X movement
    let resolvedX = targetPos.x;
    const testBoxX = new THREE.Box3(
      new THREE.Vector3(resolvedX - playerRadius, currentPos.y + 0.1, currentPos.z - playerRadius),
      new THREE.Vector3(resolvedX + playerRadius, currentPos.y + playerHeight, currentPos.z + playerRadius)
    );

    for (const box of candidateBoxes) {
      if (box.intersectsBox(testBoxX)) {
        // Slide along X: revert X movement
        resolvedX = currentPos.x;
        break;
      }
    }

    // Resolve Z movement
    let resolvedZ = targetPos.z;
    const testBoxZ = new THREE.Box3(
      new THREE.Vector3(resolvedX - playerRadius, currentPos.y + 0.1, resolvedZ - playerRadius),
      new THREE.Vector3(resolvedX + playerRadius, currentPos.y + playerHeight, resolvedZ + playerRadius)
    );

    for (const box of candidateBoxes) {
      if (box.intersectsBox(testBoxZ)) {
        // Slide along Z: revert Z movement
        resolvedZ = currentPos.z;
        break;
      }
    }

    return new THREE.Vector3(resolvedX, targetPos.y, resolvedZ);
  }

  public getNearbyColliders(x: number, z: number): THREE.Box3[] {
    const key = this.getCellKey(x, z);
    return this.grid.get(key) || [];
  }

  public clear(): void {
    this.colliders = [];
    this.staticColliders = [];
    this.triggerColliders = [];
    this.grid.clear();
  }

  public update(_delta: number): void {}
}
