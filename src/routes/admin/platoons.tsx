import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/Layout";
import { useSoldiers, usePlatoons, isAdminLoggedIn } from "@/lib/soldiers";

export const Route = createFileRoute("/admin/platoons")({
  head: () => ({ meta: [{ title: "Manage Platoons — Unit Registry" }] }),
  component: PlatoonsAdmin,
});

function PlatoonsAdmin() {
  const router = useRouter();
  const { platoons, ready, addPlatoon, renamePlatoon, deletePlatoon } = usePlatoons();
  const { soldiers } = useSoldiers();
  const [authChecked, setAuthChecked] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!isAdminLoggedIn()) router.navigate({ to: "/admin/login" });
    else setAuthChecked(true);
  }, [router]);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of soldiers) m.set(s.platoon, (m.get(s.platoon) ?? 0) + 1);
    return m;
  }, [soldiers]);

  if (!authChecked || !ready) {
    return <AppShell><div className="p-10 text-slate-500">Loading…</div></AppShell>;
  }

  const flash = (msg: string) => { setInfo(msg); setError(null); setTimeout(() => setInfo(null), 2500); toast.success(msg); };
  const fail = (msg: string) => { setError(msg); setInfo(null); toast.error(msg); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = addPlatoon(name);
    if (!r.ok) return fail(r.error);
    flash(`Platoon "${name.trim()}" created.`);
    setName("");
  };

  const saveRename = (oldName: string) => {
    const r = renamePlatoon(oldName, draft);
    if (!r.ok) return fail(r.error);
    flash(`Renamed to "${draft.trim()}".`);
    setEditing(null);
    setDraft("");
  };

  const remove = (n: string) => {
    const r = deletePlatoon(n);
    if (!r.ok) return fail(r.error);
    flash(`Platoon "${n}" deleted.`);
  };

  return (
    <AppShell>
      <div className="px-6 md:px-10 py-8 max-w-3xl mx-auto">
        <Link to="/admin" className="text-sm text-[#4d7c0f] hover:underline">← Back to dashboard</Link>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">Manage Platoons</h1>
        <p className="mt-1 text-sm text-slate-600">Create, rename, or remove platoons in the unit.</p>

        {error && <div className="mt-4 rounded-md border border-red-300 bg-red-50 text-red-800 px-4 py-2 text-sm">{error}</div>}
        {info && <div className="mt-4 rounded-md border border-green-300 bg-green-50 text-green-800 px-4 py-2 text-sm">{info}</div>}

        <form onSubmit={submit} className="mt-6 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-medium text-slate-700">New platoon name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Echo"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <button type="submit" className="rounded-md bg-[#4d7c0f] hover:bg-[#3f6b0a] text-white px-4 py-2 text-sm font-medium">
            Add Platoon
          </button>
        </form>

        <div className="mt-6 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
              <tr>
                <th className="px-4 py-2 text-left">Platoon</th>
                <th className="px-4 py-2 text-left">Soldiers</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {platoons.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-500">No platoons yet.</td></tr>
              )}
              {platoons.map((p) => {
                const isEditing = editing === p;
                const count = counts.get(p) ?? 0;
                return (
                  <tr key={p} className="border-t border-slate-100">
                    <td className="px-4 py-2 font-medium">
                      {isEditing ? (
                        <input
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                          autoFocus
                        />
                      ) : p}
                    </td>
                    <td className="px-4 py-2 text-slate-600">{count}</td>
                    <td className="px-4 py-2 text-right space-x-2">
                      {isEditing ? (
                        <>
                          <button onClick={() => saveRename(p)} className="text-xs font-medium text-[#4d7c0f] hover:underline">Save</button>
                          <button onClick={() => { setEditing(null); setDraft(""); }} className="text-xs font-medium text-slate-500 hover:underline">Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditing(p); setDraft(p); setError(null); }} className="text-xs font-medium text-[#4d7c0f] hover:underline">Rename</button>
                          <button
                            onClick={() => remove(p)}
                            disabled={count > 0}
                            title={count > 0 ? "Reassign soldiers first" : "Delete platoon"}
                            className="text-xs font-medium text-red-700 hover:underline disabled:text-slate-300 disabled:no-underline disabled:cursor-not-allowed"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}