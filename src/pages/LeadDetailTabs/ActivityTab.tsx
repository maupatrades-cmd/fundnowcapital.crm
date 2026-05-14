import { useEffect, useState } from "react";
import { Activity, ChevronDown, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

type AuditRow = {
  id: string;
  action: "insert" | "update" | "delete";
  entity_type: string;
  entity_id: string | null;
  changes: unknown;
  created_at: string;
  user: { full_name: string | null; email: string | null } | null;
};

type DiffPair = { field: string; before: unknown; after: unknown };

function computeDiff(changes: unknown): DiffPair[] {
  if (!changes || typeof changes !== "object") return [];
  const c = changes as { before?: Record<string, unknown>; after?: Record<string, unknown> };
  if (!c.before || !c.after) return [];
  const keys = new Set([...Object.keys(c.before), ...Object.keys(c.after)]);
  const skip = new Set(["updated_at", "created_at"]);
  const diffs: DiffPair[] = [];
  for (const k of keys) {
    if (skip.has(k)) continue;
    const a = c.before[k];
    const b = c.after[k];
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      diffs.push({ field: k, before: a, after: b });
    }
  }
  return diffs;
}

function fmtValue(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return JSON.stringify(v);
}

function ActionBadge({ action }: { action: AuditRow["action"] }) {
  const map: Record<AuditRow["action"], string> = {
    insert: "border-fnc-teal/40 text-fnc-teal",
    update: "border-blue-400/40 text-blue-300",
    delete: "border-red-500/40 text-red-300",
  };
  return (
    <span
      className={
        "inline-block rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-widest " +
        map[action]
      }
    >
      {action}
    </span>
  );
}

export function ActivityTab({ leadId }: { leadId: string }) {
  const [rows, setRows] = useState<AuditRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("audit_log")
        .select(
          "id, action, entity_type, entity_id, changes, created_at, user:profiles!audit_log_user_id_fkey ( full_name, email )",
        )
        .eq("entity_type", "leads")
        .eq("entity_id", leadId)
        .order("created_at", { ascending: false })
        .limit(200);
      if (cancelled) return;
      if (error) setError(error.message);
      else setRows((data as unknown as AuditRow[]) ?? []);
    })();
    return () => {
      cancelled = true;
    };
  }, [leadId]);

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-fnc-border bg-fnc-dark-card">
        <div className="border-b border-fnc-border p-4">
          <p className="fnc-eyebrow">Audit trail</p>
          <p className="mt-1 text-xs text-fnc-text-muted">
            Every change to this lead, captured automatically by the database trigger.
          </p>
        </div>

        {rows === null ? (
          <div className="p-10">
            <div className="h-4 w-32 animate-pulse rounded bg-white/5" />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center">
            <Activity className="mx-auto h-7 w-7 text-fnc-teal-muted" />
            <p className="mt-3 text-sm text-fnc-text-muted">No activity recorded for this lead yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-fnc-border">
            {rows.map((r) => {
              const isOpen = expanded.has(r.id);
              const diffs = r.action === "update" ? computeDiff(r.changes) : [];
              const summary =
                r.action === "insert"
                  ? "Lead created"
                  : r.action === "delete"
                    ? "Lead deleted"
                    : `${diffs.length} field${diffs.length === 1 ? "" : "s"} updated`;
              return (
                <li key={r.id} className="p-4">
                  <button
                    type="button"
                    onClick={() => toggle(r.id)}
                    className="flex w-full items-start gap-3 text-left"
                  >
                    {r.action === "update" ? (
                      isOpen ? (
                        <ChevronDown className="mt-0.5 h-4 w-4 text-fnc-text-muted" />
                      ) : (
                        <ChevronRight className="mt-0.5 h-4 w-4 text-fnc-text-muted" />
                      )
                    ) : (
                      <span className="mt-0.5 inline-block h-4 w-4" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <ActionBadge action={r.action} />
                        <span className="text-sm text-fnc-text">{summary}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-fnc-text-muted">
                        {new Date(r.created_at).toLocaleString("en-ZA")} ·{" "}
                        {r.user?.full_name ?? r.user?.email ?? "System"}
                      </p>
                    </div>
                  </button>

                  {isOpen && diffs.length > 0 && (
                    <div className="mt-3 ml-7 rounded-lg border border-fnc-border bg-fnc-dark p-3">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-left text-fnc-text-muted">
                            <th className="pb-2 fnc-eyebrow !text-[10px]">Field</th>
                            <th className="pb-2 fnc-eyebrow !text-[10px]">Before</th>
                            <th className="pb-2 fnc-eyebrow !text-[10px]">After</th>
                          </tr>
                        </thead>
                        <tbody className="text-fnc-text">
                          {diffs.map((d) => (
                            <tr key={d.field} className="align-top">
                              <td className="pr-3 py-1 font-mono text-fnc-teal-muted">{d.field}</td>
                              <td className="pr-3 py-1 text-fnc-text-muted">{fmtValue(d.before)}</td>
                              <td className="py-1">{fmtValue(d.after)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
