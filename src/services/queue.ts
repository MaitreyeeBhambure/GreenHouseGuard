import { upload } from "./uploadService";
import { retryQueueItem } from "./websocket";

let queue: any[] = [];

export const addToQueue = (item: any) => {
  queue.push(item);
};

export const processQueue = async () => {
  while (queue.length) {
    const item = queue[0]; // peek

    try {
      await upload(item);
      queue.shift(); // remove only if success
    } catch (error) {
      await retryQueueItem(item);          // reinsert with attempts
      console.log("Retry later...");
      break; // stop processing on failure
    }
  }
};


export type QueueItem = {
  id: number;
  seq?: number;
  [key: string]: any;
};

/**
 * Generic in-memory FIFO Queue with deduplication + batch support
 */
export class Queue {
  private items: QueueItem[] = [];
  private seenIds: Set<number> = new Set();

  /**
   * Add single item with deduplication
   */
  add(item: QueueItem): void {
    if (this.seenIds.has(item.id)) return;

    this.items.push(item);
    this.seenIds.add(item.id);
  }

  /**
   * Add batch of items (optimized for burst load)
   */
  addBatch(items: QueueItem[]): void {
    for (const item of items) {
      this.add(item);
    }
  }

  /**
   * FIFO remove
   */
  shift(): QueueItem | undefined {
    const item = this.items.shift();
    if (item) {
      // optional: keep seenIds (since dedup is global lifetime)
    }
    return item;
  }

  /**
   * Current size of queue
   */
  size(): number {
    return this.items.length;
  }

  /**
   * Peek first element without removing
   */
  peek(): QueueItem | undefined {
    return this.items[0];
  }
}

/**
 * OfflineQueue extends Queue with persistence-like behavior
 */
export default class OfflineQueue {
  private pending: QueueItem[] = [];

  /**
   * Add single event while offline
   */
  enqueue(item: QueueItem): void {
    this.pending.push(item);
  }

  /**
   * Add batch of events
   */
  enqueueBatch(items: QueueItem[]): void {
    this.pending.push(...items);
  }

  /**
   * Number of pending events
   */
  pendingSize(): number {
    return this.pending.length;
  }

  /**
   * Flush queue when back online
   * sendFn simulates API/WebSocket call
   */
  async flush(sendFn: (item: QueueItem) => Promise<any> | any): Promise<void> {
    const batch = [...this.pending];
    this.pending = [];

    for (const item of batch) {
      await sendFn(item);
    }
  }
}