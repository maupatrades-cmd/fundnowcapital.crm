import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { Dashboard } from "@/pages/Dashboard";

export default function App() {
  return (
    <div className="min-h-screen bg-fnc-dark text-fnc-text">
      <Sidebar />
      <div className="md:pl-64">
        <Topbar title="Dashboard" />
        <main>
          <Dashboard />
        </main>
      </div>
    </div>
  );
}
