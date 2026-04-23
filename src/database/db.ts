// @ts-ignore
import SQLite from "react-native-sqlite-storage";

const db = SQLite.openDatabase({ name: "greenhouse.db" });

export const initDB = () => {
  db.transaction((tx:any) => {
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS readings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        temp REAL,
        humidity REAL,
        co2 REAL,
        timestamp INTEGER
      );
    `);

    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS anomalies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reason TEXT,
        timestamp INTEGER
      );
    `);

    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT,
        payload TEXT
      );
    `);
  });
};

export const insertReading = (data: { temp: number; humidity: number; co2: number }) => {
  db.transaction((tx: any) => {
    tx.executeSql(
      'INSERT INTO readings (temp, humidity, co2) VALUES (?, ?, ?)',
      [data.temp, data.humidity, data.co2]
    );
  });
};

export const insertAnomaly = (event: { reason: string; timestamp: number }) => {
  db.transaction((tx: any) => {
    tx.executeSql(
      "INSERT INTO anomalies (reason, timestamp) VALUES (?, ?)",
      [event.reason, event.timestamp]
    );
  });
};

export const insertQueue = (
  type: string,
  payload: any
): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: any) => {
      tx.executeSql(
        `INSERT INTO queue (type, payload, createdAt, attempts)
         VALUES (?, ?, ?, ?)`,
        [
          type,
          JSON.stringify(payload), // store as string
          Date.now(),
          0, // initial attempts
        ],
      );
    });
  });
};