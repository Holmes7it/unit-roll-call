import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/Layout";
import {
  useSoldiers, usePlatoons, isAdminLoggedIn, STATUSES, RANKS, STATUS_BADGE,
  toCSV, formatDate, type Soldier,
} from "@/lib/soldiers";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin Dashboard — Unit Registry" }] }),
  component: AdminDashboard,
});

type SortKey = "serviceNumber" | "fullName" | "rank" | "role" | "status" | "dateEnlisted";

function AdminDashboard() {
  const router = useRouter();
  const { soldiers, ready } = useSoldiers();
  const { platoons } = usePlatoons();
  const [authChecked, setAuthChecked] = useState(false);

  const [statusFilter, setStatusFilter] = useState("");
  const [platoonFilter, setPlatoonFilter] = useState("");
  const [rankFilter, setRankFilter] = useState("");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("serviceNumber");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.navigate({ to: "/admin/login" });
    } else {
      setAuthChecked(true);
    }
  }, [router]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return soldiers.filter((s) => {
      if (statusFilter && s.status !== statusFilter) return false;
      if (platoonFilter && s.platoon !== platoonFilter) return false;
      if (rankFilter && s.rank !== rankFilter) return false;
      if (q) {
        const hay = `${s.firstName} ${s.lastName} ${s.serviceNumber}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [soldiers, statusFilter, platoonFilter, rankFilter, search]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const va = sortKey === "fullName" ? `${a.lastName} ${a.firstName}` : (a[sortKey] ?? "");
      const vb = sortKey === "fullName" ? `${b.lastName} ${b.firstName}` : (b[sortKey] ?? "");
      const cmp = String(va).localeCompare(String(vb));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const groups = useMemo(() => {
    const map = new Map<string, Soldier[]>();
    for (const s of sorted) {
      const key = s.platoon || "Unassigned";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [sorted]);

  const counts = STATUSES.map((s) => ({ s, n: soldiers.filter((x) => x.status === s).length }));

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("asc"); }
  };

  const exportCSV = () => {
    const csv = toCSV(soldiers);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `unit_registry_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!authChecked || !ready) {
    return <AppShell><div className="p-10 text-slate-500">Loading…</div></AppShell>;
  }

  return (
    <AppShell>
      <div className="px-6 md:px-10 py-8 max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-sm text-slate-600">Manage all soldier profiles in the unit.</p>
          </div>
          <button onClick={exportCSV} className="rounded-md bg-[#4d7c0f] hover:bg-[#3f6b0a] text-white px-4 py-2 text-sm font-medium">
            Export CSV
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card label="Total" value={soldiers.length} />
          {counts.map(({ s, n }) => <Card key={s} label={s} value={n} badge={STATUS_BADGE[s]} />)}
        </div>

        <div className="mt-6 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              placeholder="Search name or service no…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <Select value={statusFilter} onChange={setStatusFilter} placeholder="All Statuses" options={STATUSES as readonly string[]} />
            <Select value={platoonFilter} onChange={setPlatoonFilter} placeholder="All Platoons" options={platoons} />
            <Select value={rankFilter} onChange={setRankFilter} placeholder="All Ranks" options={RANKS} />
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {groups.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
              <div className="text-4xl">🪖</div>
              <p className="mt-2 text-slate-600">No soldiers match the current filters.</p>
            </div>
          )}
          {groups.map(([platoon, list]) => {
            const isCollapsed = collapsed[platoon];
            return (
              <div key={platoon} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <button
                  onClick={() => setCollapsed((c) => ({ ...c, [platoon]: !c[platoon] }))}
                  className="w-full flex items-center justify-between px-5 py-3 bg-slate-50 hover:bg-slate-100 border-b border-slate-200"
                >
                  <div className="flex items-center gap-3">
                    <span className={`inline-block transition-transform ${isCollapsed ? "" : "rotate-90"}`}>▶</span>
                    <span className="font-semibold text-slate-900">Platoon {platoon}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-[#0f172a] text-white">{list.length}</span>
                  </div>
                </button>
                <div
                  className="grid transition-all duration-300 ease-in-out"
                  style={{ gridTemplateRows: isCollapsed ? "0fr" : "1fr" }}
                >
                  <div className="overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                          <tr>
                            <th className="px-4 py-2 text-left">Photo</th>
                            <Th label="Service No." k="serviceNumber" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
                            <Th label="Full Name" k="fullName" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
                            <Th label="Rank" k="rank" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
                            <th className="px-4 py-2 text-left">Platoon</th>
                            <Th label="Role" k="role" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
                            <Th label="Status" k="status" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
                            <Th label="Date Enlisted" k="dateEnlisted" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
                            <th className="px-4 py-2 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {list.map((s) => (
                            <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50">
                              <td className="px-4 py-2">
                                <img src={s.photo} alt="" className="h-9 w-9 rounded-full object-cover bg-slate-100 border border-slate-200" />
                              </td>
                              <td className="px-4 py-2 font-mono text-xs">{s.serviceNumber}</td>
                              <td className="px-4 py-2 font-medium">{s.firstName} {s.lastName}</td>
                              <td className="px-4 py-2">{s.rank}</td>
                              <td className="px-4 py-2">{s.platoon}</td>
                              <td className="px-4 py-2">{s.role}</td>
                              <td className="px-4 py-2">
                                <span className={`text-xs font-medium px-2 py-0.5 rounded border ${STATUS_BADGE[s.status]}`}>{s.status}</span>
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">{formatDate(s.dateEnlisted)}</td>
                              <td className="px-4 py-2 text-right">
                                <Link to="/admin/soldiers/$id" params={{ id: s.id }} className="text-[#4d7c0f] hover:underline text-xs font-medium">
                                  View / Edit
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}

function Card({ label, value, badge }: { label: string; value: number; badge?: string }) {
  return (
    <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
      {badge && <span className={`mt-2 inline-block text-[10px] font-medium px-2 py-0.5 rounded border ${badge}`}>{label}</span>}
    </div>
  );
}

function Select({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: readonly string[]; placeholder: string }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm bg-white">
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}

function Th({ label, k, sortKey, sortDir, onClick }: { label: string; k: SortKey; sortKey: SortKey; sortDir: "asc" | "desc"; onClick: (k: SortKey) => void }) {
  const active = sortKey === k;
  return (
    <th className="px-4 py-2 text-left">
      <button onClick={() => onClick(k)} className="inline-flex items-center gap-1 hover:text-slate-900">
        {label}
        {active && <span className="text-[10px]">{sortDir === "asc" ? "▲" : "▼"}</span>}
      </button>
    </th>
  );
}
