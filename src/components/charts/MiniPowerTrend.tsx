import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis
} from "recharts";
import { ElectricitySample } from "../../types/electricity";

type MiniPowerTrendProps = {
  samples: ElectricitySample[];
  isAboveThreshold: boolean;
};

export const MiniPowerTrend = ({
  samples,
  isAboveThreshold
}: MiniPowerTrendProps) => {
  const data = samples.map((s) => ({
    time: new Date(s.timestamp).toLocaleTimeString(undefined, {
      hour12: false,
      minute: "2-digit",
      second: "2-digit"
    }),
    power: s.power
  }));

  return (
    <div className="glass-panel mt-4 px-3 py-2.5 border border-slate-800/80">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[11px] text-slate-400 font-medium">
          Last few minutes · Power trend
        </p>
      </div>
      <div className="h-20">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="miniPowerGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={isAboveThreshold ? "#f97373" : "#22c55e"}
                  stopOpacity={0.9}
                />
                <stop
                  offset="100%"
                  stopColor="#020617"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              hide
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#020617",
                borderRadius: 10,
                border: "1px solid #1f2937",
                fontSize: 10
              }}
              labelStyle={{ color: "#9ca3af" }}
              formatter={(value) => [`${value} W`, "Power"]}
            />
            <Area
              type="monotone"
              dataKey="power"
              stroke={isAboveThreshold ? "#f97373" : "#22c55e"}
              strokeWidth={1.5}
              fill="url(#miniPowerGradient)"
              isAnimationActive
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

