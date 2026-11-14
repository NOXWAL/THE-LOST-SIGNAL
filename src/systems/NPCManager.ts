import * as THREE from 'three';
import { ISystem, GameContext } from '../types';
import { Interaction } from './Interaction';
import { Dialogue } from './Dialogue';
import { EventBus } from '../core/EventBus';

export interface NPCData {
  id: string;
  name: string;
  position: THREE.Vector3;
  dialogueId: string;
  mesh: THREE.Group;
  prompt: string;
}

export class NPCManager implements ISystem {
  public name = 'NPCManager';
  private group = new THREE.Group();
  private npcs: NPCData[] = [];
  private interactionSystem!: Interaction;
  private dialogueSystem!: Dialogue;
  private eventBus = EventBus.getInstance();
  private playerPos = new THREE.Vector3();

  public setDependencies(interaction: Interaction, dialogue: Dialogue): void {
    this.interactionSystem = interaction;
    this.dialogueSystem = dialogue;
  }

  public init(context: GameContext): void {
    context.scene.add(this.group);
    this.createStoryNPCs();

    this.eventBus.on('PLAYER_MOVED', (payload) => {
      this.playerPos.copy(payload.position);
    });
  }

  private createHumanoidMesh(colorCoat: number, colorPants: number, height = 1.8): THREE.Group {
    const character = new THREE.Group();

    // Torso / Coat
    const torsoGeom = new THREE.BoxGeometry(0.7, 0.8, 0.4);
    const coatMat = new THREE.MeshStandardMaterial({ color: colorCoat, roughness: 0.6 });
    const torso = new THREE.Mesh(torsoGeom, coatMat);
    torso.position.y = 1.1;
    torso.castShadow = true;
    character.add(torso);

    // Head
    const headGeom = new THREE.SphereGeometry(0.22, 16, 16);
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.8 });
    const head = new THREE.Mesh(headGeom, skinMat);
    head.position.y = 1.7;
    head.castShadow = true;
    character.add(head);

    // Legs
    const legGeom = new THREE.BoxGeometry(0.25, 0.9, 0.3);
    const pantsMat = new THREE.MeshStandardMaterial({ color: colorPants, roughness: 0.7 });
    const legL = new THREE.Mesh(legGeom, pantsMat);
    legL.position.set(-0.18, 0.45, 0);
    character.add(legL);

    const legR = new THREE.Mesh(legGeom, pantsMat);
    legR.position.set(0.18, 0.45, 0);
    character.add(legR);

    return character;
  }

  private createStoryNPCs(): void {
    // 1. Elena Ray (Westside Residential)
    const elenaMesh = this.createHumanoidMesh(0x0284c7, 0x1e293b);
    elenaMesh.position.set(-70, 0, 160);
    this.group.add(elenaMesh);

    this.npcs.push({
      id: 'npc_elena',
      name: 'Elena Ray',
      position: elenaMesh.position.clone(),
      dialogueId: 'informant_intro',
      mesh: elenaMesh,
      prompt: 'Talk to Elena Ray [E]'
    });

    // 2. Marcus Kane (Forest Outskirts Cabin)
    const marcusMesh = this.createHumanoidMesh(0x78350f, 0x0f172a);
    marcusMesh.position.set(-180, 0, -174);
    this.group.add(marcusMesh);

    this.npcs.push({
      id: 'npc_marcus',
      name: 'Marcus Kane',
      position: marcusMesh.position.clone(),
      dialogueId: 'marcus_intro',
      mesh: marcusMesh,
      prompt: 'Talk to Marcus Kane [E]'
    });

    // 3. Site-Zero AI Hologram Terminal (Underground Facility)
    const terminalGroup = new THREE.Group();
    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 1.2, 1.4, 8),
      new THREE.MeshStandardMaterial({ color: 0x083344, metalness: 0.9 })
    );
    pedestal.position.y = 0.7;
    terminalGroup.add(pedestal);

    const holoScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 1.0),
      new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.85, side: THREE.DoubleSide })
    );
    holoScreen.position.y = 1.8;
    terminalGroup.add(holoScreen);

    terminalGroup.position.set(600, -35, 560);
    this.group.add(terminalGroup);

    this.npcs.push({
      id: 'npc_terminal',
      name: 'Site-Zero Terminal',
      position: terminalGroup.position.clone(),
      dialogueId: 'terminal_ai',
      mesh: terminalGroup,
      prompt: 'Access Site-Zero Terminal [E]'
    });

    // Register all in interaction system
    if (this.interactionSystem) {
      this.npcs.forEach((npc) => {
        this.interactionSystem.register({
          id: npc.id,
          position: npc.position.clone(),
          radius: 3.5,
          prompt: npc.prompt,
          onInteract: () => {
            this.dialogueSystem?.startDialogue(npc.dialogueId);
          }
        });
      });
    }
  }

  public update(delta: number): void {
    // Gentle idle breathing and look-at player rotation
    this.npcs.forEach((npc) => {
      const dist = npc.position.distanceTo(this.playerPos);
      if (dist < 18) {
        const lookTarget = new THREE.Vector3(this.playerPos.x, npc.position.y, this.playerPos.z);
        npc.mesh.lookAt(lookTarget);
      }
      npc.mesh.position.y += Math.sin(Date.now() * 0.003) * 0.0005;
    });
  }

  public destroy(): void {
    this.group.clear();
  }
}
