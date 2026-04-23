import { detectAnomaly } from "../services/anomaly";

describe("Anomaly Detection", () => {
  test("detects CO2 spike using z-score", () => {
    const data = 1500; // spike

    const result = detectAnomaly(data);

    expect(result).toBe("anomaly");
  });

  test("does not flag normal readings", () => {
    const data = 415;

    const result = detectAnomaly(data);

    expect(result).toBe("normal");
  });
});