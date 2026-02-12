import { ReactNode } from "react";

export type SectionId = "overview" | "analytics" | "alerts" | "insights";

type NavItem = {
  id: SectionId;
  label: string;
  shortLabel?: string;
};

type DashboardShellProps = {
  title: string;
  description?: string;
  rightSlot?: ReactNode;
  navItems: NavItem[];
  activeSection: SectionId;
  onSelectSection: (id: SectionId) => void;
  children: ReactNode;
};

export const DashboardShell = ({
  title,
  description,
  rightSlot,
  navItems,
  activeSection,
  onSelectSection,
  children
}: DashboardShellProps) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-60 border-r border-slate-900/80 bg-slate-950/95 backdrop-blur fixed inset-y-0 left-0 z-20">
        <div className="px-5 py-4 border-b border-slate-900">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary-500 via-emerald-400 to-amber-300 flex items-center justify-center shadow-soft-card">
              <span className="text-xs font-bold tracking-tight">RT</span>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-tight">
                Real-Time Electricity
              </p>
              <p className="text-[11px] text-slate-400">
                Monitoring dashboard
              </p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.id === activeSection;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                className={`w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-left transition-colors ${
                  isActive
                    ? "bg-primary-500/10 text-primary-100 border border-primary-500/50"
                    : "text-slate-300 hover:bg-slate-900/80 border border-transparent"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isActive ? "bg-primary-400" : "bg-slate-600"
                  }`}
                />
                <span>{item.shortLabel ?? item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="px-4 py-3 border-t border-slate-900 text-[11px] text-slate-500">
          <p>ESP32 ready · Single-panel view</p>
        </div>
      </aside>

      {/* Main content column */}
      <div className="flex-1 flex flex-col md:ml-60">
        <header className="px-4 sm:px-6 lg:px-10 py-4 border-b border-slate-900/80 bg-slate-950/90 backdrop-blur flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-primary-300 tracking-wide uppercase">
                Real-Time Electricity Management
              </p>
              <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
                {title}
              </h1>
              {description && (
                <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 max-w-2xl">
                  {description}
                </p>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-3">{rightSlot}</div>
          </div>

          {/* Mobile nav */}
          <div className="flex md:hidden gap-2 overflow-x-auto pb-1 -mx-2 px-2">
            {navItems.map((item) => {
              const isActive = item.id === activeSection;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectSection(item.id)}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-medium border transition-colors ${
                    isActive
                      ? "bg-primary-500 text-white border-primary-500"
                      : "bg-slate-900/80 text-slate-200 border-slate-800"
                  }`}
                >
                  {item.shortLabel ?? item.label}
                </button>
              );
            })}
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-4 pb-6 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

