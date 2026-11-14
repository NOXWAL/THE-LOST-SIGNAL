import { EventBus } from '../core/EventBus';

export interface InputState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  sprint: boolean;
  jump: boolean;
  crouch: boolean;
  mouseDeltaX: number;
  mouseDeltaY: number;
  zoomDelta: number;
}

export class Controls {
  private eventBus = EventBus.getInstance();
  public state: InputState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
    jump: false,
    crouch: false,
    mouseDeltaX: 0,
    mouseDeltaY: 0,
    zoomDelta: 0
  };

  private isLocked = false;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.bindEvents();
  }

  private bindEvents(): void {
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));
    this.canvas.addEventListener('click', this.requestPointerLock.bind(this));
    document.addEventListener('pointerlockchange', this.onPointerLockChange.bind(this));
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('wheel', this.onWheel.bind(this), { passive: true });
  }

  private requestPointerLock(): void {
    if (!this.isLocked) {
      this.canvas.requestPointerLock();
    }
  }

  private onPointerLockChange(): void {
    this.isLocked = document.pointerLockElement === this.canvas;
  }

  private onMouseMove(e: MouseEvent): void {
    if (this.isLocked) {
      this.state.mouseDeltaX = e.movementX || 0;
      this.state.mouseDeltaY = e.movementY || 0;
    }
  }

  private onWheel(e: WheelEvent): void {
    this.state.zoomDelta = Math.sign(e.deltaY) * 0.5;
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (e.repeat) return;

    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.state.forward = true;
        this.eventBus.emit('INPUT_ACTION', { action: 'moveForward', value: true });
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.state.backward = true;
        this.eventBus.emit('INPUT_ACTION', { action: 'moveBackward', value: true });
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.state.left = true;
        this.eventBus.emit('INPUT_ACTION', { action: 'moveLeft', value: true });
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.state.right = true;
        this.eventBus.emit('INPUT_ACTION', { action: 'moveRight', value: true });
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.state.sprint = true;
        this.eventBus.emit('INPUT_ACTION', { action: 'sprint', value: true });
        break;
      case 'ControlLeft':
      case 'KeyC':
        this.state.crouch = true;
        this.eventBus.emit('INPUT_ACTION', { action: 'crouch', value: true });
        break;
      case 'Space':
        this.state.jump = true;
        this.eventBus.emit('INPUT_ACTION', { action: 'jump', value: true });
        break;
      case 'KeyE':
        this.eventBus.emit('INPUT_ACTION', { action: 'interact', value: true });
        break;
      case 'KeyM':
        this.eventBus.emit('INPUT_ACTION', { action: 'toggleMap', value: true });
        break;
      case 'KeyI':
      case 'Tab':
        e.preventDefault();
        this.eventBus.emit('INPUT_ACTION', { action: 'toggleInventory', value: true });
        break;
      case 'KeyJ':
        this.eventBus.emit('INPUT_ACTION', { action: 'toggleJournal', value: true });
        break;
      case 'KeyF':
        this.eventBus.emit('INPUT_ACTION', { action: 'toggleFlashlight', value: true });
        break;
      case 'Escape':
        this.eventBus.emit('INPUT_ACTION', { action: 'pauseGame', value: true });
        break;
    }
  }

  private onKeyUp(e: KeyboardEvent): void {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.state.forward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.state.backward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.state.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.state.right = false;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.state.sprint = false;
        break;
      case 'ControlLeft':
      case 'KeyC':
        this.state.crouch = false;
        break;
      case 'Space':
        this.state.jump = false;
        break;
    }
  }

  public resetDeltas(): void {
    this.state.mouseDeltaX = 0;
    this.state.mouseDeltaY = 0;
    this.state.zoomDelta = 0;
  }

  public destroy(): void {
    window.removeEventListener('keydown', this.onKeyDown.bind(this));
    window.removeEventListener('keyup', this.onKeyUp.bind(this));
    this.canvas.removeEventListener('click', this.requestPointerLock.bind(this));
    document.removeEventListener('pointerlockchange', this.onPointerLockChange.bind(this));
    document.removeEventListener('mousemove', this.onMouseMove.bind(this));
    window.removeEventListener('wheel', this.onWheel.bind(this));
  }
}
