import { FormEvent, useState } from "react";

type ThresholdPanelProps = {
  thresholdW: number;
  onSave: (value: number) => void;
  isAboveThreshold: boolean;
  alertsEnabled: boolean;
  onToggleAlerts: () => void;
  onRequestBrowserPermission: () => void;
  browserPermission: NotificationPermission | "unsupported";
};

export const ThresholdPanel = ({
  thresholdW,
  onSave,
  isAboveThreshold,
  alertsEnabled,
  onToggleAlerts,
  onRequestBrowserPermission,
  browserPermission
}: ThresholdPanelProps) => {
  const [value, setValue] = useState<string>(thresholdW.toString());

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const numeric = Number.parseFloat(value);
    if (!Number.isFinite(numeric) || numeric <= 0) return;
    onSave(numeric);
  };

  const browserStatusLabel =
    browserPermission === "granted"
      ? "Browser alerts enabled"
      : browserPermission === "denied"
      ? "Notifications blocked in browser"
      : browserPermission === "default"
      ? "Click to enable browser alerts"
      : "Notifications not supported";

  return (
    <div className="glass-panel p-4 sm:p-5 space-y-4 border border-slate-800/80">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="section-title">Threshold &amp; alerts</p>
          <p className="text-xs text-slate-400">
            Set a safe power limit and get notified instantly when exceeded.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block text-xs font-medium text-slate-300">
          Power threshold
          <span className="text-slate-500 font-normal"> (W)</span>
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="number"
            min={100}
            step={10}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="flex-1 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/60"
            placeholder="e.g. 1200"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-primary-500 hover:bg-primary-400 transition-colors text-xs font-semibold px-4 py-2"
          >
            Save threshold
          </button>
        </div>
        <p className="text-[11px] text-slate-500">
          Current threshold:{" "}
          <span className="font-semibold text-slate-300">
            {thresholdW.toFixed(0)} W
          </span>
          .
        </p>
      </form>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-[0.18em]">
              Alerts
            </p>
            <p className="text-[11px] text-slate-500">
              Enable or pause threshold-based monitoring.
            </p>
          </div>
          <button
            type="button"
            onClick={onToggleAlerts}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] border transition-colors ${
              alertsEnabled
                ? "bg-emerald-500/10 border-emerald-400/70 text-emerald-200"
                : "bg-slate-900/80 border-slate-700 text-slate-300"
            }`}
          >
            <span
              className={`h-3 w-5 rounded-full flex items-center ${
                alertsEnabled ? "bg-emerald-500/80" : "bg-slate-600"
              }`}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full bg-slate-950 transform transition-transform duration-150 ${
                  alertsEnabled ? "translate-x-2.5" : "translate-x-0.5"
                }`}
              />
            </span>
            {alertsEnabled ? "Enabled" : "Disabled"}
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] text-slate-400 font-medium uppercase tracking-[0.18em]">
            Browser notifications
          </p>
          <button
            type="button"
            onClick={onRequestBrowserPermission}
            disabled={browserPermission === "unsupported"}
            className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/60 px-3 py-1.5 text-[11px] text-slate-300 hover:border-primary-500/80 hover:bg-slate-900/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                browserPermission === "granted"
                  ? "bg-emerald-400"
                  : browserPermission === "denied"
                  ? "bg-red-500"
                  : "bg-amber-400"
              }`}
            />
            {browserStatusLabel}
          </button>
          <p className="text-[11px] text-slate-500">
            A desktop notification will be pushed whenever live power crosses
            the threshold while alerts are enabled.
          </p>
        </div>
      </div>

      {isAboveThreshold && alertsEnabled && (
        <div className="mt-2 rounded-xl border border-red-500/40 bg-red-500/5 px-3 py-2.5 text-[11px] text-red-200 flex gap-2">
          <span className="mt-0.5">⚠️</span>
          <div>
            <p className="font-semibold tracking-wide uppercase">
              Threshold exceeded
            </p>
            <p className="text-red-200/90">
              Live power is currently above your configured limit. Consider
              switching off non-essential loads.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

