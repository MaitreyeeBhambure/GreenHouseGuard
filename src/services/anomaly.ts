let window = [];

export const detectAnomaly = (value: number) => {
  window.push(value);
  if (window.length > 20) window.shift();

  const mean = window.reduce((a, b) => a + b) / window.length;
  const std = Math.sqrt(
    window.reduce((a, b) => a + (b - mean) ** 2, 0) / window.length
  );

  const z = (value - mean) / std;

  if (Math.abs(z) > 3) {
    return `Anomaly detected z=${z.toFixed(2)}`;
  }
};