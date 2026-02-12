import { ElectricitySample } from "../types/electricity";

export type RealtimeListener = (sample: ElectricitySample) => void;

/**
 * Lightweight mock realtime service.
 * In production this can be replaced with a WebSocket or Firebase listener
 * without changing the dashboard UI.
 */
export class RealtimeElectricityService {
  private intervalId: number | null = null;
  private listeners = new Set<RealtimeListener>();
  private lastSample: ElectricitySample | null = null;

  /** Start emitting samples roughly every 2 seconds. */
  start() {
    if (this.intervalId !== null) return;

    // Seed with a realistic baseline
    this.lastSample = this.lastSample ?? {
      timestamp: Date.now(),
      voltage: 230,
      current: 4,
      power: 920,
      energyKwh: 3.2
    };

    this.intervalId = window.setInterval(() => {
      const now = Date.now();
      const prev = this.lastSample!;

      // Simple random walk around the previous values to mimic real behaviour
      const voltage = clamp(prev.voltage + randInRange(-2, 2), 210, 245);
      const current = clamp(prev.current + randInRange(-0.3, 0.3), 0.3, 12);
      const power = Math.round(voltage * current * randInRange(0.92, 0.99)); // assume PF ~ 0.95

      // Convert power (W) over time delta to incremental kWh
      const deltaHours = (now - prev.timestamp) / (1000 * 60 * 60);
      const deltaKwh = (power / 1000) * deltaHours;
      const energyKwh = +(prev.energyKwh + deltaKwh).toFixed(3);

      const sample: ElectricitySample = {
        timestamp: now,
        voltage,
        current: +current.toFixed(2),
        power,
        energyKwh
      };

      this.lastSample = sample;
      this.listeners.forEach((cb) => cb(sample));
    }, 2000);
  }

  stop() {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  subscribe(listener: RealtimeListener) {
    this.listeners.add(listener);
    // Immediately push the last sample if available, so UI renders quickly
    if (this.lastSample) {
      listener(this.lastSample);
    } else {
      const now = Date.now();
      const initial: ElectricitySample = {
        timestamp: now,
        voltage: 230,
        current: 4,
        power: 920,
        energyKwh: 3.2
      };
      this.lastSample = initial;
      listener(initial);
    }
    this.start();

    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) {
        this.stop();
      }
    };
  }
}

function randInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

