import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { AppShell } from "@/components/Layout";
import {
  useSoldiers, usePlatoons, generateId, RANKS, STATUSES, BLOOD_TYPES, GENDERS,
  PLACEHOLDER_PHOTO, type Soldier,
} from "@/lib/soldiers";

export const Route = createFileRoute("/add")({
  head: () => ({ meta: [{ title: "Add Soldier — Unit Registry" }] }),
  component: AddSoldier,
});

const empty = (): Omit<Soldier, "id" | "createdAt"> => ({
  serviceNumber: "", rank: "Private", firstName: "", lastName: "", dateOfBirth: "",
  gender: "Male", nationality: "Ghanaian", unitName: "3rd Infantry Battalion",
  platoon: "Alpha", role: "", dateEnlisted: "", status: "Active", bloodType: "O+",
  contactPhone: "", nextOfKinName: "", nextOfKinPhone: "", notes: "", photo: "",
});

function AddSoldier() {
  const { addSoldier } = useSoldiers();
  const { platoons } = usePlatoons();
  const [form, setForm] = useState(empty());
  const [success, setSuccess] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set("photo", String(reader.result));
    reader.readAsDataURL(file);
  };

  const clear = () => {
    setForm(empty());
    if (fileRef.current) fileRef.current.value = "";
    setSuccess(null);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const soldier: Soldier = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      ...form,
      photo: form.photo || PLACEHOLDER_PHOTO,
    };
    addSoldier(soldier);
    setSuccess(`${soldier.rank} ${soldier.firstName} ${soldier.lastName} (${soldier.serviceNumber}) added successfully.`);
    clear();
  };

  return (
    <AppShell>
      <div className="px-6 md:px-10 py-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900">Add Soldier</h1>
        <p className="mt-1 text-sm text-slate-600">Register a new soldier profile in the unit registry.</p>

        {success && (
          <div className="mt-5 rounded-md border border-green-300 bg-green-50 text-green-800 px-4 py-3 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={submit} className="mt-6 space-y-8 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <Section title="Photo">
            <div className="flex items-center gap-4">
              <img
                src={form.photo || PLACEHOLDER_PHOTO}
                alt="Preview"
                className="h-24 w-24 rounded-full object-cover border border-slate-200 bg-slate-100"
              />
              <input ref={fileRef} type="file" accept="image/*" onChange={onPhoto} className="text-sm" />
            </div>
          </Section>

          <Section title="Personal Info" cols={2}>
            <Field label="First Name" required><input className={inputCls} required value={form.firstName} onChange={(e) => set("firstName", e.target.value)} /></Field>
            <Field label="Last Name" required><input className={inputCls} required value={form.lastName} onChange={(e) => set("lastName", e.target.value)} /></Field>
            <Field label="Date of Birth"><input type="date" className={inputCls} value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} /></Field>
            <Field label="Gender">
              <select className={inputCls} value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                {GENDERS.map((g) => <option key={g}>{g}</option>)}
              </select>
            </Field>
            <Field label="Nationality"><input className={inputCls} value={form.nationality} onChange={(e) => set("nationality", e.target.value)} /></Field>
            <Field label="Blood Type">
              <select className={inputCls} value={form.bloodType} onChange={(e) => set("bloodType", e.target.value)}>
                {BLOOD_TYPES.map((b) => <option key={b}>{b}</option>)}
              </select>
            </Field>
          </Section>

          <Section title="Service Info" cols={2}>
            <Field label="Service Number" required><input className={inputCls} required value={form.serviceNumber} onChange={(e) => set("serviceNumber", e.target.value)} placeholder="GH-2024-001" /></Field>
            <Field label="Rank">
              <select className={inputCls} value={form.rank} onChange={(e) => set("rank", e.target.value)}>
                {RANKS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Unit Name"><input className={inputCls} value={form.unitName} onChange={(e) => set("unitName", e.target.value)} /></Field>
            <Field label="Platoon">
              <select className={inputCls} value={form.platoon} onChange={(e) => set("platoon", e.target.value)}>
                {platoons.length === 0 && <option value="">No platoons defined</option>}
                {platoons.map((p) => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Role"><input className={inputCls} value={form.role} onChange={(e) => set("role", e.target.value)} placeholder="Rifleman" /></Field>
            <Field label="Date Enlisted"><input type="date" className={inputCls} value={form.dateEnlisted} onChange={(e) => set("dateEnlisted", e.target.value)} /></Field>
            <Field label="Status">
              <select className={inputCls} value={form.status} onChange={(e) => set("status", e.target.value as Soldier["status"])}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </Section>

          <Section title="Contact & Emergency" cols={2}>
            <Field label="Contact Phone"><input className={inputCls} value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} /></Field>
            <div />
            <Field label="Next of Kin Name"><input className={inputCls} value={form.nextOfKinName} onChange={(e) => set("nextOfKinName", e.target.value)} /></Field>
            <Field label="Next of Kin Phone"><input className={inputCls} value={form.nextOfKinPhone} onChange={(e) => set("nextOfKinPhone", e.target.value)} /></Field>
          </Section>

          <Section title="Notes">
            <textarea className={inputCls + " min-h-[100px]"} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </Section>

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-200">
            <button type="submit" className="rounded-md bg-[#4d7c0f] hover:bg-[#3f6b0a] text-white px-5 py-2.5 text-sm font-medium">
              Save Soldier
            </button>
            <button type="button" onClick={clear} className="rounded-md border border-slate-300 hover:bg-slate-100 text-slate-800 px-5 py-2.5 text-sm font-medium">
              Clear form
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

const inputCls = "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4d7c0f] focus:border-transparent";

function Section({ title, children, cols = 1 }: { title: string; children: React.ReactNode; cols?: 1 | 2 }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">{title}</h3>
      <div className={`mt-3 grid gap-4 ${cols === 2 ? "md:grid-cols-2" : "grid-cols-1"}`}>{children}</div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-700">{label}{required && <span className="text-red-600"> *</span>}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
