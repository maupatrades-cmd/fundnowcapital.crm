import { Send } from "lucide-react";

export function SubmissionsTab({ leadId: _leadId }: { leadId: string }) {
  return (
    <div className="rounded-xl border border-fnc-border bg-fnc-dark-card p-10 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-fnc-teal/10 text-fnc-teal-muted">
        <Send className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-serif text-xl text-fnc-text">Funder Submissions</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-fnc-text-muted">
        A table of submissions per funder with status, plus a "Submit to Funder" button that
        generates an email with the document checklist and a shareable link. Coming next.
      </p>
    </div>
  );
}
