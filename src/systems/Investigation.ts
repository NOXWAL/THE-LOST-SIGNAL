import { EvidenceItem, ISystem, GameContext } from '../types';
import { EventBus } from '../core/EventBus';

export const CASE_EVIDENCES: EvidenceItem[] = [
  {
    id: 'clue_evelyn_ledger',
    title: 'Dr. Evelyn Vance\'s Personal Journal',
    category: 'document',
    description: 'Found inside the secret desk compartment in the Westside Safehouse Apartment.',
    locationFound: 'Residential District (Safehouse)',
    dateFound: 'November 14, 2026',
    content: `
      "PROJECT CHRONO-SIGNAL - DAY 412:
      The council denied our findings, but the resonance harmonics don't lie. 
      The anomalies aren't seismic tremors—they are directed transmissions. 
      I moved our telemetry logs to the Abandoned Office in the Industrial Zone. 
      If anyone finds this: Marcus knows the cipher. Don't trust Director Hall."
    `,
    unlocked: false
  },
  {
    id: 'clue_office_blueprints',
    title: 'Subterranean Facility Schematic',
    category: 'photograph',
    description: 'Recovered from the secure safe inside the ChronoTech industrial office.',
    locationFound: 'Industrial Zone (ChronoTech Office)',
    dateFound: 'November 14, 2026',
    content: `
      [DECLASSIFIED BLUEPRINT - LEVEL 4 ACCESS ONLY]
      Facility Designation: SITE-ZERO (Underground)
      Access Point: Industrial Canal Storm Drainage Hatch
      Warning: High electromagnetic distortion at Depth -35m.
      Required Passkey: Delta-7 Bypass Matrix
    `,
    unlocked: false
  },
  {
    id: 'clue_audio_marcus',
    title: 'Audio Tape: Marcus\'s Intercepted Log',
    category: 'audio_log',
    description: 'Recorded by Marcus before retreating into the Northwood Forest.',
    locationFound: 'Forest Outskirts (Marcus\'s Cabin)',
    dateFound: 'November 14, 2026',
    content: `
      [TRANSCRIPT OF AUDIO LOG #08]:
      "Evelyn didn't vanish—she stepped inside the core chamber during the pulse event. 
      The core didn't destroy her; it trapped her frequency inside the signal loop. 
      If you can realign the three resonance pillars beneath the city, the loop can be stabilized. 
      Here is the bunker bypass key... please, bring her back."
    `,
    unlocked: false
  },
  {
    id: 'clue_core_telemetry',
    title: 'Core Telemetry & The Final Truth',
    category: 'document',
    description: 'Downloaded directly from the Site-Zero mainframe terminal.',
    locationFound: 'Underground Facility (Site-Zero)',
    dateFound: 'November 14, 2026',
    content: `
      [SITE-ZERO ANOMALY TELEMETRY]:
      Resonance frequency locked at 142.8 MHz.
      Subject Status: Quantum Echo Detected.
      Transmissions are automated reflections of Dr. Vance's distress beacon echoing across time.
      Manual override code: 1-4-2-8-ALPHA.
    `,
    unlocked: false
  }
];

export class Investigation implements ISystem {
  public name = 'Investigation';
  private clues: Map<string, EvidenceItem> = new Map();
  private eventBus = EventBus.getInstance();

  public init(_context: GameContext): void {
    CASE_EVIDENCES.forEach((c) => {
      this.clues.set(c.id, { ...c });
    });

    this.eventBus.on('INPUT_ACTION', (payload) => {
      if (payload.action === 'toggleJournal' && payload.value) {
        this.eventBus.emit('JOURNAL_TOGGLED', true);
      }
    });
  }

  public collectClue(clueId: string): EvidenceItem | undefined {
    const clue = this.clues.get(clueId);
    if (clue && !clue.unlocked) {
      clue.unlocked = true;
      this.eventBus.emit('EVIDENCE_COLLECTED', clue);
      this.eventBus.emit('NOTIFICATION', {
        title: 'EVIDENCE DISCOVERED',
        message: clue.title,
        type: 'story'
      });
      return clue;
    }
    return clue;
  }

  public getUnlockedClues(): EvidenceItem[] {
    return Array.from(this.clues.values()).filter((c) => c.unlocked);
  }

  public getAllClues(): EvidenceItem[] {
    return Array.from(this.clues.values());
  }

  public hasClue(id: string): boolean {
    return !!this.clues.get(id)?.unlocked;
  }

  public update(_delta: number): void {}

  public serialize(): any {
    return Array.from(this.clues.entries());
  }

  public deserialize(data: [string, EvidenceItem][]): void {
    this.clues = new Map(data);
  }
}
