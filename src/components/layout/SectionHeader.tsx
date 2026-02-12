type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  badge?: string;
};

export const SectionHeader = ({ title, subtitle, badge }: SectionHeaderProps) => {
  return (
    <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4">
      <div>
        <p className="section-title">{title}</p>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
      {badge && (
        <span className="pill text-[11px] text-slate-200 border-slate-700/80 bg-slate-900/70">
          {badge}
        </span>
      )}
    </div>
  );
};

