import { Bell, Search } from "lucide-react";

function formatSAST(date: Date): string {
  return new Intl.DateTimeFormat("en-ZA", {
    timeZone: "Africa/Johannesburg",
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function Topbar({ title }: { title: string }) {
  const today = formatSAST(new Date());

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-fnc-border bg-fnc-dark/80 px-6 backdrop-blur">
      <h1 className="font-serif text-2xl text-fnc-text">{title}</h1>

      <div className="relative ml-auto hidden w-72 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fnc-text-muted" />
        <input
          type="search"
          placeholder="Search leads, clients, funders…"
          className="h-9 w-full rounded-full border border-fnc-border bg-fnc-dark-card pl-9 pr-3 text-sm text-fnc-text placeholder:text-fnc-text-muted focus:border-fnc-teal focus:outline-none focus:ring-1 focus:ring-fnc-teal"
        />
      </div>

      <button
        aria-label="Notifications"
        className="relative grid h-9 w-9 place-items-center rounded-full border border-fnc-border text-fnc-text-muted hover:border-fnc-teal hover:text-fnc-teal"
      >
        <Bell className="h-4 w-4" />
        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-fnc-teal-bright" />
      </button>

      <div className="hidden text-right leading-tight md:block">
        <div className="fnc-eyebrow">South Africa</div>
        <div className="text-sm text-fnc-text">{today}</div>
      </div>
    </header>
  );
}
