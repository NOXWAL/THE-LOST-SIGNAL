import * as THREE from 'three';
import { ISystem, GameContext } from '../types';
import { EventBus } from '../core/EventBus';

export interface Interactable {
  id: string;
  position: THREE.Vector3;
  radius: number;
  prompt: string;
  promptType?: 'inspect' | 'talk' | 'use' | 'collect';
  onInteract: () => void;
}

export class Interaction implements ISystem {
  public name = 'Interaction';
  private interactables: Interactable[] = [];
  private playerPos = new THREE.Vector3();
  private currentActive: Interactable | null = null;
  private eventBus = EventBus.getInstance();

  public init(_context: GameContext): void {
    this.eventBus.on('PLAYER_MOVED', (payload) => {
      this.playerPos.copy(payload.position);
      this.checkProximity();
    });

    this.eventBus.on('INPUT_ACTION', (payload) => {
      if (payload.action === 'interact' && payload.value && this.currentActive) {
        this.currentActive.onInteract();
      }
    });
  }

  public register(interactable: Interactable): void {
    this.interactables.push(interactable);
  }

  public unregister(id: string): void {
    this.interactables = this.interactables.filter((item) => item.id !== id);
    if (this.currentActive?.id === id) {
      this.clearActive();
    }
  }

  private checkProximity(): void {
    let closest: Interactable | null = null;
    let closestDist = Infinity;

    for (const item of this.interactables) {
      const dist = this.playerPos.distanceTo(item.position);
      if (dist <= item.radius && dist < closestDist) {
        closest = item;
        closestDist = dist;
      }
    }

    if (closest !== this.currentActive) {
      this.currentActive = closest;
      if (closest) {
        this.eventBus.emit('INTERACTION_AVAILABLE', {
          id: closest.id,
          label: closest.prompt,
          promptType: closest.promptType || 'inspect',
          action: closest.onInteract
        });
      } else {
        this.clearActive();
      }
    }
  }

  private clearActive(): void {
    this.currentActive = null;
    this.eventBus.emit('INTERACTION_AVAILABLE', null);
  }

  public update(_delta: number): void {}
}
