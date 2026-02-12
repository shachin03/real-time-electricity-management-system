export type UiNotification = {
  id: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "danger";
  createdAt: Date;
};

type NotificationPanelProps = {
  notifications: UiNotification[];
};

export const NotificationPanel = ({
  notifications
}: NotificationPanelProps) => {
  return (
    <div className="glass-panel p-4 sm:p-5 space-y-3 border border-slate-800/80">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-title">Notifications</p>
          <p className="text-xs text-slate-400">
            Recent threshold events and system messages
          </p>
        </div>
        <span className="pill text-[10px] text-slate-300">
          {notifications.length === 0
            ? "No active alerts"
            : `${notifications.length} recent`}
        </span>
      </div>
      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
        {notifications.length === 0 && (
          <p className="text-[11px] text-slate-500">
            You&apos;ll see smart notifications here whenever consumption
            crosses your configured thresholds or returns to a safe zone.
          </p>
        )}
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`rounded-xl px-3 py-2 text-[11px] border flex flex-col gap-0.5 ${
              n.severity === "danger"
                ? "border-red-500/40 bg-red-500/5 text-red-100"
                : n.severity === "warning"
                ? "border-amber-400/40 bg-amber-500/5 text-amber-100"
                : "border-slate-700/80 bg-slate-900/60 text-slate-100"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold">{n.title}</p>
              <span className="text-[10px] opacity-80">
                {n.createdAt.toLocaleTimeString(undefined, {
                  hour12: false,
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit"
                })}
              </span>
            </div>
            <p className="opacity-90">{n.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

