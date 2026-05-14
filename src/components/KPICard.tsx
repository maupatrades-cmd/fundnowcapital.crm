import type { LucideIcon } from "lucide-react";

export function KPICard({
  label,
  value,
  hint,
  Icon,
  loading = false,
}: {
  label: string;
  value: string;
  hint?: string;
  Icon: LucideIcon;
  loading?: boolean;
}) {
  return (
    <div className="rounded-xl border border-fnc-border bg-fnc-dark-card p-5">
      <div className="flex items-start justify-between">
        <p className="fnc-eyebrow">{label}</p>
        <div className="grid h-8 w-8 place-items-center rounded-full bg-fnc-teal/10 text-fnc-teal">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      {loading ? (
        <div className="mt-4 h-9 w-24 animate-pulse rounded bg-white/5" />
      ) : (
        <div className="mt-4 font-serif text-3xl text-fnc-text">{value}</div>
      )}
      {hint && <div className="mt-1 text-xs text-fnc-text-muted">{hint}</div>}
    </div>
  );
}
