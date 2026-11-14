import { GameEvents, IEventBus } from '../types';

type EventHandler<T = any> = (payload: T) => void;

export class EventBus implements IEventBus {
  private static instance: EventBus;
  private listeners: Map<keyof GameEvents, Set<EventHandler>> = new Map();

  private constructor() {}

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public on<K extends keyof GameEvents>(event: K, handler: (payload: GameEvents[K]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler as EventHandler);
  }

  public off<K extends keyof GameEvents>(event: K, handler: (payload: GameEvents[K]) => void): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.delete(handler as EventHandler);
    }
  }

  public emit<K extends keyof GameEvents>(event: K, payload: GameEvents[K]): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(payload);
        } catch (err) {
          console.error(`[EventBus] Error in handler for event: ${String(event)}`, err);
        }
      });
    }
  }

  public clear(): void {
    this.listeners.clear();
  }
}
