import { DialogueNode, ISystem, GameContext, DialogueChoice } from '../types';
import { EventBus } from '../core/EventBus';

export const GAME_DIALOGUES: Record<string, DialogueNode> = {
  // Safehouse Landlady / Informant
  informant_intro: {
    id: 'informant_intro',
    speaker: 'Elena Ray',
    speakerTitle: 'Westside Local Informant',
    text: 'You\'re the one investigating Dr. Vance\'s disappearance? Be careful. The police closed that case in forty-eight hours. Her safehouse is just up the steps—check her desk for the hidden compartment.',
    options: [
      { text: 'Where did Dr. Vance work before she vanished?', nextId: 'informant_work' },
      { text: 'Did anyone visit her apartment recently?', nextId: 'informant_visitors' },
      { text: 'Thank you. I\'ll check the apartment now.', action: 'close' }
    ]
  },
  informant_work: {
    id: 'informant_work',
    speaker: 'Elena Ray',
    speakerTitle: 'Westside Local Informant',
    text: 'ChronoTech. They owned the massive freight compound in the Industrial Zone. After the accident five years ago, they claimed it was abandoned, but armed convoys still head out there at night.',
    options: [
      { text: 'I need to check that industrial compound.', action: 'close' }
    ]
  },
  informant_visitors: {
    id: 'informant_visitors',
    speaker: 'Elena Ray',
    speakerTitle: 'Westside Local Informant',
    text: 'Only a bearded man in a heavy coat—Marcus, her research partner. He fled into the Northwood Forest weeks ago. Kept mumbling about \'the signal that never sleeps\'.',
    options: [
      { text: 'I will find Marcus if the trail leads there.', action: 'close' }
    ]
  },

  // Marcus in Forest Cabin (Mission 03)
  marcus_intro: {
    id: 'marcus_intro',
    speaker: 'Marcus Kane',
    speakerTitle: 'Former Lead Engineer, ChronoTech',
    text: 'Step back! Who sent you? Was it the council? ...Wait. You hold Evelyn\'s journal in your hands. How did you get that?',
    options: [
      { text: 'I\'m investigating her disappearance. What happened to her, Marcus?', nextId: 'marcus_truth' },
      { text: 'Tell me about the signal. Is she still alive?', nextId: 'marcus_signal' }
    ]
  },
  marcus_truth: {
    id: 'marcus_truth',
    speaker: 'Marcus Kane',
    speakerTitle: 'Former Lead Engineer, ChronoTech',
    text: 'Five years ago, we tapped an anomalous radio frequency. Evelyn realized it wasn\'t natural—it was an echo loop. When the core destabilized, she stepped into the containment chamber to prevent the city from burning. The pulse pulled her inside.',
    options: [
      { text: 'How do I reach the core to bring her back?', nextId: 'marcus_passkey' }
    ]
  },
  marcus_signal: {
    id: 'marcus_signal',
    speaker: 'Marcus Kane',
    speakerTitle: 'Former Lead Engineer, ChronoTech',
    text: 'The signal... 142.8 MHz. It\'s her distress ping! Every thunderstorm amplifies it. She\'s trapped between milliseconds in the resonance core beneath the city!',
    options: [
      { text: 'Where is the entrance to the facility?', nextId: 'marcus_passkey' }
    ]
  },
  marcus_passkey: {
    id: 'marcus_passkey',
    speaker: 'Marcus Kane',
    speakerTitle: 'Former Lead Engineer, ChronoTech',
    text: 'In the industrial storm canal (180, -120), there\'s a submerged blast hatch. Here is my bypass matrix chip. Once inside Site-Zero, align the three frequency pillars to stabilize the loop. Don\'t let her sacrifice be in vain.',
    options: [
      { text: 'I won\'t fail. (Acquire Bunker Passkey)', action: 'reward_marcus_clue' }
    ]
  },

  // Underground Facility Mainframe AI (Mission 04 & 05)
  terminal_ai: {
    id: 'terminal_ai',
    speaker: 'SITE-ZERO CORE A.I.',
    speakerTitle: 'Sub-Resonance Operating System',
    text: 'BIOMETRIC SIGNATURE VERIFIED: GUEST INVESTIGATOR. 142.8 MHz Quantum Echo detected in Central Chamber. Three harmonic resonance pillars require immediate synchronization.',
    options: [
      { text: 'Initiate core telemetry download.', action: 'download_telemetry' },
      { text: 'Authorize Resonance Stabilization sequence.', action: 'trigger_ending' },
      { text: 'Exit terminal.', action: 'close' }
    ]
  }
};

export class Dialogue implements ISystem {
  public name = 'Dialogue';
  private eventBus = EventBus.getInstance();
  private currentNode: DialogueNode | null = null;

  public init(_context: GameContext): void {
    this.eventBus.on('DIALOGUE_SELECT_OPTION', (choice: DialogueChoice) => {
      if (choice.action) {
        this.handleAction(choice.action);
      }

      if (choice.nextId && GAME_DIALOGUES[choice.nextId]) {
        this.currentNode = GAME_DIALOGUES[choice.nextId];
        this.eventBus.emit('DIALOGUE_START', this.currentNode);
      } else {
        this.endDialogue();
      }
    });
  }

  public startDialogue(nodeId: string): void {
    const node = GAME_DIALOGUES[nodeId];
    if (node) {
      this.currentNode = node;
      this.eventBus.emit('DIALOGUE_START', node);
    }
  }

  private handleAction(action: string): void {
    if (action === 'reward_marcus_clue') {
      this.eventBus.emit('INPUT_ACTION', { action: 'rewardMarcus', value: true });
      this.endDialogue();
    } else if (action === 'download_telemetry') {
      this.eventBus.emit('INPUT_ACTION', { action: 'downloadTelemetry', value: true });
      this.endDialogue();
    } else if (action === 'trigger_ending') {
      this.eventBus.emit('INPUT_ACTION', { action: 'triggerEnding', value: true });
      this.endDialogue();
    } else if (action === 'close') {
      this.endDialogue();
    }
  }

  public endDialogue(): void {
    this.currentNode = null;
    this.eventBus.emit('DIALOGUE_END', undefined);
  }

  public update(_delta: number): void {}
}
