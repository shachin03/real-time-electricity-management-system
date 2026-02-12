import { useEffect, useRef, useState } from "react";
import { DashboardShell, SectionId } from "../components/layout/DashboardShell";
import { SectionHeader } from "../components/layout/SectionHeader";
import { useRealtimeElectricity } from "../hooks/useRealtimeElectricity";
import { StatCard } from "../components/stats/StatCard";
import { LivePowerChart } from "../components/charts/LivePowerChart";
import { DailyEnergyBarChart } from "../components/charts/DailyEnergyBarChart";
import { EnergyDistributionPie } from "../components/charts/EnergyDistributionPie";
import { ThresholdPanel } from "../components/alerts/ThresholdPanel";
import {
  NotificationPanel,
  UiNotification
} from "../components/alerts/NotificationPanel";
import { InsightsCards } from "../components/insights/InsightsCards";
import { MiniPowerTrend } from "../components/charts/MiniPowerTrend";

export const DashboardPage = () => {
  const { latest, samples, insights, hourlyBreakdown, distribution } =
    useRealtimeElectricity();

  const [thresholdW, setThresholdW] = useState<number>(1200);
  const [browserPermission, setBrowserPermission] = useState<
    NotificationPermission | "unsupported"
  >(
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "unsupported"
  );

  const [notifications, setNotifications] = useState<UiNotification[]>([]);
  const [hasCrossedAbove, setHasCrossedAbove] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const lastPowerRef = useRef<number | undefined>(undefined);

  const isAboveThreshold =
    latest !== undefined ? latest.power > thresholdW : false;

  // Track changes around threshold to create smart, non-spammy notifications
  useEffect(() => {
    if (!latest || !alertsEnabled) return;

    const prevPower = lastPowerRef.current;
    lastPowerRef.current = latest.power;

    if (prevPower === undefined) return;

    const justCrossedAbove = prevPower <= thresholdW && latest.power > thresholdW;
    const justReturnedBelow =
      prevPower > thresholdW && latest.power <= thresholdW;

    if (justCrossedAbove) {
      setHasCrossedAbove(true);
      pushNotification(
        {
          title: "Threshold exceeded",
          message: `Live power is now ${latest.power.toFixed(
            0
          )} W (limit: ${thresholdW.toFixed(0)} W).`,
          severity: "danger"
        },
        browserPermission
      );
    } else if (justReturnedBelow && hasCrossedAbove) {
      setHasCrossedAbove(false);
      pushNotification(
        {
          title: "Back within limit",
          message: `Live power has dropped to ${latest.power.toFixed(
            0
          )} W and is now within your limit of ${thresholdW.toFixed(0)} W.`,
          severity: "info"
        },
        browserPermission
      );
    }
  }, [latest, thresholdW, browserPermission, hasCrossedAbove, alertsEnabled]);

  const pushNotification = (
    payload: Omit<UiNotification, "id" | "createdAt">,
    permission: NotificationPermission | "unsupported"
  ) => {
    const uiNotification: UiNotification = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      createdAt: new Date(),
      ...payload
    };

    setNotifications((prev) => {
      const next = [uiNotification, ...prev];
      return next.slice(0, 20); // keep last 20
    });

    if (permission === "granted" && "Notification" in window) {
      try {
        new Notification(payload.title, {
          body: payload.message,
          icon: undefined,
          tag: "electricity-threshold"
        });
      } catch {
        // ignore runtime errors; UI notifications already shown
      }
    }
  };

  const handleRequestBrowserPermission = () => {
    if (!("Notification" in window)) {
      setBrowserPermission("unsupported");
      return;
    }
    Notification.requestPermission().then((p) => {
      setBrowserPermission(p);
    });
  };

  const rightHeaderSlot = latest && (
    <div className="flex items-center gap-3 text-[11px] text-slate-400">
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/60 px-2 py-1">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
        Live
      </span>
      <span>
        Last update:{" "}
        {new Date(latest.timestamp).toLocaleTimeString(undefined, {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        })}
      </span>
    </div>
  );

  // Sidebar navigation
  const [activeSection, setActiveSection] = useState<SectionId>("overview");
  const overviewRef = useRef<HTMLDivElement | null>(null);
  const analyticsRef = useRef<HTMLDivElement | null>(null);
  const alertsRef = useRef<HTMLDivElement | null>(null);
  const insightsRef = useRef<HTMLDivElement | null>(null);

  const handleSelectSection = (id: SectionId) => {
    setActiveSection(id);
    const map: Record<SectionId, React.RefObject<HTMLDivElement>> = {
      overview: overviewRef,
      analytics: analyticsRef,
      alerts: alertsRef,
      insights: insightsRef
    };
    const el = map[id].current;
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const navItems = [
    { id: "overview" as SectionId, label: "Overview" },
    { id: "analytics" as SectionId, label: "Analytics" },
    { id: "alerts" as SectionId, label: "Alerts" },
    { id: "insights" as SectionId, label: "Insights" }
  ];

  const systemStatusLabel = !latest
    ? "Waiting for data stream…"
    : alertsEnabled && isAboveThreshold
    ? "Attention · Above threshold"
    : "Healthy · Within limits";

  const systemStatusTone =
    !latest || (!alertsEnabled && !isAboveThreshold)
      ? "border-slate-700/80 text-slate-200"
      : alertsEnabled && isAboveThreshold
      ? "border-red-500/60 text-red-200 bg-red-500/10"
      : "border-emerald-500/60 text-emerald-200 bg-emerald-500/10";

  return (
    <DashboardShell
      title="Live dashboard"
      description="Streaming voltage, current, power and energy from your IoT hardware."
      navItems={navItems}
      activeSection={activeSection}
      onSelectSection={handleSelectSection}
      rightSlot={rightHeaderSlot}
    >
      <div className="space-y-5 lg:space-y-6">
        {/* Overview section */}
        <section ref={overviewRef} id="overview" className="scroll-mt-20">
          <SectionHeader
            title="Overview"
            subtitle="Live electrical parameters at a glance for your selected panel or circuit."
            badge="Real-time"
          />
          <div className="card-grid">
            <StatCard
              label="Voltage"
              value={latest ? latest.voltage.toFixed(1) : "–"}
              unit="V"
              trendLabel="RMS line voltage sampled every 2 seconds."
            />
            <StatCard
              label="Current"
              value={latest ? latest.current.toFixed(2) : "–"}
              unit="A"
              trendLabel="Estimated load current flowing through the circuit."
            />
            <StatCard
              label="Power"
              value={latest ? latest.power.toFixed(0) : "–"}
              unit="W"
              trendLabel={`Instantaneous real power. Threshold set to ${thresholdW.toFixed(
                0
              )} W.`}
              tone={isAboveThreshold ? "danger" : "default"}
            />
            <StatCard
              label="Energy (today)"
              value={latest ? latest.energyKwh.toFixed(3) : "–"}
              unit="kWh"
              trendLabel="Cumulative energy since midnight (simulated)."
            />
          </div>

          <MiniPowerTrend
            samples={samples}
            isAboveThreshold={alertsEnabled && isAboveThreshold}
          />

          <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px]">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${systemStatusTone}`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  !latest
                    ? "bg-slate-500"
                    : alertsEnabled && isAboveThreshold
                    ? "bg-red-400"
                    : "bg-emerald-400"
                }`}
              />
              {systemStatusLabel}
            </span>
            <span className="text-slate-500">
              Alerts:{" "}
              <span className="font-semibold text-slate-200">
                {alertsEnabled ? "enabled" : "disabled"}
              </span>
              .
            </span>
          </div>
        </section>

        {/* Analytics section */}
        <section ref={analyticsRef} id="analytics" className="scroll-mt-20">
          <SectionHeader
            title="Analytics"
            subtitle="Understand how consumption evolves over time with detailed trends and projections."
          />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            <div className="lg:col-span-2 space-y-4">
              <LivePowerChart
                samples={samples}
                thresholdW={thresholdW}
                isAboveThreshold={alertsEnabled && isAboveThreshold}
              />
              <DailyEnergyBarChart data={hourlyBreakdown} />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
                  <p className="text-slate-400 mb-1">Peak usage</p>
                  <p className="text-sm font-semibold text-slate-100">
                    {insights.peakPowerW.toFixed(0)} W
                  </p>
                  <p className="text-slate-500 mt-0.5">
                    Observed at{" "}
                    <span className="font-medium text-slate-200">
                      {insights.peakPowerTime
                        ? insights.peakPowerTime.toLocaleTimeString(undefined, {
                            hour12: false,
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit"
                          })
                        : "–"}
                    </span>
                    .
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
                  <p className="text-slate-400 mb-1">Average consumption</p>
                  <p className="text-sm font-semibold text-slate-100">
                    {insights.averagePowerW.toFixed(1)} W
                  </p>
                  <p className="text-slate-500 mt-0.5">
                    Rolling average across the recent samples.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
                  <p className="text-slate-400 mb-1">Monthly projection</p>
                  <p className="text-sm font-semibold text-slate-100">
                    {insights.estimatedMonthlyKwh.toFixed(1)} kWh
                  </p>
                  <p className="text-slate-500 mt-0.5">
                    Simple forecast from today&apos;s energy usage × 30 days.
                  </p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-1 space-y-4">
              <EnergyDistributionPie data={distribution} />
            </div>
          </div>
        </section>

        {/* Alerts section */}
        <section ref={alertsRef} id="alerts" className="scroll-mt-20">
          <SectionHeader
            title="Alerts"
            subtitle="Configure safety limits, control notifications, and review the alert history."
          />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            <div className="lg:col-span-2 space-y-4">
              <ThresholdPanel
                thresholdW={thresholdW}
                onSave={setThresholdW}
                isAboveThreshold={isAboveThreshold}
                alertsEnabled={alertsEnabled}
                onToggleAlerts={() => setAlertsEnabled((prev) => !prev)}
                onRequestBrowserPermission={handleRequestBrowserPermission}
                browserPermission={browserPermission}
              />
            </div>
            <div className="lg:col-span-1">
              <NotificationPanel notifications={notifications} />
            </div>
          </div>
        </section>

        {/* Insights section */}
        <section ref={insightsRef} id="insights" className="scroll-mt-20">
          <SectionHeader
            title="Insights"
            subtitle="Automatically derived usage patterns and energy saving suggestions."
          />
          <InsightsCards insights={insights} />
        </section>
      </div>
    </DashboardShell>
  );
};

