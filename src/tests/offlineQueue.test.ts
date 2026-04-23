import OfflineQueue from "../services/queue";

describe("Offline Queue", () => {
  let queue: OfflineQueue;

  beforeEach(() => {
    queue = new OfflineQueue();
  });

  test("stores events while offline", () => {
    queue.enqueue({ id: 1 });
    queue.enqueue({ id: 2 });

    expect(queue.pendingSize()).toBe(2);
  });

  test("flushes queue when back online", async () => {
    queue.enqueue({ id: 1 });
    queue.enqueue({ id: 2 });

    const sendMock = jest.fn();

    await queue.flush(sendMock);

    expect(sendMock).toHaveBeenCalledTimes(2);
    expect(queue.pendingSize()).toBe(0);
  });

  test("batches events before upload", async () => {
    const sendMock = jest.fn();

    const events = Array.from({ length: 50 }, (_, i) => ({ id: i }));

    queue.enqueueBatch(events);
    await queue.flush(sendMock);

    expect(sendMock).toHaveBeenCalled();
  });
});