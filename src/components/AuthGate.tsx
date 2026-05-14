import { type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Login } from "@/pages/Login";

function LoadingScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-fnc-dark">
      <div className="flex items-center gap-3 text-fnc-text-muted">
        <span className="h-2 w-2 animate-pulse rounded-full bg-fnc-teal" />
        <span className="fnc-eyebrow">Loading session…</span>
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
