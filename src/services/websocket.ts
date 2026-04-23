import { useStore } from '../store/useStore';
import { detectAnomaly } from "./anomaly";
import { insertReading, insertAnomaly } from "../database/db";

let ws: WebSocket;
let retry = 0;
// --- Reorder buffer (kept module-local) ---
let reorderBuffer: any[] = [];
let flushTimer: any = null;

const BUFFER_DELAY = 250; // 200–300ms as per requirement
const MAX_BUFFER_SIZE = 200; // safety cap

// --- Optional: track simple debug counters ---
let duplicateCount = 0;
let gapCount = 0;

export const connectWS = () => {
  const { setStatus, setSeq } = useStore.getState() as any;

  ws = new WebSocket('wss://localhost:8080');    //websocket is secure

  ws.onopen = () => {
    retry = 0;
    setStatus('LIVE');
  };

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
     handleMessage(msg);
  };

  ws.onclose = () => {
    setStatus('RECONNECTING');
    reconnect();
  };

  ws.onerror = () => {
    setStatus('OFFLINE');
  };
};

const reconnect = () => {
  retry++;
  setTimeout(connectWS, Math.min(1000 * 2 ** retry, 10000));
};

export const setWSInstance = (socket: WebSocket) => {
  ws = socket;
};

// --- Resync helper ---
const triggerResync = () => {
  console.warn("Resync requested (snapshot)...");
  try {
    // Ask server for a fresh snapshot
    ws?.send(JSON.stringify({ action: "GET_SNAPSHOT" }));
  } catch (e) {
    console.warn("Resync send failed:", e);
  }
};

// --- Basic schema validation (keep it fast) ---
const isValidMessage = (msg: any) => {
  if (!msg || typeof msg !== "object") return false;
  if (msg.type !== "SNAPSHOT" && msg.type !== "DELTA") return false;
  if (typeof msg.seq !== "number") return false;
  if (!msg.data) return false;

  const { temp, humidity, co2 } = msg.data;
  return (
    typeof temp === "number" &&
    typeof humidity === "number" &&
    typeof co2 === "number"
  );
};

// --- Apply a single, in-order message ---
const applyMessage = (m: any) => {
  const { setSeq, updateSensors, addEvent } = useStore.getState() as any;

  // Update store/UI
  updateSensors(m.data);
  setSeq(m.seq);

  // Persist reading (offline-first)
  insertReading(m.data);

  // Anomaly detection (example: CO2)
  const anomaly = detectAnomaly(m.data.co2);
  if (anomaly) {
    const event = {
      id: `${Date.now()}-${m.seq}`,
      reason: anomaly,
      timestamp: Date.now(),
    };

    addEvent(event);       // UI list
    insertAnomaly(event);  // local DB
  }
};


// --- Flush buffer in order ---
const flushBuffer = () => {
  const { lastSeq } = useStore.getState() as any;

  // Sort by sequence
  reorderBuffer.sort((a, b) => a.seq - b.seq);

  let progressed = false;
  let currentSeq = lastSeq;

  while (reorderBuffer.length) {
    const next = reorderBuffer[0];
    const expected = currentSeq + 1;

    if (next.seq === expected) {
      reorderBuffer.shift(); // FIFO remove
      applyMessage(next);
      progressed = true;
    } else {
      break; // wait for missing seq or more arrivals
    }
  }

  // If buffer is too big or we’re stuck → resync
  if (!progressed && reorderBuffer.length > 0) {
    const head = reorderBuffer[0];
    const expected = lastSeq + 1;

    if (head.seq > expected) {
      gapCount++;
      console.warn("Gap persists after buffer window. Triggering resync.");
      reorderBuffer = [];
      triggerResync();
    }
  }

  // Clear timer
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
};

// --- Schedule a single flush (coalescing) ---
const scheduleFlush = () => {
  if (flushTimer) return;
  flushTimer = setTimeout(flushBuffer, BUFFER_DELAY);
};

// =======================================================
// 🚀 MAIN FUNCTION
// =======================================================

export const handleMessage = (raw: any) => {
  const { lastSeq, setSeq, updateSensors } = useStore.getState() as any;

  // 1) Parse safely if needed
  let msg = raw;
  try {
    if (typeof raw === "string") {
      msg = JSON.parse(raw);
    }
  } catch (e) {
    console.warn("Invalid JSON:", e);
    return;
  }

  // 2) Validate schema (security)
  if (!isValidMessage(msg)) {
    console.warn("Invalid message schema:", msg);
    return;
  }

  // 3) SNAPSHOT: replace state
  if (msg.type === "SNAPSHOT") {
    reorderBuffer = []; // clear any pending
    if (flushTimer) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }

    updateSensors(msg.data);
    setSeq(msg.seq);

    // Persist snapshot as a reading as well (optional but useful)
    insertReading(msg.data);

    return;
  }

  // 4) DELTA handling

  // a) Duplicate / old → ignore (idempotency)
  if (msg.seq <= lastSeq) {
    duplicateCount++;
    return;
  }

  // b) Gap detected → try buffering first
  const expected = lastSeq + 1;

  if (msg.seq > expected) {
    // Add to buffer and wait briefly for missing messages
    if (reorderBuffer.length >= MAX_BUFFER_SIZE) {
      console.warn("Buffer overflow. Forcing resync.");
      reorderBuffer = [];
      triggerResync();
      return;
    }

    reorderBuffer.push(msg);
    scheduleFlush();
    return;
  }

  // c) In-order message → apply immediately
  applyMessage(msg);

  // d) After applying, there might be buffered messages that now fit
  if (reorderBuffer.length) {
    scheduleFlush();
  }
};