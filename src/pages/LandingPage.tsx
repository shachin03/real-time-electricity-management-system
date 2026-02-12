type LandingPageProps = {
  onGoToDashboard: () => void;
};

export const LandingPage = ({ onGoToDashboard }: LandingPageProps) => {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="px-6 lg:px-12 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary-500 via-emerald-400 to-amber-300 flex items-center justify-center shadow-soft-card">
            <span className="text-xs font-bold tracking-tight">RT</span>
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">
              Real-Time Electricity
            </p>
            <p className="text-xs text-slate-400">
              Management &amp; Monitoring
            </p>
          </div>
        </div>
        <button
          onClick={onGoToDashboard}
          className="hidden sm:inline-flex items-center gap-2 rounded-full bg-primary-500 hover:bg-primary-400 transition-colors text-sm font-medium px-4 py-2 shadow-soft-card"
        >
          Go to Dashboard
          <span aria-hidden className="text-lg">
            →
          </span>
        </button>
      </header>

      <section className="flex-1 flex flex-col lg:flex-row items-center gap-10 lg:gap-16 px-6 lg:px-16 pb-14">
        <div className="max-w-xl space-y-6">
          <span className="pill inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live IoT power data
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
            Monitor electricity in{" "}
            <span className="bg-gradient-to-r from-primary-400 via-emerald-400 to-amber-300 bg-clip-text text-transparent">
              real-time
            </span>{" "}
            and stay ahead of surges.
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Connect your ESP32-based hardware and track voltage, current, and
            consumption live. Smart alerts help you react instantly when usage
            goes beyond safe or efficient limits.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onGoToDashboard}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-500 hover:bg-primary-400 transition-colors text-sm font-semibold px-5 py-2.5 shadow-soft-card"
            >
              Go to Dashboard
              <span aria-hidden>⚡</span>
            </button>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <div className="flex -space-x-1.5">
                <span className="h-6 w-6 rounded-full bg-emerald-500/80 border border-slate-950" />
                <span className="h-6 w-6 rounded-full bg-amber-400/80 border border-slate-950" />
                <span className="h-6 w-6 rounded-full bg-sky-400/80 border border-slate-950" />
              </div>
              <span>Designed for labs, homes &amp; smart campuses.</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div className="glass-panel p-3 space-y-1">
              <p className="text-slate-400">Real-time monitoring</p>
              <p className="text-sm font-semibold">Voltage, current, power</p>
            </div>
            <div className="glass-panel p-3 space-y-1">
              <p className="text-slate-400">Smart alerts</p>
              <p className="text-sm font-semibold">
                Threshold-based warnings &amp; notifications
              </p>
            </div>
            <div className="glass-panel p-3 space-y-1 sm:col-span-1 col-span-2">
              <p className="text-slate-400">Energy insights</p>
              <p className="text-sm font-semibold">
                Peak, average &amp; estimated monthly usage
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full max-w-lg">
          <div className="glass-panel p-4 sm:p-5 relative overflow-hidden">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary-500/10 blur-3xl" />
            <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-slate-400">Live status</p>
                <p className="text-sm font-semibold">Distribution Panel A</p>
              </div>
              <span className="pill inline-flex items-center gap-1 text-emerald-400 border-emerald-500/40 bg-emerald-500/5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                Streaming
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
              <div className="glass-panel p-3 bg-slate-900/80 border-slate-800/80">
                <p className="text-slate-400">Voltage</p>
                <p className="text-lg font-semibold">
                  231.4 <span className="text-xs text-slate-400">V</span>
                </p>
              </div>
              <div className="glass-panel p-3 bg-slate-900/80 border-slate-800/80">
                <p className="text-slate-400">Current</p>
                <p className="text-lg font-semibold">
                  4.3 <span className="text-xs text-slate-400">A</span>
                </p>
              </div>
              <div className="glass-panel p-3 bg-slate-900/80 border-slate-800/80">
                <p className="text-slate-400">Power</p>
                <p className="text-lg font-semibold">
                  996 <span className="text-xs text-slate-400">W</span>
                </p>
              </div>
              <div className="glass-panel p-3 bg-slate-900/80 border-slate-800/80">
                <p className="text-slate-400">Energy (today)</p>
                <p className="text-lg font-semibold">
                  3.8 <span className="text-xs text-slate-400">kWh</span>
                </p>
              </div>
            </div>

            <div className="h-24 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900/70 to-slate-900/40 border border-slate-800/80 flex items-end overflow-hidden px-3 pb-3 gap-1">
              {Array.from({ length: 24 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex-1 rounded-full bg-gradient-to-t from-primary-500/10 via-emerald-400/50 to-amber-300/80"
                  style={{
                    height: `${40 + Math.sin(idx / 3) * 25 + (idx % 3) * 6}%`
                  }}
                />
              ))}
            </div>
            <p className="mt-2 text-[10px] text-slate-500 text-right">
              Preview of the live dashboard experience
            </p>
          </div>
        </div>
      </section>

      <footer className="px-6 lg:px-12 py-4 text-[11px] text-slate-500 border-t border-slate-900/80">
        Built for the{" "}
        <span className="font-semibold text-slate-300">
          Real-Time Electricity Management System
        </span>
        . Connect hardware later via API without changing the UI.
      </footer>
    </main>
  );
};

