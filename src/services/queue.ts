import { upload } from "./uploadService";

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
      console.log("Retry later...");
      break; // stop processing on failure
    }
  }
};