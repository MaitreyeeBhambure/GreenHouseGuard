import { useStore } from '../store/useStore';

let ws: WebSocket;
let retry = 0;

export const connectWS = () => {
  const { setStatus, setSeq } = useStore.getState() as any;

  ws = new WebSocket('wss://localhost:8080');    //websocket is secure

  ws.onopen = () => {
    retry = 0;
    setStatus('LIVE');
  };

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    // handleMessage(msg);
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