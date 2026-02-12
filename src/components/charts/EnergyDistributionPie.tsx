import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from "recharts";

type EnergyDistributionPieProps = {
  data: { name: string; value: number }[];
};

const COLORS = ["#22c55e", "#38bdf8", "#eab308"];

export const EnergyDistributionPie = ({
  data
}: EnergyDistributionPieProps) => {
  return (
    <div className="glass-panel p-4 sm:p-5 h-64 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="section-title">Load distribution</p>
          <p className="text-xs text-slate-400">
            Estimated breakdown of where energy is going
          </p>
        </div>
      </div>
      <div className="flex-1 flex items-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={70}
              innerRadius={35}
              paddingAngle={3}
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={COLORS[index % COLORS.length]}
                  stroke="#020617"
                  strokeWidth={1}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#020617",
                borderRadius: 12,
                border: "1px solid #1f2937",
                fontSize: 11
              }}
              labelStyle={{ color: "#9ca3af" }}
              formatter={(value, _name, entry: any) => [
                `${value} W`,
                entry?.payload?.name ?? "Segment"
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-2 mt-1">
        {data.map((d, i) => (
          <div
            key={d.name}
            className="inline-flex items-center gap-1.5 text-[11px] text-slate-400"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span>{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

