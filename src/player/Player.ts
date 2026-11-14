import * as THREE from 'three';
import { Controls } from './Controls';
import { CameraController } from './CameraController';
import { EventBus } from '../core/EventBus';
import { GameContext, ISystem } from '../types';
import { Physics } from '../systems/Physics';

export class Player implements ISystem {
  public name = 'Player';
  public readonly position = new THREE.Vector3(-70, 0, 165); // Spawns near Safehouse in Residential District
  public readonly velocity = new THREE.Vector3(0, 0, 0);

  public characterGroup = new THREE.Group();
  private torsoMesh!: THREE.Mesh;
  private headMesh!: THREE.Mesh;
  private armLeft!: THREE.Group;
  private armRight!: THREE.Group;
  private legLeft!: THREE.Group;
  private legRight!: THREE.Group;
  private flashlight!: THREE.SpotLight;
  private isFlashlightOn = false;

  public controls!: Controls;
  public cameraController!: CameraController;
  private physics!: Physics;
  private eventBus = EventBus.getInstance();

  // Movement & Physics
  public isGrounded = true;
  private verticalVelocity = 0;
  private gravity = -24.0;
  private jumpForce = 8.5;

  public walkSpeed = 4.8;
  public sprintSpeed = 9.2;
  public crouchSpeed = 2.4;
  private currentFacingAngle = 0;

  // Stamina
  public stamina = 100;
  public maxStamina = 100;
  private footstepTimer = 0;

  public init(context: GameContext): void {
    this.controls = new Controls(context.renderer.domElement);
    this.cameraController = new CameraController(context.camera, this.controls);

    this.buildCharacterMesh();
    context.scene.add(this.characterGroup);

    this.eventBus.on('INPUT_ACTION', (payload) => {
      if (payload.action === 'toggleFlashlight' && payload.value) {
        this.toggleFlashlight();
      }
    });

    this.eventBus.emit('PLAYER_STAMINA_CHANGED', {
      current: this.stamina,
      max: this.maxStamina
    });
  }

  public setPhysics(physics: Physics): void {
    this.physics = physics;
    this.cameraController.setPhysics(physics);
  }

  private buildCharacterMesh(): void {
    // Torso / Trench Coat
    const coatGeom = new THREE.BoxGeometry(0.75, 0.9, 0.45);
    const coatMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.6,
      metalness: 0.2
    });
    this.torsoMesh = new THREE.Mesh(coatGeom, coatMat);
    this.torsoMesh.position.y = 1.15;
    this.torsoMesh.castShadow = true;
    this.characterGroup.add(this.torsoMesh);

    // Head with scanner headset
    const headGeom = new THREE.SphereGeometry(0.24, 16, 16);
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.8 });
    this.headMesh = new THREE.Mesh(headGeom, skinMat);
    this.headMesh.position.y = 1.8;
    this.headMesh.castShadow = true;
    this.characterGroup.add(this.headMesh);

    // Scanner Visor
    const visor = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.1, 0.15),
      new THREE.MeshBasicMaterial({ color: 0x06b6d4 })
    );
    visor.position.set(0, 1.82, 0.18);
    this.characterGroup.add(visor);

    // Articulated Arms
    this.armLeft = new THREE.Group();
    const armGeom = new THREE.BoxGeometry(0.2, 0.75, 0.2);
    const armMeshL = new THREE.Mesh(armGeom, coatMat);
    armMeshL.position.y = -0.35;
    this.armLeft.add(armMeshL);
    this.armLeft.position.set(-0.48, 1.5, 0);
    this.characterGroup.add(this.armLeft);

    this.armRight = new THREE.Group();
    const armMeshR = new THREE.Mesh(armGeom, coatMat);
    armMeshR.position.y = -0.35;
    this.armRight.add(armMeshR);
    this.armRight.position.set(0.48, 1.5, 0);
    this.characterGroup.add(this.armRight);

    // Articulated Legs
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
    const legGeom = new THREE.BoxGeometry(0.26, 0.85, 0.3);

    this.legLeft = new THREE.Group();
    const legMeshL = new THREE.Mesh(legGeom, pantsMat);
    legMeshL.position.y = -0.4;
    this.legLeft.add(legMeshL);
    this.legLeft.position.set(-0.2, 0.85, 0);
    this.characterGroup.add(this.legLeft);

    this.legRight = new THREE.Group();
    const legMeshR = new THREE.Mesh(legGeom, pantsMat);
    legMeshR.position.y = -0.4;
    this.legRight.add(legMeshR);
    this.legRight.position.set(0.2, 0.85, 0);
    this.characterGroup.add(this.legRight);

    // Tactical Flashlight
    this.flashlight = new THREE.SpotLight(0xffffff, 4, 35, Math.PI / 6, 0.3, 1);
    this.flashlight.position.set(0.3, 1.3, 0.2);
    this.flashlight.target.position.set(0.3, 1.3, 10);
    this.flashlight.visible = this.isFlashlightOn;
    this.characterGroup.add(this.flashlight);
    this.characterGroup.add(this.flashlight.target);
  }

  public toggleFlashlight(): void {
    this.isFlashlightOn = !this.isFlashlightOn;
    this.flashlight.visible = this.isFlashlightOn;
    this.eventBus.emit('NOTIFICATION', {
      title: 'FLASHLIGHT',
      message: this.isFlashlightOn ? 'Scanner Light Active' : 'Scanner Light Disabled',
      type: 'info'
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
    const isMoving = moveDirection.lengthSq() > 0.001;

    // Determine speed & stamina
    let speed = this.walkSpeed;
    const isCrouching = this.controls.state.crouch;
    let isSprinting = this.controls.state.sprint && !isCrouching && isMoving && this.stamina > 5;

    if (isCrouching) {
      speed = this.crouchSpeed;
      this.stamina = Math.min(this.maxStamina, this.stamina + 10 * delta);
    } else if (isSprinting) {
      speed = this.sprintSpeed;
      this.stamina = Math.max(0, this.stamina - 20 * delta);
      if (this.stamina <= 0) isSprinting = false;
    } else {
      this.stamina = Math.min(this.maxStamina, this.stamina + 15 * delta);
    }

    this.eventBus.emit('PLAYER_STAMINA_CHANGED', {
      current: this.stamina,
      max: this.maxStamina
    });

    // Jump & Gravity
    if (this.controls.state.jump && this.isGrounded && !isCrouching) {
      this.verticalVelocity = this.jumpForce;
      this.isGrounded = false;
      this.eventBus.emit('PLAYER_JUMP', undefined);
    }

    this.verticalVelocity += this.gravity * delta;
    const verticalMovement = this.verticalVelocity * delta;

    // Desired horizontal movement
    const desiredMove = new THREE.Vector3();
    if (isMoving) {
      moveDirection.normalize();
      desiredMove.copy(moveDirection).multiplyScalar(speed * delta);

      // Smooth turning towards movement direction
      const targetAngle = Math.atan2(moveDirection.x, moveDirection.z);
      // Shortest angle lerp
      let diff = targetAngle - this.currentFacingAngle;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      this.currentFacingAngle += diff * Math.min(1.0, delta * 14);
      this.characterGroup.rotation.y = this.currentFacingAngle;
    }

    // Collision check using spatial physics
    let resolvedPosition = this.position.clone();
    if (this.physics) {
      resolvedPosition = this.physics.checkPlayerCollision(this.position, desiredMove);
    } else {
      resolvedPosition.add(desiredMove);
    }

    // Apply vertical physics
    resolvedPosition.y += verticalMovement;

    // Check ground plane / elevation
    const floorY = resolvedPosition.y < -15 ? -35 : 0; // Underground vs Surface
    if (resolvedPosition.y <= floorY) {
      resolvedPosition.y = floorY;
      this.verticalVelocity = 0;
      if (!this.isGrounded) {
        this.isGrounded = true;
        this.eventBus.emit('PLAYER_LAND', undefined);
      }
    } else {
      this.isGrounded = false;
    }

    this.position.copy(resolvedPosition);
    this.characterGroup.position.copy(this.position);

    // Procedural locomotion animations
    this.animateCharacter(delta, isMoving, isSprinting, isCrouching);

    // Footstep audio triggers
    if (isMoving && this.isGrounded) {
      this.footstepTimer += delta * (isSprinting ? 2.5 : isCrouching ? 0.9 : 1.6);
      if (this.footstepTimer >= 0.8) {
        this.footstepTimer = 0;
        this.eventBus.emit('PLAYER_FOOTSTEP', { surface: this.position.y < -15 ? 'metal' : 'pavement' });
      }
    }

    // Camera follow
    this.cameraController.setTarget(this.position);
    this.cameraController.update(delta);

    // Broadcast movement
    this.eventBus.emit('PLAYER_MOVED', {
      position: this.position.clone(),
      rotation: this.currentFacingAngle,
      speed: isMoving ? speed : 0,
      isSprinting,
      isCrouching
    });
  }

  private animateCharacter(delta: number, isMoving: boolean, isSprinting: boolean, isCrouching: boolean): void {
    if (isMoving && this.isGrounded) {
      const cycleSpeed = isSprinting ? 14 : isCrouching ? 6 : 9;
      const legAngle = Math.sin(Date.now() * 0.001 * cycleSpeed) * (isSprinting ? 0.85 : 0.5);
      this.legLeft.rotation.x = legAngle;
      this.legRight.rotation.x = -legAngle;

      this.armLeft.rotation.x = -legAngle * 0.8;
      this.armRight.rotation.x = legAngle * 0.8;
    } else {
      // Return smoothly to idle
      this.legLeft.rotation.x = THREE.MathUtils.lerp(this.legLeft.rotation.x, 0, delta * 10);
      this.legRight.rotation.x = THREE.MathUtils.lerp(this.legRight.rotation.x, 0, delta * 10);
      this.armLeft.rotation.x = THREE.MathUtils.lerp(this.armLeft.rotation.x, 0, delta * 10);
      this.armRight.rotation.x = THREE.MathUtils.lerp(this.armRight.rotation.x, 0, delta * 10);
    }

    // Crouch height adjustment
    const targetY = isCrouching ? 0.8 : 1.15;
    this.torsoMesh.position.y = THREE.MathUtils.lerp(this.torsoMesh.position.y, targetY, delta * 10);
  }

  public teleport(x: number, y: number, z: number): void {
    this.position.set(x, y, z);
    this.characterGroup.position.copy(this.position);
    this.verticalVelocity = 0;
  }

  public destroy(): void {
    this.controls?.destroy();
  }
}
