import * as THREE from 'three';
import { ISystem, GameContext } from '../types';
import { Interaction } from './Interaction';
import { Dialogue } from './Dialogue';

export class NPCManager implements ISystem {
  public name = 'NPCManager';
  private group = new THREE.Group();
  private interactionSystem!: Interaction;
  private dialogueSystem!: Dialogue;

  public setDependencies(interaction: Interaction, dialogue: Dialogue): void {
    this.interactionSystem = interaction;
    this.dialogueSystem = dialogue;
  }

  public init(context: GameContext): void {
    context.scene.add(this.group);
    this.spawnNPCs();
  }

  private spawnNPCs(): void {
    // Engineer Kael NPC near outpost
    const geometry = new THREE.CapsuleGeometry(0.5, 1.2, 8, 16);
    const material = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.5,
      metalness: 0.2
    });

    const kaelMesh = new THREE.Mesh(geometry, material);
    kaelMesh.position.set(5, 1.1, -10);
    kaelMesh.castShadow = true;
    this.group.add(kaelMesh);

    // Register interaction via interaction system
    if (this.interactionSystem) {
      this.interactionSystem.register({
        id: 'npc_kael',
        position: kaelMesh.position.clone(),
        radius: 3.5,
        prompt: 'Talk to Engineer Kael [E]',
        onInteract: () => {
          this.dialogueSystem?.startDialogue('npc_survivor_intro');
        }
      });
    }
  }

  public update(_delta: number): void {}

  public destroy(): void {
    this.group.clear();
  }
}
