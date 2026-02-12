import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine
} from "recharts";
import { ElectricitySample } from "../../types/electricity";

type LivePowerChartProps = {
  samples: ElectricitySample[];
  thresholdW?: number;
  isAboveThreshold?: boolean;
};

export const LivePowerChart = ({
  samples,
  thresholdW,
  isAboveThreshold
}: LivePowerChartProps) => {
  const data = samples.map((s) => ({
    time: new Date(s.timestamp).toLocaleTimeString(undefined, {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }),
    power: s.power
  }));

  return (
    <div className="glass-panel p-4 sm:p-5 h-72 sm:h-80 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="section-title">Live consumption</p>
          <p className="text-xs text-slate-400">
            Real-time power usage stream from ESP32
          </p>
        </div>
        {thresholdW && (
          <div className="pill text-[10px] flex items-center gap-1 border-amber-400/60 bg-amber-500/5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Threshold {thresholdW.toFixed(0)} W
          </div>
        )}
      </div>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={isAboveThreshold ? "#f97373" : "#22c55e"}
                  stopOpacity={0.9}
                />
                <stop
                  offset="100%"
                  stopColor={isAboveThreshold ? "#b91c1c" : "#0f172a"}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e293b"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              tickMargin={6}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              tickMargin={4}
              width={40}
              tickFormatter={(v) => `${v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#020617",
                borderRadius: 12,
                border: "1px solid #1f2937",
                fontSize: 11
              }}
              labelStyle={{ color: "#9ca3af" }}
              formatter={(value) => [`${value} W`, "Power"]}
            />
            <Area
              type="monotone"
              dataKey="power"
              stroke={isAboveThreshold ? "#f97373" : "#22c55e"}
              strokeWidth={2}
              fill="url(#powerGradient)"
              isAnimationActive
            />
            {thresholdW && (
              <ReferenceLine
                y={thresholdW}
                stroke="#f97316"
                strokeDasharray="4 4"
                strokeWidth={1}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

