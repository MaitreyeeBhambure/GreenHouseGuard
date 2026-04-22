import NetInfo from '@react-native-community/netinfo';

export const useNetwork = () => {
  NetInfo.addEventListener((state) => {
    console.log('Connected:', state.isConnected);
  });
};