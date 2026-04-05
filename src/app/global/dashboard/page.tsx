import { Dashboard } from "@/app/_components/shared/Dashboard";

export default function GlobalDashboardPage() {
  return (
    <div className="w-screen min-h-[calc(100vh-2rem)] bg-dark scrollbar-hide overflow-y-auto">
      <Dashboard isGlobal={true} />
    </div>
  );
}
