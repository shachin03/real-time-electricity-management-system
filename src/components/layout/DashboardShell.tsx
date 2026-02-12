import { ReactNode } from "react";

type DashboardShellProps = {
  title: string;
  description?: string;
  onBack?: () => void;
  rightSlot?: ReactNode;
  children: ReactNode;
};

export const DashboardShell = ({
  title,
  description,
  onBack,
  rightSlot,
  children
}: DashboardShellProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-4 sm:px-6 lg:px-10 py-4 border-b border-slate-900/80 bg-slate-950/90 backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-800 text-slate-300 hover:bg-slate-900 transition-colors"
                aria-label="Back to landing"
              >
                ←
              </button>
            )}
            <div>
              <p className="text-xs font-medium text-primary-300 tracking-wide uppercase">
                Real-Time Electricity Management
              </p>
              <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
                {title}
              </h1>
              {description && (
                <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                  {description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {rightSlot}
          </div>
        </div>
      </header>
      <main className="flex-1 px-4 sm:px-6 lg:px-10 py-4 pb-6 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950">
        {children}
      </main>
    </div>
  );
};

