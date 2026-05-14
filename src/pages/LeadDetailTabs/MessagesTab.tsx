import { MessageSquare } from "lucide-react";

export function MessagesTab({ leadId: _leadId }: { leadId: string }) {
  return (
    <div className="rounded-xl border border-fnc-border bg-fnc-dark-card p-10 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-fnc-teal/10 text-fnc-teal-muted">
        <MessageSquare className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-serif text-xl text-fnc-text">Messages</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-fnc-text-muted">
        In-CRM chat with the client. Coming in a later chunk, after Tasks + Calendar.
      </p>
    </div>
  );
}
