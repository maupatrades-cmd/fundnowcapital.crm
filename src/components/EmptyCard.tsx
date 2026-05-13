import type { LucideIcon } from "lucide-react";

export function EmptyCard({
  title,
  description,
  Icon,
}: {
  title: string;
  description: string;
  Icon: LucideIcon;
}) {
  return (
    <div className="rounded-xl border border-fnc-border bg-fnc-dark-card p-5">
      <div className="flex items-center justify-between">
        <p className="fnc-eyebrow">{title}</p>
      </div>
      <div className="mt-6 flex flex-col items-center justify-center py-10 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-fnc-teal/5 text-fnc-teal-muted">
          <Icon className="h-5 w-5" />
        </div>
        <p className="mt-3 max-w-xs text-sm text-fnc-text-muted">{description}</p>
      </div>
    </div>
  );
}
