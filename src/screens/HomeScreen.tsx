import React, { useEffect } from 'react';
import { View } from 'react-native';
import { connectWS } from '../services/websocket';
import Header from '../components/Header';
import SensorTile from '../components/SensorTile';
import EventList from '../components/EventList';

export default function HomeScreen() {
  useEffect(() => {
    connectWS();
  }, []);

  return (
    <View>
      <Header />
      <SensorTile type="temp" />
      <SensorTile type="humidity" />
      <SensorTile type="co2" />
      <EventList />
    </View>
  );
}