import { Banknote, FolderInput, CheckCircle2, Wallet, ListChecks, Activity } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { BridgementTier } from "@/components/BridgementTier";
import { EmptyCard } from "@/components/EmptyCard";

export function Dashboard() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <p className="fnc-eyebrow">Many funders · More approvals</p>
        <h2 className="mt-2 font-serif text-3xl text-fnc-text">
          Welcome back,{" "}
          <span className="italic text-fnc-teal">Thapelo.</span>
        </h2>
        <div className="fnc-divider mt-4" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Open Leads" value="0" hint="No leads yet" Icon={FolderInput} />
        <KPICard label="Submitted This Week" value="0" hint="0 funders contacted" Icon={Banknote} />
        <KPICard label="Funded MTD" value="R0" hint="0 deals closed" Icon={CheckCircle2} />
        <KPICard label="Commission MTD" value="R0" hint="R0 pending invoice" Icon={Wallet} />
      </div>

      <BridgementTier bookSize={0} tier="Bronze" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <EmptyCard
          title="Tasks Due Today"
          description="No tasks scheduled for today. Add a follow-up from any lead detail page."
          Icon={ListChecks}
        />
        <EmptyCard
          title="Recent Activity"
          description="Activity from leads, submissions, and commissions will appear here."
          Icon={Activity}
        />
      </div>
    </div>
  );
}
