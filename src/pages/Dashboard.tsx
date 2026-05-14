import { Banknote, FolderInput, CheckCircle2, Wallet, ListChecks, Activity } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { BridgementTier } from "@/components/BridgementTier";
import { EmptyCard } from "@/components/EmptyCard";
import { useDashboardStats } from "@/hooks/useDashboardStats";

function formatZAR(n: number): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(n);
}

function StatusPill({
  status,
  funderCount,
}: {
  status: "checking" | "connected" | "unauthenticated" | "error";
  funderCount: number | null;
}) {
  const dot =
    status === "connected"
      ? "bg-fnc-teal-bright"
      : status === "checking"
        ? "bg-yellow-400"
        : status === "unauthenticated"
          ? "bg-yellow-400"
          : "bg-red-500";
  const label =
    status === "connected"
      ? `Supabase · ${funderCount ?? "?"} funders`
      : status === "checking"
        ? "Connecting to Supabase…"
        : status === "unauthenticated"
          ? "Connected · sign in for live KPIs"
          : "Supabase connection error";

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-fnc-border bg-fnc-dark-card px-3 py-1 text-xs text-fnc-text-muted">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      <span>{label}</span>
    </div>
  );
}

export function Dashboard() {
  const { stats, status, funderCount } = useDashboardStats();
  const loading = status === "checking";

  return (
    <div className="space-y-6 p-6">
      <div>
        <p className="fnc-eyebrow">Many funders · More approvals</p>
        <h2 className="mt-2 font-serif text-3xl text-fnc-text">
          Welcome back, <span className="italic text-fnc-teal">Thapelo.</span>
        </h2>
        <div className="mt-3">
          <StatusPill status={status} funderCount={funderCount} />
        </div>
        <div className="fnc-divider mt-4" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          label="Open Leads"
          value={stats.open_leads.toString()}
          hint={stats.open_leads === 0 ? "No leads yet" : `${stats.open_leads} in pipeline`}
          Icon={FolderInput}
          loading={loading}
        />
        <KPICard
          label="Submitted This Week"
          value={stats.submitted_this_week.toString()}
          hint={`${stats.submitted_this_week} funder${stats.submitted_this_week === 1 ? "" : "s"} contacted`}
          Icon={Banknote}
          loading={loading}
        />
        <KPICard
          label="Funded MTD"
          value={formatZAR(stats.funded_mtd_amount)}
          hint={`${stats.funded_mtd_count} deal${stats.funded_mtd_count === 1 ? "" : "s"} closed`}
          Icon={CheckCircle2}
          loading={loading}
        />
        <KPICard
          label="Commission MTD"
          value={formatZAR(stats.commission_mtd_total)}
          hint={`${formatZAR(stats.commission_pending_total)} pending invoice`}
          Icon={Wallet}
          loading={loading}
        />
      </div>

      <BridgementTier
        bookSize={stats.bridgement_book_size}
        tier={stats.bridgement_tier}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <EmptyCard
          title="Tasks Due Today"
          description="No tasks scheduled for today. Add a follow-up from any lead detail page."
          Icon={ListChecks}
        />
        <EmptyCard
          title="Recent Activity"
          description="Activity from leads, submissions, and commissions will appear here."
          Icon={Activity}
        />
      </div>
    </div>
  );
}
