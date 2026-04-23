import { Queue } from "../services/queue";

describe("Queue Service", () => {
  let queue: Queue;

  beforeEach(() => {
    queue = new Queue();
  });

  test("handles burst load efficiently", () => {
    const events = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      seq: i,
    }));

    queue.addBatch(events);

    expect(queue.size()).toBe(1000);
  });

  test("removes duplicates based on id", () => {
    queue.add({ id: 1, seq: 1 });
    queue.add({ id: 1, seq: 1 }); // duplicate

    expect(queue.size()).toBe(1);
  });

  test("processes FIFO order correctly", () => {
    queue.add({ id: 1, seq: 1 });
    queue.add({ id: 2, seq: 2 });

    const first = queue.shift()!;
    const second = queue.shift()!;

    expect(first.id).toBe(1);
    expect(second.id).toBe(2);
  });
});