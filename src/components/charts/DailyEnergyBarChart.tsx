import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

type DailyEnergyBarChartProps = {
  data: { label: string; energyKwh: number }[];
};

export const DailyEnergyBarChart = ({ data }: DailyEnergyBarChartProps) => {
  return (
    <div className="glass-panel p-4 sm:p-5 h-64 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="section-title">Daily profile</p>
          <p className="text-xs text-slate-400">
            Approximate energy consumed across the day
          </p>
        </div>
      </div>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e293b"
              vertical={false}
            />
            <XAxis
              dataKey="label"
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
              formatter={(value) => [`${value} kWh`, "Energy"]}
            />
            <Bar
              dataKey="energyKwh"
              radius={[8, 8, 0, 0]}
              fill="url(#energyBarGradient)"
            />
            <defs>
              <linearGradient id="energyBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#0f172a" stopOpacity={0} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

