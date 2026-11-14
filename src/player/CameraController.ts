import * as THREE from 'three';
import { Controls } from './Controls';

export class CameraController {
  private camera: THREE.PerspectiveCamera;
  private controls: Controls;
  private yaw = 0;
  private pitch = 0;
  private sensitivity = 0.002;
  private targetPosition = new THREE.Vector3();
  private cameraOffset = new THREE.Vector3(0, 1.8, 0); // Eye height

  constructor(camera: THREE.PerspectiveCamera, controls: Controls) {
    this.camera = camera;
    this.controls = controls;
  }

  public setTarget(target: THREE.Vector3): void {
    this.targetPosition.copy(target);
  }

  public getForwardVector(): THREE.Vector3 {
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
    return forward;
  }

  public getRightVector(): THREE.Vector3 {
    const right = new THREE.Vector3(1, 0, 0);
    right.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
    return right;
  }

  public getYaw(): number {
    return this.yaw;
  }

  public update(): void {
    const deltaX = this.controls.state.mouseDeltaX;
    const deltaY = this.controls.state.mouseDeltaY;

    this.yaw -= deltaX * this.sensitivity;
    this.pitch -= deltaY * this.sensitivity;

    // Clamp pitch
    const maxPitch = Math.PI / 2 - 0.05;
    this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));

    this.camera.position.copy(this.targetPosition).add(this.cameraOffset);

    // Calculate look target
    const lookTarget = new THREE.Vector3();
    lookTarget.x = this.camera.position.x + Math.sin(this.yaw) * Math.cos(this.pitch);
    lookTarget.y = this.camera.position.y + Math.sin(this.pitch);
    lookTarget.z = this.camera.position.z - Math.cos(this.yaw) * Math.cos(this.pitch);

    this.camera.lookAt(lookTarget);

    this.controls.resetDeltas();
  }
}
