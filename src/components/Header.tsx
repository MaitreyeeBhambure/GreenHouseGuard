import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useStore } from "../store/useStore";

const getStatusColor = (status: string) => {
  switch (status) {
    case "LIVE":
      return "#2ecc71";
    case "RECONNECTING":
      return "#f39c12";
    default:
      return "#e74c3c";
  }
};

const Header = () => {
  const { status, sensors } = useStore() as { status: string; sensors: { temp?: number; humidity?: number; co2?: number } };

  const lastUpdated = new Date().toLocaleTimeString();

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>🌱 Greenhouse Monitor</Text>

      {/* Status Row */}
      <View style={styles.row}>
        <View
          style={[
            styles.statusPill,
            { backgroundColor: getStatusColor(status) },
          ]}
        >
          <Text style={styles.statusText}>{status}</Text>
        </View>

        <Text style={styles.timestamp}>Last: {lastUpdated}</Text>
      </View>

      {/* Summary */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          🌡 {sensors.temp?.toFixed(1)}°C | 💧 {sensors.humidity?.toFixed(0)}% | 🌫{" "}
          {sensors.co2?.toFixed(0)} ppm
        </Text>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: "#0f172a",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    alignItems: "center",
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  timestamp: {
    color: "#94a3b8",
    fontSize: 12,
  },
  summary: {
    marginTop: 10,
  },
  summaryText: {
    color: "#cbd5e1",
    fontSize: 13,
  },
});

export default Header;