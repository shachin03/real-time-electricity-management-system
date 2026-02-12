type StatCardProps = {
  label: string;
  value: string;
  unit?: string;
  trendLabel?: string;
  tone?: "default" | "positive" | "warning" | "danger";
};

const toneClasses: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "border-slate-800/80",
  positive: "border-emerald-500/40",
  warning: "border-amber-400/50",
  danger: "border-red-500/50"
};

export const StatCard = ({
  label,
  value,
  unit,
  trendLabel,
  tone = "default"
}: StatCardProps) => {
  return (
    <div
      className={`glass-panel p-4 sm:p-5 flex flex-col gap-2 border ${toneClasses[tone]}`}
    >
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <div className="flex items-baseline gap-1">
        <p className="text-xl sm:text-2xl font-semibold tracking-tight">
          {value}
        </p>
        {unit && (
          <span className="text-[11px] text-slate-400 font-medium">{unit}</span>
        )}
      </div>
      {trendLabel && (
        <p className="text-[11px] text-slate-500 line-clamp-2">
          {trendLabel}
        </p>
      )}
    </div>
  );
};

