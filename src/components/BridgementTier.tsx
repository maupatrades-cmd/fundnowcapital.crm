type Tier = "Bronze" | "Silver" | "Gold";

const TIER_THRESHOLDS: Record<Tier, { from: number; to: number; next: Tier | null }> = {
  Bronze: { from: 0, to: 1_000_000, next: "Silver" },
  Silver: { from: 1_000_000, to: 4_000_000, next: "Gold" },
  Gold: { from: 4_000_000, to: 4_000_000, next: null },
};

function formatZAR(n: number): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function BridgementTier({
  bookSize = 0,
  tier = "Bronze",
}: {
  bookSize?: number;
  tier?: Tier;
}) {
  const cfg = TIER_THRESHOLDS[tier];
  const pct =
    cfg.next === null
      ? 100
      : Math.min(100, Math.max(0, ((bookSize - cfg.from) / (cfg.to - cfg.from)) * 100));

  return (
    <div className="rounded-xl border border-fnc-border bg-fnc-dark-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="fnc-eyebrow">Bridgement Tier</p>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="font-serif text-2xl text-fnc-text">{tier}</span>
            <span className="text-sm text-fnc-text-muted">
              {formatZAR(bookSize)}
              {cfg.next && ` of ${formatZAR(cfg.to)} to ${cfg.next}`}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(["Bronze", "Silver", "Gold"] as Tier[]).map((t) => (
            <span
              key={t}
              className={
                "rounded-full px-2.5 py-1 text-[10px] uppercase tracking-widest " +
                (t === tier
                  ? "bg-fnc-teal/15 text-fnc-teal"
                  : "border border-fnc-border text-fnc-text-muted")
              }
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-fnc-teal-muted to-fnc-teal-bright"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-fnc-text-muted">
        <span>{formatZAR(cfg.from)}</span>
        <span>{cfg.next ? formatZAR(cfg.to) : "Max tier"}</span>
      </div>
    </div>
  );
}
