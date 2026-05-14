import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGate } from "@/components/AuthGate";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { Dashboard } from "@/pages/Dashboard";
import { Leads } from "@/pages/Leads";
import { NewLead } from "@/pages/NewLead";
import { LeadDetail } from "@/pages/LeadDetail";

function Placeholder({ title }: { title: string }) {
  return (
    <div className="p-6">
      <div className="rounded-xl border border-fnc-border bg-fnc-dark-card p-10 text-center">
        <p className="fnc-eyebrow">Coming soon</p>
        <h2 className="mt-2 font-serif text-2xl text-fnc-text">{title}</h2>
        <p className="mt-1 text-sm text-fnc-text-muted">This screen will be built in the next step.</p>
      </div>
    </div>
  );
}

function Shell() {
  return (
    <div className="min-h-screen bg-fnc-dark text-fnc-text">
      <Sidebar />
      <div className="md:pl-64">
        <Topbar />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/leads/new" element={<NewLead />} />
            <Route path="/leads/:id" element={<LeadDetail />} />
            <Route path="/funders" element={<Placeholder title="Funders" />} />
            <Route path="/calendar" element={<Placeholder title="Calendar" />} />
            <Route path="/commission" element={<Placeholder title="Commission" />} />
            <Route path="/tasks" element={<Placeholder title="Tasks" />} />
            <Route path="/consultants" element={<Placeholder title="Consultants" />} />
            <Route path="/settings" element={<Placeholder title="Settings" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthGate>
          <Shell />
        </AuthGate>
      </AuthProvider>
    </BrowserRouter>
  );
}
