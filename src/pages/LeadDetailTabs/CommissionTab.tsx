import { Calculator } from "lucide-react";

export function CommissionTab({ leadId: _leadId }: { leadId: string }) {
  return (
    <div className="rounded-xl border border-fnc-border bg-fnc-dark-card p-10 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-fnc-teal/10 text-fnc-teal-muted">
        <Calculator className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-serif text-xl text-fnc-text">Commission</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-fnc-text-muted">
        Live calculator embedded here plus saved commission records for this lead. Built in
        Chunk 2 — full SPEC §5 with all 14 funders and Bridgement tier auto-progression.
      </p>
    </div>
  );
}
