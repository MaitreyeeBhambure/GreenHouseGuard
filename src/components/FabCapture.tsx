import { launchCamera } from 'react-native-image-picker';
import { addToQueue } from '../services/queue';

export const capturePhoto = async () => {
  const result = await launchCamera({ mediaType: 'photo' });

  if (result.assets) {
    addToQueue(result.assets[0]);
  }
};