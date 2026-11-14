import * as THREE from 'three';
import { Controls } from './Controls';
import { CameraController } from './CameraController';
import { EventBus } from '../core/EventBus';
import { GameContext, ISystem } from '../types';

export class Player implements ISystem {
  public name = 'Player';
  public readonly position = new THREE.Vector3(0, 0, 0);
  public readonly velocity = new THREE.Vector3(0, 0, 0);

  private mesh: THREE.Mesh;
  public controls!: Controls;
  public cameraController!: CameraController;
  private eventBus = EventBus.getInstance();

  public health = 100;
  public maxHealth = 100;
  public speed = 7.0;
  public sprintMultiplier = 1.6;

  constructor() {
    // Player representation (capsule/cylinder placeholder for modular loading)
    const geometry = new THREE.CapsuleGeometry(0.5, 1.2, 8, 16);
    const material = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.4,
      metalness: 0.1
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
  }

  public init(context: GameContext): void {
    this.controls = new Controls(context.renderer.domElement);
    this.cameraController = new CameraController(context.camera, this.controls);

    context.scene.add(this.mesh);

    this.eventBus.emit('PLAYER_HEALTH_CHANGED', {
      current: this.health,
      max: this.maxHealth
    });
  }

  public update(delta: number): void {
    if (!this.controls) return;

    const forward = this.cameraController.getForwardVector();
    const right = this.cameraController.getRightVector();

    const moveDirection = new THREE.Vector3();

    if (this.controls.state.forward) moveDirection.add(forward);
    if (this.controls.state.backward) moveDirection.sub(forward);
    if (this.controls.state.right) moveDirection.add(right);
    if (this.controls.state.left) moveDirection.sub(right);

    moveDirection.y = 0;
    if (moveDirection.lengthSq() > 0) {
      moveDirection.normalize();
      const currentSpeed = this.speed * (this.controls.state.sprint ? this.sprintMultiplier : 1.0);
      this.position.addScaledVector(moveDirection, currentSpeed * delta);
    }

    // Update mesh position
    this.mesh.position.copy(this.position);
    this.mesh.position.y += 0.9; // Pivot offset

    // Update camera rig
    this.cameraController.setTarget(this.position);
    this.cameraController.update();

    // Broadcast movement for other modular systems (Map, Interaction, Signal detection)
    this.eventBus.emit('PLAYER_MOVED', {
      position: this.position.clone(),
      rotation: this.cameraController.getYaw()
    });
  }

  public damage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
    this.eventBus.emit('PLAYER_HEALTH_CHANGED', {
      current: this.health,
      max: this.maxHealth
    });
  }

  public heal(amount: number): void {
    this.health = Math.min(this.maxHealth, this.health + amount);
    this.eventBus.emit('PLAYER_HEALTH_CHANGED', {
      current: this.health,
      max: this.maxHealth
    });
  }

  public destroy(): void {
    this.controls?.destroy();
  }
}
