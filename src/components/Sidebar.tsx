import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  Calculator,
  ListChecks,
  UserCog,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

type NavItem = {
  to: string;
  label: string;
  Icon: typeof LayoutDashboard;
  // match returns true if pathname is "active" for this item
  match: (pathname: string) => boolean;
};

const navItems: NavItem[] = [
  { to: "/", label: "Dashboard", Icon: LayoutDashboard, match: (p) => p === "/" },
  { to: "/leads", label: "Leads", Icon: Users, match: (p) => p.startsWith("/leads") },
  { to: "/funders", label: "Funders", Icon: Building2, match: (p) => p.startsWith("/funders") },
  { to: "/calendar", label: "Calendar", Icon: Calendar, match: (p) => p.startsWith("/calendar") },
  { to: "/commission", label: "Commission", Icon: Calculator, match: (p) => p.startsWith("/commission") },
  { to: "/tasks", label: "Tasks", Icon: ListChecks, match: (p) => p.startsWith("/tasks") },
  { to: "/consultants", label: "Consultants", Icon: UserCog, match: (p) => p.startsWith("/consultants") },
  { to: "/settings", label: "Settings", Icon: Settings, match: (p) => p.startsWith("/settings") },
];

function initialsFrom(nameOrEmail: string): string {
  const source = nameOrEmail.includes("@") ? nameOrEmail.split("@")[0] : nameOrEmail;
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Sidebar() {
  const location = useLocation();
  const { profile, user, signOut } = useAuth();

  const displayName =
    profile?.full_name?.trim() || user?.email?.split("@")[0] || "User";
  const displayRole =
    profile?.role === "admin"
      ? "Admin"
      : profile?.role === "consultant"
        ? "Consultant"
        : profile?.role === "client"
          ? "Client"
          : "Pending";
  const initials = initialsFrom(profile?.full_name || user?.email || "?");

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 flex-col border-r border-fnc-border bg-fnc-dark-card md:flex">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-fnc-teal text-fnc-dark">
          <span className="font-serif text-lg font-bold">F</span>
        </div>
        <div className="leading-tight">
          <div className="font-serif text-base text-fnc-text">
            Fund <span className="italic text-fnc-teal">Now</span>
          </div>
          <div className="fnc-eyebrow !text-[10px]">Capital · CRM</div>
        </div>
      </div>

      <div className="fnc-divider" />

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ to, label, Icon, match }) => {
          const isActive = match(location.pathname);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-fnc-teal/10 text-fnc-teal"
                  : "text-fnc-text-muted hover:bg-white/5 hover:text-fnc-text",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4",
                  isActive ? "text-fnc-teal" : "text-fnc-text-muted group-hover:text-fnc-text",
                )}
              />
              <span>{label}</span>
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-fnc-teal-bright" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="fnc-divider" />

      <div className="px-3 py-4">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-fnc-teal/20 text-fnc-teal">
            <span className="text-sm font-semibold">{initials}</span>
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-sm text-fnc-text">{displayName}</div>
            <div className="truncate text-xs text-fnc-text-muted">{displayRole}</div>
          </div>
          <button
            aria-label="Log out"
            onClick={() => signOut()}
            className="rounded-md p-1.5 text-fnc-text-muted hover:bg-white/5 hover:text-fnc-text"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
