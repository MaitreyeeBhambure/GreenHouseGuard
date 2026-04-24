const WebSocket = require('ws');

// Create WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

console.log('WebSocket server running on ws://localhost:8080');

wss.on('connection', (ws) => {
  console.log('Client connected');

  // 1. Send initial SNAPSHOT
  ws.send(JSON.stringify({
    type: "SNAPSHOT",
    seq: 0,
    data: {
      temp: 22,
      humidity: 50,
      co2: 400
    }
  }));

  let seq = 0;

  // 2. Send DELTA updates every second
  const interval = setInterval(() => {
    seq++;

    ws.send(JSON.stringify({
      type: "DELTA",
      seq,
      data: {
        temp: 20 + Math.random() * 5,
        humidity: 40 + Math.random() * 20,
        co2: 350 + Math.random() * 300
      }
    }));
  }, 1000);

  // 3. Cleanup on disconnect
  ws.on('close', () => {
    console.log('Client disconnected');
    clearInterval(interval);
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
  });
});