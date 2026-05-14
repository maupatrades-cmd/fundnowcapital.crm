import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGate } from "@/components/AuthGate";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { Dashboard } from "@/pages/Dashboard";

export default function App() {
  return (
    <AuthProvider>
      <AuthGate>
        <div className="min-h-screen bg-fnc-dark text-fnc-text">
          <Sidebar />
          <div className="md:pl-64">
            <Topbar title="Dashboard" />
            <main>
              <Dashboard />
            </main>
          </div>
        </div>
      </AuthGate>
    </AuthProvider>
  );
}
