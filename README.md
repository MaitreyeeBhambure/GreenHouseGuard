# 🌱 Greenhouse Monitoring App

An **offline-first IoT monitoring system** for greenhouse environments built using **React Native**, enabling real-time sensor streaming, resilient offline buffering, anomaly detection, and local-first state management.

This project demonstrates **real-world distributed system design patterns on mobile**, including queue-based ingestion, WebSocket streaming, and fault-tolerant architecture.

---

## 🚀 Features

- ⚡ Real-time sensor streaming via WebSocket
- 📡 Offline-first queueing system for network failure handling
- 🔁 Burst-safe ingestion (supports 1000+ events/sec)
- 🧠 Intelligent deduplication of sensor events
- 🚨 Anomaly detection:
  - Temperature spikes 🌡️
  - Humidity imbalance 💧
  - CO₂ threshold violations 🌿
- 📦 Local state management using Zustand
- 🔄 Auto-resync when network reconnects
- 📊 Lightweight UI optimized for high-frequency updates


## 🧱 Project Flow
Sensors → WebSocket → App Queue → Store → UI
↓
Offline Queue
↓
Sync on reconnect
---

## 🛠️ Tech Stack

- **Frontend:** React Native (TypeScript)
- **State Management:** Zustand
- **Real-time Communication:** WebSocket
- **Storage:**
  - MMKV (fast key-value storage)
  - SQLite (structured offline persistence)
- **Network Monitoring:** NetInfo
- **UI Enhancements:** React Native Reanimated, SVG Charts

---

## 📦 Project Setup

### 1. Initialize Project

npx react-native init GreenHouseGuard --template react-native-template-typescript
cd GreenHouseGuard


### 2. Install Dependencies
npm install zustand
npm install react-native-mmkv
npm install react-native-sqlite-storage
npm install @react-native-community/netinfo
npm install react-native-reanimated react-native-svg


### 3. Run Application
npx react-native run-android


## 🧱 System Architecture
src/
 ├── components/
 │    ├── EventList.tsx
 │    ├── FabCapture.tsx
 │    ├── Header.tsx
 │    ├── SensorTile.tsx
 │    ├── SparkLine.tsx
 │
 ├── database/
 │    ├── db.ts
 │
 ├── hooks/
 │    ├── useNetwork.ts
 │
 ├── screens/
 │    ├── HomeScreen.tsx
 │
 ├── services/
 │    ├── anomaly.ts
 │    ├── queue.ts
 │    ├── uploadService.ts
 │    ├── websocket.ts
 │
 ├── store/
 │    ├── useStore.ts


--------------
## 📌 Key Design Decisions

### 1. WebSocket over HTTP
- Enables continuous streaming
- Reduces latency for sensor updates
- Supports anomaly push alerts

---

### 2. Queue-based buffering
- Prevents data loss during network drops
- Supports burst ingestion (1000+ events)
- Deduplication ensures data integrity

---

### 3. Zustand State Store
- Minimal boilerplate
- Fast reactivity for UI updates
- Avoids Redux complexity

---

### 4. In-memory + optional persistence
- Fast processing in memory
- Extendable to SQLite for durability

---

## 📌 Scaling Strategy (Future)

- Replace Queue → Redis Streams
- WebSocket → MQTT bridge
- Store → Cloud DB (DynamoDB / Postgres)
- Add event replay system
