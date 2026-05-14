import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Users2 } from "lucide-react";
import { Button } from "@/components/forms/Field";
import { supabase } from "@/lib/supabase";

type LeadRow = {
  id: string;
  ref_code: string;
  funding_amount: number;
  funding_type: string;
  status: string;
  priority: string;
  created_at: string;
};

function formatZAR(n: number): string {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(n);
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: "border-fnc-teal/40 text-fnc-teal",
    documents_pending: "border-yellow-400/40 text-yellow-300",
    under_review: "border-blue-400/40 text-blue-300",
    submitted_to_funder: "border-fnc-teal/40 text-fnc-teal",
    funder_review: "border-fnc-teal/40 text-fnc-teal",
    approved: "border-fnc-teal/40 text-fnc-teal-bright",
    declined: "border-fnc-text-muted/30 text-fnc-text-muted",
    disbursed: "border-fnc-teal/40 text-fnc-teal-bright",
    closed_lost: "border-fnc-text-muted/30 text-fnc-text-muted",
  };
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-widest ${map[status] ?? ""}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function Leads() {
  const [leads, setLeads] = useState<LeadRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("id, ref_code, funding_amount, funding_type, status, priority, created_at")
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (error) setError(error.message);
      else setLeads((data as LeadRow[]) ?? []);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="fnc-eyebrow">Pipeline</p>
          <h2 className="mt-1 font-serif text-2xl text-fnc-text">
            <span className="italic text-fnc-teal">Leads</span>
          </h2>
        </div>
        <Link to="/leads/new">
          <Button variant="primary">
            <Plus className="mr-1 inline-block h-4 w-4" /> Add Lead
          </Button>
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      {leads === null ? (
        <div className="rounded-xl border border-fnc-border bg-fnc-dark-card p-10">
          <div className="h-4 w-32 animate-pulse rounded bg-white/5" />
        </div>
      ) : leads.length === 0 ? (
        <div className="rounded-xl border border-fnc-border bg-fnc-dark-card p-12 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-fnc-teal/10 text-fnc-teal-muted">
            <Users2 className="h-5 w-5" />
          </div>
          <h3 className="mt-4 font-serif text-xl text-fnc-text">No leads yet</h3>
          <p className="mt-1 text-sm text-fnc-text-muted">
            Click "Add Lead" to capture your first client through the 6-step form.
          </p>
          <div className="mt-5">
            <Link to="/leads/new">
              <Button variant="primary">
                <Plus className="mr-1 inline-block h-4 w-4" /> Add your first lead
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-fnc-border bg-fnc-dark-card">
          <table className="w-full text-sm">
            <thead className="border-b border-fnc-border">
              <tr className="text-left text-fnc-text-muted">
                <th className="p-3 fnc-eyebrow !text-[10px]">Ref</th>
                <th className="p-3 fnc-eyebrow !text-[10px]">Funding Type</th>
                <th className="p-3 fnc-eyebrow !text-[10px]">Amount</th>
                <th className="p-3 fnc-eyebrow !text-[10px]">Status</th>
                <th className="p-3 fnc-eyebrow !text-[10px]">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fnc-border">
              {leads.map((l) => (
                <tr key={l.id} className="hover:bg-white/5">
                  <td className="p-3">
                    <Link to={`/leads/${l.id}`} className="font-mono text-fnc-teal hover:text-fnc-teal-bright">
                      {l.ref_code}
                    </Link>
                  </td>
                  <td className="p-3 text-fnc-text">{l.funding_type.replace(/_/g, " ")}</td>
                  <td className="p-3 text-fnc-text">{formatZAR(l.funding_amount)}</td>
                  <td className="p-3">
                    <StatusBadge status={l.status} />
                  </td>
                  <td className="p-3 text-fnc-text-muted">
                    {new Date(l.created_at).toLocaleDateString("en-ZA")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
