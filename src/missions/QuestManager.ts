import { Quest, ISystem, GameContext } from '../types';
import { MAIN_QUESTS } from './MissionData';
import { EventBus } from '../core/EventBus';

export class QuestManager implements ISystem {
  public name = 'QuestManager';
  private quests: Map<string, Quest> = new Map();
  private eventBus = EventBus.getInstance();
  private playerPos = { x: 0, y: 0, z: 0 };
  private xp = 0;
  private level = 1;

  public init(_context: GameContext): void {
    MAIN_QUESTS.forEach((q) => {
      this.quests.set(q.id, JSON.parse(JSON.stringify(q)));
    });

    this.bindEvents();

    const active = this.getActiveQuests()[0];
    if (active) {
      this.eventBus.emit('QUEST_STARTED', { questId: active.id });
    }
  }

  private bindEvents(): void {
    this.eventBus.on('PLAYER_MOVED', (payload) => {
      this.playerPos.x = payload.position.x;
      this.playerPos.y = payload.position.y;
      this.playerPos.z = payload.position.z;
      this.checkProximityObjectives();
    });

    this.eventBus.on('EVIDENCE_COLLECTED', (clue) => {
      if (clue.id === 'clue_evelyn_ledger') {
        this.advanceObjective('mission_01_arrival', 'obj_discover_message', 1);
      } else if (clue.id === 'clue_office_blueprints') {
        this.advanceObjective('mission_02_office', 'obj_collect_blueprints', 1);
      } else if (clue.id === 'clue_audio_marcus') {
        this.advanceObjective('mission_03_stranger', 'obj_talk_marcus', 1);
      } else if (clue.id === 'clue_core_telemetry') {
        this.advanceObjective('mission_04_beneath', 'obj_download_telemetry', 1);
      }
    });
  }

  private checkProximityObjectives(): void {
    const active = this.getActiveQuests()[0];
    if (!active) return;

    for (const obj of active.objectives) {
      if (!obj.completed && obj.location) {
        const dist = Math.hypot(this.playerPos.x - obj.location.x, this.playerPos.z - obj.location.z);
        const yDist = Math.abs(this.playerPos.y - obj.location.y);
        const radius = obj.location.radius || 10;

        // Reach location objective
        if (dist <= radius && yDist < 12) {
          if (obj.id.startsWith('obj_reach_') || obj.id === 'obj_enter_bunker') {
            this.advanceObjective(active.id, obj.id, 1);
          }
        }
      }
    }
  }

  public advanceObjective(questId: string, objectiveId: string, amount = 1): void {
    const quest = this.quests.get(questId);
    if (!quest || quest.status !== 'active') return;

    const objective = quest.objectives.find((o) => o.id === objectiveId);
    if (!objective || objective.completed) return;

    objective.current = Math.min(objective.target, objective.current + amount);

    this.eventBus.emit('QUEST_UPDATED', {
      questId,
      objectiveId,
      progress: objective.current
    });

    if (objective.current >= objective.target) {
      objective.completed = true;
      this.checkQuestCompletion(quest);
    }
  }

  private checkQuestCompletion(quest: Quest): void {
    const allDone = quest.objectives.every((o) => o.completed);
    if (allDone) {
      quest.status = 'completed';
      this.addXP(quest.rewards.xp);

      this.eventBus.emit('QUEST_COMPLETED', { questId: quest.id, quest });
      this.eventBus.emit('NOTIFICATION', {
        title: `${quest.missionNumber} COMPLETED`,
        message: `${quest.title} (+${quest.rewards.xp} XP)`,
        type: 'success'
      });

      // Grant items
      if (quest.rewards.items) {
        quest.rewards.items.forEach((item) => {
          this.eventBus.emit('ITEM_COLLECTED', { item, quantity: item.quantity });
        });
      }

      // Unlock next main mission in sequence
      this.unlockNextMission(quest.id);
    }
  }

  private unlockNextMission(currentId: string): void {
    const sequence = [
      'mission_01_arrival',
      'mission_02_office',
      'mission_03_stranger',
      'mission_04_beneath',
      'mission_05_truth'
    ];
    const currentIndex = sequence.indexOf(currentId);
    if (currentIndex !== -1 && currentIndex + 1 < sequence.length) {
      const nextId = sequence[currentIndex + 1];
      const nextQuest = this.quests.get(nextId);
      if (nextQuest) {
        nextQuest.status = 'active';
        this.eventBus.emit('QUEST_STARTED', { questId: nextId });
        this.eventBus.emit('NOTIFICATION', {
          title: `NEW MISSION: ${nextQuest.missionNumber}`,
          message: nextQuest.title,
          type: 'story'
        });
      }
    } else if (currentId === 'mission_05_truth') {
      // Ending unlocked!
      this.eventBus.emit('GAME_STATE_CHANGED', 'VICTORY');
    }
  }

  public addXP(amount: number): void {
    this.xp += amount;
    const newLevel = Math.floor(this.xp / 1000) + 1;
    if (newLevel > this.level) {
      this.level = newLevel;
      this.eventBus.emit('NOTIFICATION', {
        title: 'INVESTIGATOR RANK UP',
        message: `Rank ${this.level} Reached`,
        type: 'info'
      });
    }
  }

  public getActiveQuests(): Quest[] {
    return Array.from(this.quests.values()).filter((q) => q.status === 'active');
  }

  public getAllQuests(): Quest[] {
    return Array.from(this.quests.values());
  }

  public getQuest(id: string): Quest | undefined {
    return this.quests.get(id);
  }

  public getXP(): number {
    return this.xp;
  }

  public getLevel(): number {
    return this.level;
  }

  public update(_delta: number): void {}

  public serialize(): any {
    return {
      xp: this.xp,
      level: this.level,
      quests: Array.from(this.quests.entries())
    };
  }

  public deserialize(data: any): void {
    if (data.xp !== undefined) this.xp = data.xp;
    if (data.level !== undefined) this.level = data.level;
    if (data.quests) this.quests = new Map(data.quests);
  }
}
