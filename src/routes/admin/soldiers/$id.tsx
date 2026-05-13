import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/Layout";
import {
  useSoldiers, usePlatoons, isAdminLoggedIn, STATUSES, RANKS, BLOOD_TYPES, GENDERS,
  STATUS_BADGE, formatDate, PLACEHOLDER_PHOTO, type Soldier,
} from "@/lib/soldiers";

export const Route = createFileRoute("/admin/soldiers/$id")({
  head: () => ({ meta: [{ title: "Soldier Profile — Unit Registry" }] }),
  component: SoldierProfile,
});

function SoldierProfile() {
  const { id } = Route.useParams();
  const router = useRouter();
  const { soldiers, ready, updateSoldier, deleteSoldier } = useSoldiers();
  const { platoons } = usePlatoons();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Soldier | null>(null);
  const [confirmDel, setConfirmDel] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!isAdminLoggedIn()) router.navigate({ to: "/admin/login" });
    else setAuthChecked(true);
  }, [router]);

  const soldier = soldiers.find((s) => s.id === id);

  useEffect(() => { if (soldier) setForm(soldier); }, [soldier]);

  if (!authChecked || !ready) {
    return <AppShell><div className="p-10 text-slate-500">Loading…</div></AppShell>;
  }

  if (!soldier) {
    return (
      <AppShell>
        <div className="p-10 max-w-3xl mx-auto">
          <p className="text-slate-600">Soldier not found.</p>
          <Link to="/admin" className="mt-3 inline-block text-[#4d7c0f] hover:underline text-sm">← Back to dashboard</Link>
        </div>
      </AppShell>
    );
  }

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !form) return;
    const reader = new FileReader();
    reader.onload = () => setForm({ ...form, photo: String(reader.result) });
    reader.readAsDataURL(file);
  };

  const save = () => {
    if (!form) return;
    updateSoldier(id, form);
    setEditing(false);
  };

  const remove = () => {
    deleteSoldier(id);
    router.navigate({ to: "/admin" });
  };

  const data = editing && form ? form : soldier;

  return (
    <AppShell>
      <div className="px-6 md:px-10 py-8 max-w-5xl mx-auto">
        <Link to="/admin" className="text-sm text-[#4d7c0f] hover:underline">← Back to dashboard</Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{data.rank} {data.firstName} {data.lastName}</h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
              <span className="font-mono">{data.serviceNumber}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded border ${STATUS_BADGE[data.status]}`}>{data.status}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {!editing ? (
              <>
                <button onClick={() => setEditing(true)} className="rounded-md bg-[#4d7c0f] hover:bg-[#3f6b0a] text-white px-4 py-2 text-sm font-medium">Edit</button>
                <button onClick={() => setConfirmDel(true)} className="rounded-md border border-red-300 text-red-700 hover:bg-red-50 px-4 py-2 text-sm font-medium">Delete</button>
              </>
            ) : (
              <>
                <button onClick={save} className="rounded-md bg-[#4d7c0f] hover:bg-[#3f6b0a] text-white px-4 py-2 text-sm font-medium">Save</button>
                <button onClick={() => { setEditing(false); setForm(soldier); }} className="rounded-md border border-slate-300 hover:bg-slate-100 px-4 py-2 text-sm font-medium">Cancel</button>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <img src={data.photo || PLACEHOLDER_PHOTO} alt="" className="w-full aspect-square object-cover rounded-lg border border-slate-200 bg-slate-100" />
              {editing && <input type="file" accept="image/*" onChange={onPhoto} className="mt-3 text-xs w-full" />}
            </div>
          </div>

          <div className="md:col-span-2 space-y-5">
            <Section title="Personal Info">
              <Row label="First Name" v={data.firstName} edit={editing} onChange={(v) => setForm({ ...form!, firstName: v })} />
              <Row label="Last Name" v={data.lastName} edit={editing} onChange={(v) => setForm({ ...form!, lastName: v })} />
              <Row label="Date of Birth" v={editing ? data.dateOfBirth : formatDate(data.dateOfBirth)} edit={editing} type="date" raw={data.dateOfBirth} onChange={(v) => setForm({ ...form!, dateOfBirth: v })} />
              <Row label="Gender" v={data.gender} edit={editing} options={GENDERS} onChange={(v) => setForm({ ...form!, gender: v })} />
              <Row label="Nationality" v={data.nationality} edit={editing} onChange={(v) => setForm({ ...form!, nationality: v })} />
              <Row label="Blood Type" v={data.bloodType} edit={editing} options={BLOOD_TYPES} onChange={(v) => setForm({ ...form!, bloodType: v })} />
            </Section>

            <Section title="Service Info">
              <Row label="Service Number" v={data.serviceNumber} edit={editing} onChange={(v) => setForm({ ...form!, serviceNumber: v })} />
              <Row label="Rank" v={data.rank} edit={editing} options={RANKS} onChange={(v) => setForm({ ...form!, rank: v })} />
              <Row label="Unit" v={data.unitName} edit={editing} onChange={(v) => setForm({ ...form!, unitName: v })} />
              <Row label="Platoon" v={data.platoon} edit={editing} options={platoons} onChange={(v) => setForm({ ...form!, platoon: v })} />
              <Row label="Role" v={data.role} edit={editing} onChange={(v) => setForm({ ...form!, role: v })} />
              <Row label="Date Enlisted" v={editing ? data.dateEnlisted : formatDate(data.dateEnlisted)} edit={editing} type="date" raw={data.dateEnlisted} onChange={(v) => setForm({ ...form!, dateEnlisted: v })} />
              <Row label="Status" v={data.status} edit={editing} options={STATUSES as readonly string[]} onChange={(v) => setForm({ ...form!, status: v as Soldier["status"] })} />
            </Section>

            <Section title="Emergency Contact">
              <Row label="Contact Phone" v={data.contactPhone} edit={editing} onChange={(v) => setForm({ ...form!, contactPhone: v })} />
              <Row label="Next of Kin" v={data.nextOfKinName} edit={editing} onChange={(v) => setForm({ ...form!, nextOfKinName: v })} />
              <Row label="Next of Kin Phone" v={data.nextOfKinPhone} edit={editing} onChange={(v) => setForm({ ...form!, nextOfKinPhone: v })} />
            </Section>

            <Section title="Notes">
              {editing ? (
                <textarea
                  value={form?.notes ?? ""}
                  onChange={(e) => setForm({ ...form!, notes: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm min-h-[100px]"
                />
              ) : (
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{data.notes || <span className="text-slate-400">—</span>}</p>
              )}
            </Section>
          </div>
        </div>

        {confirmDel && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
              <h3 className="text-lg font-semibold text-slate-900">Delete soldier?</h3>
              <p className="mt-2 text-sm text-slate-600">
                This permanently removes <strong>{soldier.firstName} {soldier.lastName}</strong> ({soldier.serviceNumber}) from the registry.
              </p>
              <div className="mt-5 flex justify-end gap-2">
                <button onClick={() => setConfirmDel(false)} className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100">Cancel</button>
                <button onClick={remove} className="rounded-md bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-medium">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-[#4d7c0f]">{title}</h3>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">{children}</div>
    </div>
  );
}

function Row({
  label, v, edit, options, onChange, type, raw,
}: {
  label: string;
  v: string;
  edit: boolean;
  options?: readonly string[];
  onChange?: (v: string) => void;
  type?: string;
  raw?: string;
}) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      {edit && onChange ? (
        options ? (
          <select value={raw ?? v} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm">
            {options.map((o) => <option key={o}>{o}</option>)}
          </select>
        ) : (
          <input
            type={type ?? "text"}
            value={raw ?? v}
            onChange={(e) => onChange(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        )
      ) : (
        <div className="mt-0.5 text-sm text-slate-900">{v || <span className="text-slate-400">—</span>}</div>
      )}
    </div>
  );
}
