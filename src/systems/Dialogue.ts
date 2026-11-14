import { DialogueNode, ISystem, GameContext } from '../types';
import { EventBus } from '../core/EventBus';

export class Dialogue implements ISystem {
  public name = 'Dialogue';
  private eventBus = EventBus.getInstance();
  private currentNode: DialogueNode | null = null;
  private dialogueDatabase: Map<string, DialogueNode> = new Map();

  public init(_context: GameContext): void {
    this.registerSampleDialogues();

    this.eventBus.on('DIALOGUE_SELECT_OPTION', (payload) => {
      if (payload.action) {
        this.handleAction(payload.action);
      }
      if (payload.nextId && this.dialogueDatabase.has(payload.nextId)) {
        this.currentNode = this.dialogueDatabase.get(payload.nextId)!;
        this.eventBus.emit('DIALOGUE_START', this.currentNode);
      } else {
        this.endDialogue();
      }
    });
  }

  private registerSampleDialogues(): void {
    const nodes: DialogueNode[] = [
      {
        id: 'npc_survivor_intro',
        speaker: 'Engineer Kael',
        text: 'You picked up the distress broadcast too? The communication array was severed during the surge.',
        options: [
          {
            text: 'Can the signal be tracked?',
            nextId: 'npc_survivor_tracking'
          },
          {
            text: 'I will look into it.',
            action: 'close'
          }
        ]
      },
      {
        id: 'npc_survivor_tracking',
        speaker: 'Engineer Kael',
        text: 'Head to Beacon Alpha in Sector 4. Align your receiver with the frequency pulse. Watch the interference meter!',
        options: [
          {
            text: 'Understood. On my way.',
            action: 'close'
          }
        ]
      }
    ];

    nodes.forEach((n) => this.dialogueDatabase.set(n.id, n));
  }

  public startDialogue(nodeId: string): void {
    const node = this.dialogueDatabase.get(nodeId);
    if (node) {
      this.currentNode = node;
      this.eventBus.emit('DIALOGUE_START', node);
    }
  }

  private handleAction(action: string): void {
    if (action === 'close') {
      this.endDialogue();
    }
  }

  public endDialogue(): void {
    this.currentNode = null;
    this.eventBus.emit('DIALOGUE_END', undefined);
  }

  public update(_delta: number): void {}
}
