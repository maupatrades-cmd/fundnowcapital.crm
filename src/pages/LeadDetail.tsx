import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ChevronLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/forms/Field";
import { supabase } from "@/lib/supabase";

type LeadDetailRow = {
  id: string;
  ref_code: string;
  funding_amount: number;
  funding_type: string;
  funding_purpose: string | null;
  status: string;
  priority: string;
  notes: string | null;
  created_at: string;
  client_id: string | null;
  business_id: string | null;
};

export function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const justCreated = params.get("created");
  const [lead, setLead] = useState<LeadDetailRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (cancelled) return;
      if (error) setError(error.message);
      else setLead(data as LeadDetailRow | null);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

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

      {lead ? (
        <div className="rounded-xl border border-fnc-border bg-fnc-dark-card p-6">
          <p className="fnc-eyebrow">Lead</p>
          <h2 className="mt-1 font-serif text-2xl text-fnc-text">
            <span className="font-mono text-fnc-teal">{lead.ref_code}</span>
          </h2>
          <div className="fnc-divider my-4" />
          <dl className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
            <Row k="Funding type" v={lead.funding_type.replace(/_/g, " ")} />
            <Row k="Amount" v={new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(lead.funding_amount)} />
            <Row k="Status" v={lead.status.replace(/_/g, " ")} />
            <Row k="Priority" v={lead.priority} />
            <Row k="Purpose" v={lead.funding_purpose ?? "—"} wide />
            <Row k="Notes" v={lead.notes ?? "—"} wide />
            <Row k="Created" v={new Date(lead.created_at).toLocaleString("en-ZA")} />
          </dl>
          <p className="mt-6 text-xs text-fnc-text-muted">
            Full lead detail (tabs: Overview, Documents, Submissions, Commission, Tasks, Messages, Activity) coming in the next step.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-fnc-border bg-fnc-dark-card p-10">
          <div className="h-4 w-32 animate-pulse rounded bg-white/5" />
        </div>
      )}
    </div>
  );
}

function Row({ k, v, wide }: { k: string; v: string; wide?: boolean }) {
  return (
    <div className={wide ? "md:col-span-2" : undefined}>
      <dt className="fnc-eyebrow">{k}</dt>
      <dd className="mt-1 text-fnc-text">{v}</dd>
    </div>
  );
}
