import { type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Login } from "@/pages/Login";

function LoadingScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-fnc-dark">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 text-fnc-text-muted">
          <span className="h-2 w-2 animate-pulse rounded-full bg-fnc-teal" />
          <span className="fnc-eyebrow">Loading session…</span>
        </div>
        <p className="mt-6 text-xs text-fnc-text-muted">
          Stuck on this screen?{" "}
          <button
            onClick={() => {
              // Clear any stale supabase session and reload
              for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && k.startsWith("sb-")) localStorage.removeItem(k);
              }
              window.location.reload();
            }}
            className="text-fnc-teal hover:text-fnc-teal-bright"
          >
            Clear session &amp; retry
          </button>
        </p>
      </div>
    </div>
  );
}

export function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Login />;
  return <>{children}</>;
}
