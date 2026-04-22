import React from 'react';
import { Text, View } from 'react-native';
import { useStore } from '../store/useStore';

export default function SensorTile({ type }: { type: string }) {
  const value = useStore((s: any) => s.sensors[type]);

  return (
    <View>
      <Text>{type.toUpperCase()}</Text>   //Temp / Humidity / CO2
      <Text>{value}</Text>
    </View>
  );
}