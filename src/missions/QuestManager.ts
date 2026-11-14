import { Quest, ISystem, GameContext } from '../types';
import { INITIAL_MISSIONS } from './MissionData';
import { EventBus } from '../core/EventBus';

export class QuestManager implements ISystem {
  public name = 'QuestManager';
  private quests: Map<string, Quest> = new Map();
  private eventBus = EventBus.getInstance();

  public init(_context: GameContext): void {
    INITIAL_MISSIONS.forEach((q) => {
      this.quests.set(q.id, JSON.parse(JSON.stringify(q)));
    });

    this.bindEvents();

    // Trigger initial active quest event
    const active = this.getActiveQuests()[0];
    if (active) {
      this.eventBus.emit('QUEST_STARTED', { questId: active.id });
    }
  }

  private bindEvents(): void {
    // React to player movement near objectives
    this.eventBus.on('PLAYER_MOVED', (payload) => {
      const dist = Math.hypot(payload.position.x - (-30), payload.position.z - (-40));
      if (dist < 8) {
        this.advanceObjective('quest_first_transmission', 'reach_beacon_alpha', 1);
      }
    });

    // React to item collection
    this.eventBus.on('ITEM_COLLECTED', (payload) => {
      if (payload.item.id === 'ion_cell') {
        this.advanceObjective('quest_broken_repeater', 'collect_power_cells', payload.quantity);
      }
    });
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
      this.eventBus.emit('QUEST_COMPLETED', { questId: quest.id });

      // Grant rewards
      if (quest.rewards?.items) {
        quest.rewards.items.forEach((item) => {
          this.eventBus.emit('ITEM_COLLECTED', { item, quantity: item.quantity });
        });
      }
    }
  }

  public getActiveQuests(): Quest[] {
    return Array.from(this.quests.values()).filter((q) => q.status === 'active');
  }

  public getQuest(id: string): Quest | undefined {
    return this.quests.get(id);
  }

  public update(_delta: number): void {}

  public serialize(): any {
    return Array.from(this.quests.entries());
  }

  public deserialize(data: [string, Quest][]): void {
    this.quests = new Map(data);
  }
}
