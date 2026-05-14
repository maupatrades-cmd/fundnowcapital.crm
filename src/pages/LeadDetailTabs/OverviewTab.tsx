export type LeadOverview = {
  id: string;
  ref_code: string;
  status: string;
  priority: string;
  source: string;
  funding_type: string;
  funding_amount: number;
  funding_purpose: string | null;
  urgency: string | null;
  preferred_term_months: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  client: {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    province: string | null;
    marital_status: string | null;
    physical_address: string | null;
  } | null;
  business: {
    id: string;
    registered_name: string;
    trading_name: string | null;
    cipc_number: string | null;
    vat_number: string | null;
    industry: string | null;
    province: string | null;
    city: string | null;
    trading_address: string | null;
    operating_address: string | null;
    date_business_started: string | null;
    years_trading: number | null;
    monthly_turnover: number | null;
    annual_turnover: number | null;
    monthly_net_profit: number | null;
    num_employees: number | null;
    bank_name: string | null;
    account_type: string | null;
    account_holder_name: string | null;
    bank_branch_code: string | null;
    has_existing_finance: boolean | null;
    existing_finance_lender: string | null;
    existing_finance_balance: number | null;
    existing_finance_monthly: number | null;
  } | null;
};

function zar(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(n);
}

function pretty(v: string | null | undefined): string {
  if (!v) return "—";
  return v.replace(/_/g, " ");
}

function Row({ k, v, wide }: { k: string; v: string; wide?: boolean }) {
  return (
    <div className={wide ? "md:col-span-2" : undefined}>
      <dt className="fnc-eyebrow">{k}</dt>
      <dd className="mt-1 text-fnc-text">{v}</dd>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-fnc-border bg-fnc-dark-card p-6">
      <h3 className="font-serif text-lg text-fnc-text">{title}</h3>
      <div className="fnc-divider my-4" />
      <dl className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">{children}</dl>
    </div>
  );
}

export function OverviewTab({ overview }: { overview: LeadOverview | null }) {
  if (!overview) {
    return (
      <div className="rounded-xl border border-fnc-border bg-fnc-dark-card p-10">
        <div className="h-4 w-32 animate-pulse rounded bg-white/5" />
      </div>
    );
  }

  const c = overview.client;
  const b = overview.business;

  return (
    <div className="space-y-5">
      <Card title="Funding ask">
        <Row k="Funding type" v={pretty(overview.funding_type)} />
        <Row k="Amount" v={zar(overview.funding_amount)} />
        <Row k="Purpose" v={overview.funding_purpose ?? "—"} wide />
        <Row k="Urgency" v={pretty(overview.urgency)} />
        <Row k="Preferred term (months)" v={overview.preferred_term_months?.toString() ?? "—"} />
        <Row k="Source" v={pretty(overview.source)} />
        <Row k="Created" v={new Date(overview.created_at).toLocaleString("en-ZA")} />
        <Row k="Notes" v={overview.notes ?? "—"} wide />
      </Card>

      <Card title="Client">
        <Row k="Full name" v={c?.full_name ?? "—"} />
        <Row k="Email" v={c?.email ?? "—"} />
        <Row k="Mobile" v={c?.phone ?? "—"} />
        <Row k="Province" v={c?.province ?? "—"} />
        <Row k="Marital status" v={pretty(c?.marital_status)} />
        <Row k="Physical address" v={c?.physical_address ?? "—"} wide />
      </Card>

      <Card title="Business">
        <Row k="Registered name" v={b?.registered_name ?? "—"} />
        <Row k="Trading name" v={b?.trading_name ?? "—"} />
        <Row k="CIPC number" v={b?.cipc_number ?? "—"} />
        <Row k="VAT number" v={b?.vat_number ?? "—"} />
        <Row k="Industry" v={b?.industry ?? "—"} />
        <Row k="Started trading" v={b?.date_business_started ?? "—"} />
        <Row k="Years trading" v={b?.years_trading?.toString() ?? "—"} />
        <Row k="Employees" v={b?.num_employees?.toString() ?? "—"} />
        <Row k="Province" v={b?.province ?? "—"} />
        <Row k="City" v={b?.city ?? "—"} />
        <Row k="Trading address" v={b?.trading_address ?? "—"} wide />
        <Row k="Operating address" v={b?.operating_address ?? "—"} wide />
      </Card>

      <Card title="Financial profile">
        <Row k="Monthly turnover" v={zar(b?.monthly_turnover)} />
        <Row k="Annual turnover" v={zar(b?.annual_turnover)} />
        <Row k="Monthly net profit" v={zar(b?.monthly_net_profit)} />
        <Row k="Bank" v={b?.bank_name ?? "—"} />
        <Row k="Account type" v={pretty(b?.account_type)} />
        <Row k="Account holder" v={b?.account_holder_name ?? "—"} />
        <Row k="Branch code" v={b?.bank_branch_code ?? "—"} />
        <Row
          k="Existing finance"
          v={b?.has_existing_finance ? `Yes — ${b.existing_finance_lender ?? "lender"}` : "No"}
        />
        {b?.has_existing_finance && (
          <>
            <Row k="Outstanding balance" v={zar(b?.existing_finance_balance)} />
            <Row k="Monthly repayment" v={zar(b?.existing_finance_monthly)} />
          </>
        )}
      </Card>
    </div>
  );
}
