import { useEffect, useState } from "react";
import { RealtimeElectricityService } from "../services/realtimeElectricityService";
import { ElectricityInsights, ElectricitySample } from "../types/electricity";

const service = new RealtimeElectricityService();

const MAX_POINTS = 60; // keep last ~2 minutes (60 x 2s)

export function useRealtimeElectricity() {
  const [samples, setSamples] = useState<ElectricitySample[]>([]);

  useEffect(() => {
    const unsubscribe = service.subscribe((sample) => {
      setSamples((prev) => {
        const next = [...prev, sample];
        if (next.length > MAX_POINTS) {
          next.shift();
        }
        return next;
      });
    });

    return unsubscribe;
  }, []);

  const latest = samples[samples.length - 1];

  const insights: ElectricityInsights = computeInsights(samples);
  const hourlyBreakdown = computeHourly(samples);
  const distribution = computeDistribution(samples);

  return {
    samples,
    latest,
    insights,
    hourlyBreakdown,
    distribution
  };
}

function computeInsights(samples: ElectricitySample[]): ElectricityInsights {
  if (samples.length === 0) {
    return {
      peakPowerW: 0,
      peakPowerTime: undefined,
      averagePowerW: 0,
      estimatedMonthlyKwh: 0
    };
  }

  let peak = samples[0];
  let sumPower = 0;

  for (const s of samples) {
    if (s.power > peak.power) peak = s;
    sumPower += s.power;
  }

  const latest = samples[samples.length - 1];
  const averagePowerW = sumPower / samples.length;

  // Simple projection: assume today's energy so far x 30 days
  const estimatedMonthlyKwh = (latest.energyKwh || 0) * 30;

  return {
    peakPowerW: peak.power,
    peakPowerTime: new Date(peak.timestamp),
    averagePowerW: +averagePowerW.toFixed(1),
    estimatedMonthlyKwh: +estimatedMonthlyKwh.toFixed(1)
  };
}

function computeHourly(samples: ElectricitySample[]) {
  // Group by simulated hour bucket from timestamp
  const buckets = new Map<string, { label: string; energyKwh: number }>();

  for (const s of samples) {
    const d = new Date(s.timestamp);
    const hour = d.getHours();
    const label = `${hour.toString().padStart(2, "0")}:00`;

    const bucket = buckets.get(label) ?? { label, energyKwh: 0 };
    bucket.energyKwh = s.energyKwh; // approximate with last cumulative value seen in that hour
    buckets.set(label, bucket);
  }

  return Array.from(buckets.values()).sort((a, b) =>
    a.label.localeCompare(b.label)
  );
}

function computeDistribution(samples: ElectricitySample[]) {
  const latest = samples[samples.length - 1];
  if (!latest) {
    return [
      { name: "Base load", value: 1 },
      { name: "Dynamic load", value: 1 },
      { name: "Spikes", value: 1 }
    ];
  }

  // Heuristic split: base vs dynamic vs spikes using power variation
  const base = Math.max(0, latest.power - 150);
  const dynamic = Math.max(0, latest.power * 0.3);
  const spikes = Math.max(0, latest.power - base - dynamic);

  return [
    { name: "Base load", value: +base.toFixed(0) },
    { name: "Dynamic load", value: +dynamic.toFixed(0) },
    { name: "Spikes", value: +spikes.toFixed(0) }
  ];
}

