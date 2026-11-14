import * as THREE from 'three';
import { Controls } from './Controls';
import { Physics } from '../systems/Physics';

export class CameraController {
  private camera: THREE.PerspectiveCamera;
  private controls: Controls;
  private physics?: Physics;

  private yaw = 0;
  private pitch = 0.2;
  private distance = 4.5;
  private minDistance = 1.8;
  private maxDistance = 9.0;
  private sensitivity = 0.0022;

  private targetPosition = new THREE.Vector3();
  private currentCameraPos = new THREE.Vector3();
  private lookTarget = new THREE.Vector3();
  private headOffset = new THREE.Vector3(0, 1.6, 0);

  constructor(camera: THREE.PerspectiveCamera, controls: Controls, physics?: Physics) {
    this.camera = camera;
    this.controls = controls;
    this.physics = physics;
  }

  public setPhysics(physics: Physics): void {
    this.physics = physics;
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

  public update(delta: number): void {
    const deltaX = this.controls.state.mouseDeltaX;
    const deltaY = this.controls.state.mouseDeltaY;
    const zoom = this.controls.state.zoomDelta;

    this.yaw -= deltaX * this.sensitivity;
    this.pitch -= deltaY * this.sensitivity;

    // Clamp pitch between looking slightly down and straight up
    const minPitch = -0.3;
    const maxPitch = 1.25;
    this.pitch = Math.max(minPitch, Math.min(maxPitch, this.pitch));

    // Smooth zoom adjustment
    this.distance = Math.max(this.minDistance, Math.min(this.maxDistance, this.distance + zoom));

    // Compute ideal spherical camera offset
    const focusPoint = this.targetPosition.clone().add(this.headOffset);
    let desiredDist = this.distance;

    const offsetDir = new THREE.Vector3(
      Math.sin(this.yaw) * Math.cos(this.pitch),
      Math.sin(this.pitch),
      Math.cos(this.yaw) * Math.cos(this.pitch)
    ).normalize();

    // Collision raycast against buildings & walls to prevent camera clipping
    if (this.physics) {
      const colliders = this.physics.getNearbyColliders(focusPoint.x, focusPoint.z);
      const testRay = new THREE.Ray(focusPoint, offsetDir);
      for (const box of colliders) {
        const intersection = testRay.intersectBox(box, new THREE.Vector3());
        if (intersection) {
          const hitDist = focusPoint.distanceTo(intersection);
          if (hitDist < desiredDist) {
            desiredDist = Math.max(1.2, hitDist - 0.3);
          }
        }
      }
    }

    const idealCameraPos = focusPoint.clone().addScaledVector(offsetDir, desiredDist);

    // Smooth spherical interpolation (GTA camera feel)
    this.currentCameraPos.lerp(idealCameraPos, Math.min(1.0, delta * 15));
    this.camera.position.copy(this.currentCameraPos);

    // Look slightly above player waist / at chest-head level
    this.lookTarget.lerp(focusPoint, Math.min(1.0, delta * 20));
    this.camera.lookAt(this.lookTarget);

    this.controls.resetDeltas();
  }
}
