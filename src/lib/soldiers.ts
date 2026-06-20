import { useEffect, useState, useCallback } from "react";
import {
  listSoldiers, addSoldierFn, updateSoldierFn, deleteSoldierFn,
  listPlatoons, addPlatoonFn, renamePlatoonFn, deletePlatoonFn,
  listBatches, addBatchFn, toggleBatchFn, deleteBatchFn,
} from "./registry.functions";
export { isAdminLoggedIn, ADMIN_SESSION_KEY } from "./admin-session";

export type SoldierStatus = "Active" | "On Leave" | "Deployed" | "Discharged" | "Deceased" | "Sick";

export interface Soldier {
  id: string;
  serviceNumber: string;
  rank: string;
  lastName: string;
  firstName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  unitName: string;
  unit: string;
  role: string;
  dateEnlisted: string;
  status: SoldierStatus;
  bloodType: string;
  contactPhone: string;
  nextOfKinName: string;
  nextOfKinPhone: string;
  notes: string;
  photo: string;
  batch: string; // Deployment/Intake batch code
  createdAt: string;
}

export interface Batch {
  id: string;
  name: string;
  code: string;
  createdAt: string;
  isActive: boolean;
}

export const STORAGE_KEY = "unit_registry_soldiers";
export const PLATOONS_STORAGE_KEY = "unit_registry_platoons";
export const BATCHES_STORAGE_KEY = "unit_registry_batches";

export const RANKS = [
  "Private", "Lance Corporal", "Corporal", "Sergeant", "Staff Sergeant",
  "Warrant Officer", "Second Lieutenant", "Lieutenant", "Captain", "Major",
  "Lieutenant Colonel", "Colonel",
];
export const STATUSES: SoldierStatus[] = ["Active", "On Leave", "Deployed", "Discharged", "Deceased", "Sick"];
export const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
export const DEFAULT_PLATOONS = ["Alpha", "Bravo", "Charlie", "Delta"];
/** @deprecated Use usePlatoons() for the live, admin-editable list. */
export const PLATOONS = DEFAULT_PLATOONS;
export const GENDERS = ["Male", "Female"];

export const DEFAULT_BATCHES: Batch[] = [
  { id: "batch-1", name: "Intake 2026-Alpha", code: "M4-26A", createdAt: new Date().toISOString(), isActive: true },
  { id: "batch-2", name: "Task Force Echo", code: "TF-ECHO", createdAt: new Date().toISOString(), isActive: true },
];

export function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function toCSV(soldiers: Soldier[]): string {
  const headers = [
    "id", "serviceNumber", "rank", "lastName", "firstName", "dateOfBirth", "gender",
    "nationality", "unitName", "unit", "role", "dateEnlisted", "status",
    "bloodType", "contactPhone", "nextOfKinName", "nextOfKinPhone", "batch", "notes", "createdAt",
  ];
  const escape = (v: unknown) => {
    const s = String(v ?? "");
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  // Group soldiers by batch designation
  const groups: Record<string, Soldier[]> = {};
  for (const s of soldiers) {
    const b = s.batch || "Unassigned";
    if (!groups[b]) groups[b] = [];
    groups[b].push(s);
  }

  // Get batch keys and sort them, forcing "Unassigned" to be the absolute last block
  const batchKeys = Object.keys(groups).sort((a, b) => {
    if (a === "Unassigned") return 1;
    if (b === "Unassigned") return -1;
    return a.localeCompare(b);
  });

  const lines = [headers.join(",")];
  for (let i = 0; i < batchKeys.length; i++) {
    const key = batchKeys[i];
    const groupSoldiers = groups[key];
    
    // Sort soldiers within each batch by service number
    groupSoldiers.sort((a, b) => a.serviceNumber.localeCompare(b.serviceNumber));

    for (const s of groupSoldiers) {
      lines.push(headers.map((h) => escape((s as unknown as Record<string, unknown>)[h])).join(","));
    }
    
    // Append an empty row to separate this batch from the next, except for the last batch
    if (i < batchKeys.length - 1) {
      lines.push("");
    }
  }

  return lines.join("\n");
}


const SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#cbd5e1"/><circle cx="50" cy="38" r="18" fill="#94a3b8"/><path d="M15 95c5-20 25-30 35-30s30 10 35 30z" fill="#94a3b8"/></svg>';
export const PLACEHOLDER_PHOTO = "data:image/svg+xml;base64," + (typeof btoa !== "undefined" ? btoa(SVG) : "");

// row → app type
type SoldierRow = {
  id: string; service_number: string; rank: string; last_name: string; first_name: string;
  date_of_birth: string; gender: string; nationality: string; unit_name: string; unit: string;
  role: string; date_enlisted: string; status: string; blood_type: string; contact_phone: string;
  next_of_kin_name: string; next_of_kin_phone: string; notes: string; photo: string; batch: string;
  created_at: string;
};
function rowToSoldier(r: SoldierRow): Soldier {
  return {
    id: r.id, serviceNumber: r.service_number, rank: r.rank, lastName: r.last_name, firstName: r.first_name,
    dateOfBirth: r.date_of_birth, gender: r.gender, nationality: r.nationality, unitName: r.unit_name,
    unit: r.unit, role: r.role, dateEnlisted: r.date_enlisted, status: r.status as SoldierStatus,
    bloodType: r.blood_type, contactPhone: r.contact_phone, nextOfKinName: r.next_of_kin_name,
    nextOfKinPhone: r.next_of_kin_phone, notes: r.notes, photo: r.photo || PLACEHOLDER_PHOTO,
    batch: r.batch || "Unassigned", createdAt: r.created_at,
  };
}
function soldierToRow(s: Partial<Soldier>): Partial<SoldierRow> {
  const o: Partial<SoldierRow> = {};
  if (s.serviceNumber !== undefined) o.service_number = s.serviceNumber;
  if (s.rank !== undefined) o.rank = s.rank;
  if (s.lastName !== undefined) o.last_name = s.lastName;
  if (s.firstName !== undefined) o.first_name = s.firstName;
  if (s.dateOfBirth !== undefined) o.date_of_birth = s.dateOfBirth;
  if (s.gender !== undefined) o.gender = s.gender;
  if (s.nationality !== undefined) o.nationality = s.nationality;
  if (s.unitName !== undefined) o.unit_name = s.unitName;
  if (s.unit !== undefined) o.unit = s.unit;
  if (s.role !== undefined) o.role = s.role;
  if (s.dateEnlisted !== undefined) o.date_enlisted = s.dateEnlisted;
  if (s.status !== undefined) o.status = s.status;
  if (s.bloodType !== undefined) o.blood_type = s.bloodType;
  if (s.contactPhone !== undefined) o.contact_phone = s.contactPhone;
  if (s.nextOfKinName !== undefined) o.next_of_kin_name = s.nextOfKinName;
  if (s.nextOfKinPhone !== undefined) o.next_of_kin_phone = s.nextOfKinPhone;
  if (s.notes !== undefined) o.notes = s.notes;
  if (s.photo !== undefined) o.photo = s.photo === PLACEHOLDER_PHOTO ? "" : s.photo;
  if (s.batch !== undefined) o.batch = s.batch;
  return o;
}

const SOLDIERS_EVT = "unit_registry_soldiers_change";
const PLATOONS_EVT = "unit_registry_platoons_change";
const BATCHES_EVT = "unit_registry_batches_change";

const _unusedSeed = (): Soldier[] => [
  { id: generateId(), serviceNumber: "GH-2018-001", rank: "Sergeant", lastName: "Mensah", firstName: "Kwame", dateOfBirth: "1990-04-12", gender: "Male", nationality: "Ghanaian", unitName: "4 Infantry Battalion", unit: "Alpha", role: "Squad Leader", dateEnlisted: "2010-06-01", status: "Active", bloodType: "O+", contactPhone: "+233 20 111 0001", nextOfKinName: "Abena Mensah", nextOfKinPhone: "+233 24 111 0001", notes: "Marksmanship instructor.", photo: PLACEHOLDER_PHOTO, batch: "M4-26A", createdAt: new Date().toISOString() },
  { id: generateId(), serviceNumber: "GH-2019-014", rank: "Corporal", lastName: "Boateng", firstName: "Yaw", dateOfBirth: "1993-09-22", gender: "Male", nationality: "Ghanaian", unitName: "4 Infantry Battalion", unit: "Alpha", role: "Rifleman", dateEnlisted: "2015-03-15", status: "Deployed", bloodType: "A+", contactPhone: "+233 20 111 0002", nextOfKinName: "Akua Boateng", nextOfKinPhone: "+233 24 111 0002", notes: "", photo: PLACEHOLDER_PHOTO, batch: "M4-26A", createdAt: new Date().toISOString() },
  { id: generateId(), serviceNumber: "GH-2021-077", rank: "Private", lastName: "Asante", firstName: "Ama", dateOfBirth: "1998-01-30", gender: "Female", nationality: "Ghanaian", unitName: "4 Infantry Battalion", unit: "Alpha", role: "Medic", dateEnlisted: "2021-07-10", status: "On Leave", bloodType: "B+", contactPhone: "+233 20 111 0003", nextOfKinName: "Kojo Asante", nextOfKinPhone: "+233 24 111 0003", notes: "Field medic certified.", photo: PLACEHOLDER_PHOTO, batch: "M4-26A", createdAt: new Date().toISOString() },
  { id: generateId(), serviceNumber: "GH-2017-045", rank: "Lieutenant", lastName: "Owusu", firstName: "Kofi", dateOfBirth: "1988-11-05", gender: "Male", nationality: "Ghanaian", unitName: "4 Infantry Battalion", unit: "Bravo", role: "Platoon Commander", dateEnlisted: "2009-01-20", status: "Active", bloodType: "AB+", contactPhone: "+233 20 111 0004", nextOfKinName: "Esi Owusu", nextOfKinPhone: "+233 24 111 0004", notes: "", photo: PLACEHOLDER_PHOTO, batch: "TF-ECHO", createdAt: new Date().toISOString() },
  { id: generateId(), serviceNumber: "GH-2020-032", rank: "Lance Corporal", lastName: "Darko", firstName: "Akosua", dateOfBirth: "1996-06-18", gender: "Female", nationality: "Ghanaian", unitName: "4 Infantry Battalion", unit: "Bravo", role: "Signaller", dateEnlisted: "2018-09-12", status: "Deployed", bloodType: "O-", contactPhone: "+233 20 111 0005", nextOfKinName: "Yaa Darko", nextOfKinPhone: "+233 24 111 0005", notes: "", photo: PLACEHOLDER_PHOTO, batch: "TF-ECHO", createdAt: new Date().toISOString() },
  { id: generateId(), serviceNumber: "GH-2015-009", rank: "Staff Sergeant", lastName: "Adjei", firstName: "Kwesi", dateOfBirth: "1985-02-14", gender: "Male", nationality: "Ghanaian", unitName: "4 Infantry Battalion", unit: "Bravo", role: "Quartermaster", dateEnlisted: "2005-08-01", status: "Discharged", bloodType: "A-", contactPhone: "+233 20 111 0006", nextOfKinName: "Adwoa Adjei", nextOfKinPhone: "+233 24 111 0006", notes: "Honorably discharged 2023.", photo: PLACEHOLDER_PHOTO, batch: "Unassigned", createdAt: new Date().toISOString() },
  { id: generateId(), serviceNumber: "GH-2016-022", rank: "Corporal", lastName: "Acheampong", firstName: "Nana", dateOfBirth: "1991-12-03", gender: "Male", nationality: "Ghanaian", unitName: "4 Infantry Battalion", unit: "Charlie", role: "Machine Gunner", dateEnlisted: "2012-05-22", status: "Active", bloodType: "B-", contactPhone: "+233 20 111 0007", nextOfKinName: "Efua Acheampong", nextOfKinPhone: "+233 24 111 0007", notes: "", photo: PLACEHOLDER_PHOTO, batch: "M4-26A", createdAt: new Date().toISOString() },
  { id: generateId(), serviceNumber: "GH-2014-003", rank: "Sergeant", lastName: "Osei", firstName: "Kwabena", dateOfBirth: "1983-07-19", gender: "Male", nationality: "Ghanaian", unitName: "4 Infantry Battalion", unit: "Charlie", role: "Sniper", dateEnlisted: "2004-04-10", status: "Deceased", bloodType: "O+", contactPhone: "+233 20 111 0008", nextOfKinName: "Afia Osei", nextOfKinPhone: "+233 24 111 0008", notes: "KIA — honored in memoriam.", photo: PLACEHOLDER_PHOTO, batch: "Unassigned", createdAt: new Date().toISOString() },
];

async function fetchSoldiers(): Promise<Soldier[]> {
  try {
    const rows = await listSoldiers();
    return (rows as SoldierRow[]).map(rowToSoldier);
  } catch (e) { console.error(e); return []; }
}
function notify(evt: string) {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(evt));
}

export function useSoldiers() {
  const [soldiers, setSoldiers] = useState<Soldier[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = () => fetchSoldiers().then((list) => {
      if (!cancelled) { setSoldiers(list); setReady(true); }
    });
    load();
    const onChange = () => load();
    window.addEventListener(SOLDIERS_EVT, onChange);
    return () => {
      cancelled = true;
      window.removeEventListener(SOLDIERS_EVT, onChange);
    };
  }, []);

  const addSoldier = useCallback(async (s: Soldier) => {
    const row = soldierToRow(s) as Record<string, unknown>;
    const res = await addSoldierFn({ data: { row } });
    if (!res.ok) { console.error(res.error); return; }
    notify(SOLDIERS_EVT);
  }, []);

  const updateSoldier = useCallback(async (id: string, patch: Partial<Soldier>) => {
    const res = await updateSoldierFn({ data: { id, patch: soldierToRow(patch) as Record<string, unknown> } });
    if (!res.ok) { console.error(res.error); return; }
    notify(SOLDIERS_EVT);
  }, []);

  const deleteSoldier = useCallback(async (id: string) => {
    const res = await deleteSoldierFn({ data: { id } });
    if (!res.ok) { console.error(res.error); return; }
    notify(SOLDIERS_EVT);
  }, []);

  return { soldiers, ready, addSoldier, updateSoldier, deleteSoldier };
}

export const STATUS_BADGE: Record<SoldierStatus, string> = {
  Active: "bg-green-100 text-green-800 border-green-300",
  Deployed: "bg-blue-100 text-blue-800 border-blue-300",
  "On Leave": "bg-yellow-100 text-yellow-800 border-yellow-300",
  Discharged: "bg-gray-200 text-gray-800 border-gray-300",
  Deceased: "bg-red-100 text-red-800 border-red-300",
  Sick: "bg-orange-100 text-orange-800 border-orange-300",
};

// Admin password validation lives server-side now. See lib/registry.functions.ts.

async function fetchPlatoons(): Promise<string[]> {
  try { return await listPlatoons(); } catch (e) { console.error(e); return []; }
}

export function usePlatoons() {
  const [platoons, setPlatoons] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = () => fetchPlatoons().then((list) => {
      if (!cancelled) { setPlatoons(list); setReady(true); }
    });
    load();
    const onChange = () => load();
    window.addEventListener(PLATOONS_EVT, onChange);
    return () => {
      cancelled = true;
      window.removeEventListener(PLATOONS_EVT, onChange);
    };
  }, []);

  const addPlatoon = useCallback(async (name: string) => {
    const res = await addPlatoonFn({ data: { name } });
    if (res.ok) notify(PLATOONS_EVT);
    return res;
  }, []);

  const renamePlatoon = useCallback(async (oldName: string, newName: string) => {
    const res = await renamePlatoonFn({ data: { oldName, newName } });
    if (res.ok) { notify(PLATOONS_EVT); notify(SOLDIERS_EVT); }
    return res;
  }, []);

  const deletePlatoon = useCallback(async (name: string) => {
    const res = await deletePlatoonFn({ data: { name } });
    if (res.ok) notify(PLATOONS_EVT);
    return res;
  }, []);

  return { platoons, ready, addPlatoon, renamePlatoon, deletePlatoon };
}

// BATCH MANAGEMENT HELPERS
async function fetchBatches(): Promise<Batch[]> {
  try { return await listBatches(); } catch (e) { console.error(e); return []; }
}

export function useBatches() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = () => fetchBatches().then((list) => {
      if (!cancelled) { setBatches(list); setReady(true); }
    });
    load();
    const onChange = () => load();
    window.addEventListener(BATCHES_EVT, onChange);
    return () => {
      cancelled = true;
      window.removeEventListener(BATCHES_EVT, onChange);
    };
  }, []);

  const addBatch = useCallback(async (name: string, code: string) => {
    const res = await addBatchFn({ data: { name, code } });
    if (res.ok) notify(BATCHES_EVT);
    return res;
  }, []);

  const toggleBatchStatus = useCallback(async (id: string) => {
    const res = await toggleBatchFn({ data: { id } });
    if (res.ok) notify(BATCHES_EVT);
  }, []);

  const deleteBatch = useCallback(async (id: string) => {
    const res = await deleteBatchFn({ data: { id } });
    if (res.ok) notify(BATCHES_EVT);
    return res;
  }, []);

  return { batches, ready, addBatch, toggleBatchStatus, deleteBatch };
}
