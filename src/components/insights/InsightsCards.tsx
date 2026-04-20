import { ElectricityInsights } from "../../types/electricity";

type InsightsCardsProps = {
  insights: ElectricityInsights;
  nextHourPredictionKw?: number | null;
  predictionLoading?: boolean;
  predictionError?: string | null;
};

export const InsightsCards = ({
  insights,
  nextHourPredictionKw,
  predictionLoading,
  predictionError
}: InsightsCardsProps) => {
  const { peakPowerW, peakPowerTime, averagePowerW, estimatedMonthlyKwh } =
    insights;

  const peakLabel = peakPowerTime
    ? peakPowerTime.toLocaleTimeString(undefined, {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      })
    : "–";

  return (
    <div className="glass-panel p-4 sm:p-5 space-y-3 border border-slate-800/80">
      <div>
        <p className="section-title">Insights</p>
        <p className="text-xs text-slate-400">
          High-level patterns that help you optimise usage.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
        <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
          <p className="text-slate-400 mb-1.5">Peak usage time</p>
          <p className="text-sm font-semibold text-slate-100">{peakLabel}</p>
          <p className="text-slate-500 mt-0.5">
            Highest observed instantaneous power:{" "}
            <span className="font-semibold text-slate-200">
              {peakPowerW.toFixed(0)} W
            </span>
            .
          </p>
        </div>
        <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
          <p className="text-slate-400 mb-1.5">Average consumption</p>
          <p className="text-sm font-semibold text-slate-100">
            {averagePowerW.toFixed(1)} W
          </p>
          <p className="text-slate-500 mt-0.5">
            Based on the last few minutes of live data.
          </p>
        </div>
        <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
          <p className="text-slate-400 mb-1.5">Estimated monthly usage</p>
          <p className="text-sm font-semibold text-slate-100">
            {estimatedMonthlyKwh.toFixed(1)} kWh
          </p>
          <p className="text-slate-500 mt-0.5">
            Simple projection from today&apos;s energy so far × 30 days.
          </p>
        </div>
        <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 space-y-1">
          <p className="text-slate-400 mb-1.5">Next hour forecast</p>
          <p className="text-sm font-semibold text-slate-100">
            {predictionLoading
              ? "Fetching…"
              : typeof nextHourPredictionKw === "number"
              ? `${nextHourPredictionKw.toFixed(3)} kW`
              : "–"}
          </p>
          <p className="text-slate-500 mt-0.5">
            Forecast from the trained LSTM model using the last 24 readings
            from ThingSpeak.
          </p>
          {predictionError && !predictionLoading && (
            <p className="text-[10px] text-red-400">
              Unable to fetch prediction: {predictionError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

