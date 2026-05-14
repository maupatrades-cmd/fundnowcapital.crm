import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type DashboardStats = {
  open_leads: number;
  submitted_this_week: number;
  funded_mtd_amount: number;
  funded_mtd_count: number;
  commission_mtd_total: number;
  commission_pending_total: number;
  bridgement_book_size: number;
  bridgement_tier: "Bronze" | "Silver" | "Gold";
};

type DBStatus = "checking" | "connected" | "unauthenticated" | "error";

const EMPTY: DashboardStats = {
  open_leads: 0,
  submitted_this_week: 0,
  funded_mtd_amount: 0,
  funded_mtd_count: 0,
  commission_mtd_total: 0,
  commission_pending_total: 0,
  bridgement_book_size: 0,
  bridgement_tier: "Bronze",
};

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>(EMPTY);
  const [status, setStatus] = useState<DBStatus>("checking");
  const [funderCount, setFunderCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // Connectivity probe — counts visible funders (admin sees 14, anon sees 0 via RLS).
        const probe = await supabase
          .from("funders")
          .select("*", { count: "exact", head: true });
        if (cancelled) return;

        if (probe.error) {
          // RLS-empty result is not an error; an actual transport/auth error is.
          setStatus("error");
          return;
        }
        setFunderCount(probe.count ?? 0);

        // KPIs require admin. Returns 42501 for non-admin authenticated users.
        const { data, error } = await supabase.rpc("dashboard_stats").single();
        if (cancelled) return;

        if (error) {
          setStatus(error.code === "42501" ? "unauthenticated" : "connected");
          setStats(EMPTY);
          return;
        }

        setStatus("connected");
        setStats(data as DashboardStats);
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { stats, status, funderCount };
}
