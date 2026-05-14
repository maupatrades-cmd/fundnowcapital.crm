import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ChevronLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/forms/Field";
import { supabase } from "@/lib/supabase";
import { OverviewTab, type LeadOverview } from "@/pages/LeadDetailTabs/OverviewTab";
import { DocumentsTab } from "@/pages/LeadDetailTabs/DocumentsTab";
import { SubmissionsTab } from "@/pages/LeadDetailTabs/SubmissionsTab";
import { CommissionTab } from "@/pages/LeadDetailTabs/CommissionTab";
import { TasksTab } from "@/pages/LeadDetailTabs/TasksTab";
import { MessagesTab } from "@/pages/LeadDetailTabs/MessagesTab";
import { ActivityTab } from "@/pages/LeadDetailTabs/ActivityTab";

const TAB_KEYS = [
  "overview",
  "documents",
  "submissions",
  "commission",
  "tasks",
  "messages",
  "activity",
] as const;
type TabKey = (typeof TAB_KEYS)[number];

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "documents", label: "Documents" },
  { key: "submissions", label: "Submissions" },
  { key: "commission", label: "Commission" },
  { key: "tasks", label: "Tasks" },
  { key: "messages", label: "Messages" },
  { key: "activity", label: "Activity" },
];

function isTabKey(v: string | null): v is TabKey {
  return v !== null && (TAB_KEYS as readonly string[]).includes(v);
}

export function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const [params, setParams] = useSearchParams();
  const justCreated = params.get("created");
  const tabParam = params.get("tab");
  const activeTab: TabKey = isTabKey(tabParam) ? tabParam : "overview";

  const [overview, setOverview] = useState<LeadOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("leads")
        .select(
          `
          id, ref_code, status, priority, source,
          funding_type, funding_amount, funding_purpose,
          urgency, preferred_term_months, notes,
          created_at, updated_at,
          client:profiles!leads_client_id_fkey (
            id, full_name, email, phone, province, marital_status, physical_address
          ),
          business:businesses!leads_business_id_fkey (
            id, registered_name, trading_name, cipc_number, vat_number,
            industry, province, city, trading_address, operating_address,
            date_business_started, years_trading,
            monthly_turnover, annual_turnover, monthly_net_profit, num_employees,
            bank_name, account_type, account_holder_name, bank_branch_code,
            has_existing_finance, existing_finance_lender, existing_finance_balance, existing_finance_monthly
          )
        `,
        )
        .eq("id", id)
        .maybeSingle();
      if (cancelled) return;
      if (error) setError(error.message);
      else setOverview(data as unknown as LeadOverview | null);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const setTab = (key: TabKey) => {
    const next = new URLSearchParams(params);
    next.set("tab", key);
    setParams(next, { replace: true });
  };

  const headerRef = useMemo(() => overview?.ref_code ?? "", [overview]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Link to="/leads">
          <Button variant="ghost">
            <ChevronLeft className="mr-1 inline-block h-4 w-4" /> Back to leads
          </Button>
        </Link>
      </div>

      {justCreated && (
        <div className="rounded-xl border border-fnc-teal/30 bg-fnc-teal/5 p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-fnc-teal" />
            <div>
              <p className="fnc-eyebrow !text-fnc-teal">Created</p>
              <p className="mt-1 font-serif text-xl text-fnc-text">
                Lead <span className="font-mono text-fnc-teal">{justCreated}</span>{" "}
                created successfully
              </p>
              <p className="mt-1 text-sm text-fnc-text-muted">
                Initial task assigned to you: <em>Review documents and recommend funders</em>.
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="rounded-xl border border-fnc-border bg-fnc-dark-card p-6">
        {overview ? (
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="fnc-eyebrow">Lead</p>
              <h2 className="mt-1 font-serif text-2xl text-fnc-text">
                <span className="font-mono text-fnc-teal">{headerRef}</span>
                {overview.business?.registered_name && (
                  <span className="ml-3 text-fnc-text-muted">·</span>
                )}
                {overview.business?.registered_name && (
                  <span className="ml-3 italic">{overview.business.registered_name}</span>
                )}
              </h2>
              <p className="mt-1 text-sm text-fnc-text-muted">
                {overview.funding_type.replace(/_/g, " ")} ·{" "}
                {new Intl.NumberFormat("en-ZA", {
                  style: "currency",
                  currency: "ZAR",
                  maximumFractionDigits: 0,
                }).format(overview.funding_amount)}
              </p>
            </div>
            <div className="flex gap-2">
              <span className="inline-block rounded-full border border-fnc-teal/40 px-2.5 py-0.5 text-[10px] uppercase tracking-widest text-fnc-teal">
                {overview.status.replace(/_/g, " ")}
              </span>
              <span className="inline-block rounded-full border border-fnc-border px-2.5 py-0.5 text-[10px] uppercase tracking-widest text-fnc-text-muted">
                {overview.priority}
              </span>
            </div>
          </div>
        ) : (
          <div className="h-6 w-48 animate-pulse rounded bg-white/5" />
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-fnc-border">
        <nav className="-mb-px flex flex-wrap gap-1">
          {TABS.map((t) => {
            const active = t.key === activeTab;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={
                  "border-b-2 px-4 py-2.5 text-sm transition-colors " +
                  (active
                    ? "border-fnc-teal text-fnc-teal"
                    : "border-transparent text-fnc-text-muted hover:text-fnc-text")
                }
              >
                {t.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "overview" && <OverviewTab overview={overview} />}
        {activeTab === "documents" && id && (
          <DocumentsTab
            leadId={id}
            clientId={overview?.client?.id ?? null}
            businessId={overview?.business?.id ?? null}
          />
        )}
        {activeTab === "submissions" && id && <SubmissionsTab leadId={id} />}
        {activeTab === "commission" && id && <CommissionTab leadId={id} />}
        {activeTab === "tasks" && id && <TasksTab leadId={id} />}
        {activeTab === "messages" && id && <MessagesTab leadId={id} />}
        {activeTab === "activity" && id && <ActivityTab leadId={id} />}
      </div>
    </div>
  );
}
