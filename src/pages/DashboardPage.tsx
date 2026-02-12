import { useEffect, useRef, useState } from "react";
import { DashboardShell } from "../components/layout/DashboardShell";
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

type DashboardPageProps = {
  onBackToLanding: () => void;
};

export const DashboardPage = ({ onBackToLanding }: DashboardPageProps) => {
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
  const lastPowerRef = useRef<number | undefined>(undefined);

  const isAboveThreshold =
    latest !== undefined ? latest.power > thresholdW : false;

  // Track changes around threshold to create smart, non-spammy notifications
  useEffect(() => {
    if (!latest) return;

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
  }, [latest, thresholdW, browserPermission, hasCrossedAbove]);

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
    <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400">
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

  return (
    <DashboardShell
      title="Live dashboard"
      description="Streaming voltage, current, power and energy from your IoT hardware."
      onBack={onBackToLanding}
      rightSlot={rightHeaderSlot}
    >
      <div className="space-y-5 lg:space-y-6">
        {/* Overview section */}
        <section>
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
        </section>

        {/* Trends & thresholds section */}
        <section>
          <SectionHeader
            title="Trends & thresholds"
            subtitle="Track how consumption is evolving over time and configure safety limits."
          />
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
            <div className="xl:col-span-2">
              <LivePowerChart
                samples={samples}
                thresholdW={thresholdW}
                isAboveThreshold={isAboveThreshold}
              />
            </div>
            <div className="xl:col-span-1 space-y-4">
              <ThresholdPanel
                thresholdW={thresholdW}
                onSave={setThresholdW}
                isAboveThreshold={isAboveThreshold}
                onRequestBrowserPermission={handleRequestBrowserPermission}
                browserPermission={browserPermission}
              />
            </div>
          </div>
        </section>

        {/* Consumption breakdown section */}
        <section>
          <SectionHeader
            title="Consumption breakdown"
            subtitle="Understand when and where energy is being used across the day."
          />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            <div className="lg:col-span-2 space-y-4">
              <DailyEnergyBarChart data={hourlyBreakdown} />
            </div>
            <div className="lg:col-span-1 space-y-4">
              <EnergyDistributionPie data={distribution} />
            </div>
          </div>
        </section>

        {/* Intelligence & alerts section */}
        <section>
          <SectionHeader
            title="Insights & alerts"
            subtitle="Automatically derived insights and the latest threshold events."
          />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            <div className="lg:col-span-2">
              <InsightsCards insights={insights} />
            </div>
            <div className="lg:col-span-1">
              <NotificationPanel notifications={notifications} />
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
};

