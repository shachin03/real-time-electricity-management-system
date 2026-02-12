// Shared types for electricity telemetry and insights

export type ElectricitySample = {
  /** Unix timestamp (ms) when the sample was captured */
  timestamp: number;
  /** Line voltage in volts (V) */
  voltage: number;
  /** Load current in amperes (A) */
  current: number;
  /** Instantaneous real power in watts (W) */
  power: number;
  /** Cumulative energy consumed today in kilowatt-hours (kWh) */
  energyKwh: number;
};

export type ElectricityInsights = {
  peakPowerW: number;
  peakPowerTime?: Date;
  averagePowerW: number;
  estimatedMonthlyKwh: number;
};

