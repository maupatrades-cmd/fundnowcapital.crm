import { ListChecks } from "lucide-react";

export function TasksTab({ leadId: _leadId }: { leadId: string }) {
  return (
    <div className="rounded-xl border border-fnc-border bg-fnc-dark-card p-10 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-fnc-teal/10 text-fnc-teal-muted">
        <ListChecks className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-serif text-xl text-fnc-text">Tasks</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-fnc-text-muted">
        Tasks tied to this lead — assignee, due date, status. Built in Chunk 3 alongside the
        global Tasks + Calendar pages.
      </p>
    </div>
  );
}
