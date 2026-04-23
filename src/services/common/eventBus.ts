import { EventEmitter } from "events";

const globalForEventBus = global as unknown as { eventBus: EventEmitter };

export const eventBus =
  globalForEventBus.eventBus || new EventEmitter();

if (process.env.NODE_ENV !== "production") globalForEventBus.eventBus = eventBus;
