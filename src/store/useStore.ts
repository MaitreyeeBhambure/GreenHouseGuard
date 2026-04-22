import { create } from 'zustand';

export const useStore = create((set) => ({
  sensors: { temp: 0, humidity: 0, co2: 0 },
  events: [],
  status: 'OFFLINE',
  lastSeq: 0,
  reconnects: 0,

  updateSensors: (data: { temp: number; humidity: number; co2: number }) => set({ sensors: data }),
  addEvent: (event: any) =>
    set((state: any) => ({ events: [event, ...state.events].slice(0, 100) })),

  setStatus: (status: string) => set({ status }),   //Live,Reconnecting,Offline
  setSeq: (seq: number) => set({ lastSeq: seq }),
}));