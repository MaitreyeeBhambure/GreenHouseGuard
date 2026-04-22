import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useStore } from "../store/useStore";

const EventList = () => {
  const events = useStore((state: any) => state.events);

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <Text style={styles.reason}>{item.reason}</Text>
      <Text style={styles.meta}>
        {new Date(item.timestamp).toLocaleTimeString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>⚠️ Anomalies</Text>

      <FlatList
        data={events}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id ?? index.toString()}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    color: "#fff",
  },
  card: {
    backgroundColor: "#1e293b",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  reason: {
    color: "#fbbf24",
    fontWeight: "600",
  },
  meta: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 4,
  },
});

export default EventList;