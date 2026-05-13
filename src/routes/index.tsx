import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/Layout";
import { useSoldiers, STATUSES, STATUS_BADGE } from "@/lib/soldiers";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Unit Registry — Soldier Management" },
      { name: "description", content: "Manage soldier profiles within a military unit." },
    ],
  }),
  component: Index,
});

function Index() {
  const { soldiers, ready } = useSoldiers();
  const counts = STATUSES.map((s) => ({ s, n: soldiers.filter((x) => x.status === s).length }));

  return (
    <AppShell>
      <div className="px-6 md:px-10 py-10 max-w-6xl mx-auto">
        <div className="text-xs uppercase tracking-widest text-[#4d7c0f] font-semibold">Welcome</div>
        <h1 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900">Unit Registry</h1>
        <p className="mt-3 text-slate-600 max-w-2xl">
          Securely store and manage soldier profiles, deployments, and emergency contacts for your unit.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/add" className="rounded-md bg-[#4d7c0f] hover:bg-[#3f6b0a] text-white px-5 py-2.5 text-sm font-medium">
            Add a Soldier
          </Link>
          <Link to="/admin/login" className="rounded-md border border-slate-300 hover:bg-slate-100 text-slate-800 px-5 py-2.5 text-sm font-medium">
            Admin Login
          </Link>
        </div>

        {ready && (
          <div className="mt-10 grid grid-cols-2 md:grid-cols-5 gap-4">
            <SummaryCard label="Total" value={soldiers.length} />
            {counts.map(({ s, n }) => (
              <SummaryCard key={s} label={s} value={n} badgeClass={STATUS_BADGE[s]} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function SummaryCard({ label, value, badgeClass }: { label: string; value: number; badgeClass?: string }) {
  return (
    <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
      {badgeClass && <span className={`mt-2 inline-block text-[10px] font-medium px-2 py-0.5 rounded border ${badgeClass}`}>{label}</span>}
    </div>
  );
}
