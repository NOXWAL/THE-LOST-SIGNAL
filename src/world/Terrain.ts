import * as THREE from 'three';

export class Terrain {
  public mesh: THREE.Mesh;

  constructor() {
    const size = 300;
    const segments = 60;
    const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
    geometry.rotateX(-Math.PI / 2);

    // Add gentle procedural elevation undulations
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const elevation = Math.sin(x * 0.04) * Math.cos(z * 0.04) * 2.5 + Math.sin(x * 0.01 + z * 0.01) * 3.0;
      pos.setY(i, elevation);
    }
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      roughness: 0.85,
      metalness: 0.1,
      wireframe: false
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.receiveShadow = true;
  }

  public getHeightAt(x: number, z: number): number {
    return Math.sin(x * 0.04) * Math.cos(z * 0.04) * 2.5 + Math.sin(x * 0.01 + z * 0.01) * 3.0;
  }
}
