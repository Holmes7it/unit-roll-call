import { useEffect, useState, useCallback } from "react";

export type SoldierStatus = "Active" | "On Leave" | "Deployed" | "Discharged" | "Deceased";

export interface Soldier {
  id: string;
  serviceNumber: string;
  rank: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  unitName: string;
  platoon: string;
  role: string;
  dateEnlisted: string;
  status: SoldierStatus;
  bloodType: string;
  contactPhone: string;
  nextOfKinName: string;
  nextOfKinPhone: string;
  notes: string;
  photo: string;
  createdAt: string;
}

export const STORAGE_KEY = "unit_registry_soldiers";
export const PLATOONS_STORAGE_KEY = "unit_registry_platoons";

export const RANKS = [
  "Private", "Lance Corporal", "Corporal", "Sergeant", "Staff Sergeant",
  "Warrant Officer", "Second Lieutenant", "Lieutenant", "Captain", "Major",
  "Lieutenant Colonel", "Colonel",
];
export const STATUSES: SoldierStatus[] = ["Active", "On Leave", "Deployed", "Discharged", "Deceased"];
export const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
export const DEFAULT_PLATOONS = ["Alpha", "Bravo", "Charlie", "Delta"];
/** @deprecated Use usePlatoons() for the live, admin-editable list. */
export const PLATOONS = DEFAULT_PLATOONS;
export const GENDERS = ["Male", "Female"];

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
    "id", "serviceNumber", "rank", "firstName", "lastName", "dateOfBirth", "gender",
    "nationality", "unitName", "platoon", "role", "dateEnlisted", "status",
    "bloodType", "contactPhone", "nextOfKinName", "nextOfKinPhone", "notes", "createdAt",
  ];
  const escape = (v: unknown) => {
    const s = String(v ?? "");
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [headers.join(",")];
  for (const s of soldiers) {
    lines.push(headers.map((h) => escape((s as unknown as Record<string, unknown>)[h])).join(","));
  }
  return lines.join("\n");
}

const SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#cbd5e1"/><circle cx="50" cy="38" r="18" fill="#94a3b8"/><path d="M15 95c5-20 25-30 35-30s30 10 35 30z" fill="#94a3b8"/></svg>';
export const PLACEHOLDER_PHOTO = "data:image/svg+xml;base64," + (typeof btoa !== "undefined" ? btoa(SVG) : "");

const seedFactory = (): Soldier[] => [
  { id: generateId(), serviceNumber: "GH-2018-001", rank: "Sergeant", firstName: "Kwame", lastName: "Mensah", dateOfBirth: "1990-04-12", gender: "Male", nationality: "Ghanaian", unitName: "3rd Infantry Battalion", platoon: "Alpha", role: "Squad Leader", dateEnlisted: "2010-06-01", status: "Active", bloodType: "O+", contactPhone: "+233 20 111 0001", nextOfKinName: "Abena Mensah", nextOfKinPhone: "+233 24 111 0001", notes: "Marksmanship instructor.", photo: PLACEHOLDER_PHOTO, createdAt: new Date().toISOString() },
  { id: generateId(), serviceNumber: "GH-2019-014", rank: "Corporal", firstName: "Yaw", lastName: "Boateng", dateOfBirth: "1993-09-22", gender: "Male", nationality: "Ghanaian", unitName: "3rd Infantry Battalion", platoon: "Alpha", role: "Rifleman", dateEnlisted: "2015-03-15", status: "Deployed", bloodType: "A+", contactPhone: "+233 20 111 0002", nextOfKinName: "Akua Boateng", nextOfKinPhone: "+233 24 111 0002", notes: "", photo: PLACEHOLDER_PHOTO, createdAt: new Date().toISOString() },
  { id: generateId(), serviceNumber: "GH-2021-077", rank: "Private", firstName: "Ama", lastName: "Asante", dateOfBirth: "1998-01-30", gender: "Female", nationality: "Ghanaian", unitName: "3rd Infantry Battalion", platoon: "Alpha", role: "Medic", dateEnlisted: "2021-07-10", status: "On Leave", bloodType: "B+", contactPhone: "+233 20 111 0003", nextOfKinName: "Kojo Asante", nextOfKinPhone: "+233 24 111 0003", notes: "Field medic certified.", photo: PLACEHOLDER_PHOTO, createdAt: new Date().toISOString() },
  { id: generateId(), serviceNumber: "GH-2017-045", rank: "Lieutenant", firstName: "Kofi", lastName: "Owusu", dateOfBirth: "1988-11-05", gender: "Male", nationality: "Ghanaian", unitName: "3rd Infantry Battalion", platoon: "Bravo", role: "Platoon Commander", dateEnlisted: "2009-01-20", status: "Active", bloodType: "AB+", contactPhone: "+233 20 111 0004", nextOfKinName: "Esi Owusu", nextOfKinPhone: "+233 24 111 0004", notes: "", photo: PLACEHOLDER_PHOTO, createdAt: new Date().toISOString() },
  { id: generateId(), serviceNumber: "GH-2020-032", rank: "Lance Corporal", firstName: "Akosua", lastName: "Darko", dateOfBirth: "1996-06-18", gender: "Female", nationality: "Ghanaian", unitName: "3rd Infantry Battalion", platoon: "Bravo", role: "Signaller", dateEnlisted: "2018-09-12", status: "Deployed", bloodType: "O-", contactPhone: "+233 20 111 0005", nextOfKinName: "Yaa Darko", nextOfKinPhone: "+233 24 111 0005", notes: "", photo: PLACEHOLDER_PHOTO, createdAt: new Date().toISOString() },
  { id: generateId(), serviceNumber: "GH-2015-009", rank: "Staff Sergeant", firstName: "Kwesi", lastName: "Adjei", dateOfBirth: "1985-02-14", gender: "Male", nationality: "Ghanaian", unitName: "3rd Infantry Battalion", platoon: "Bravo", role: "Quartermaster", dateEnlisted: "2005-08-01", status: "Discharged", bloodType: "A-", contactPhone: "+233 20 111 0006", nextOfKinName: "Adwoa Adjei", nextOfKinPhone: "+233 24 111 0006", notes: "Honorably discharged 2023.", photo: PLACEHOLDER_PHOTO, createdAt: new Date().toISOString() },
  { id: generateId(), serviceNumber: "GH-2016-022", rank: "Corporal", firstName: "Nana", lastName: "Acheampong", dateOfBirth: "1991-12-03", gender: "Male", nationality: "Ghanaian", unitName: "3rd Infantry Battalion", platoon: "Charlie", role: "Machine Gunner", dateEnlisted: "2012-05-22", status: "Active", bloodType: "B-", contactPhone: "+233 20 111 0007", nextOfKinName: "Efua Acheampong", nextOfKinPhone: "+233 24 111 0007", notes: "", photo: PLACEHOLDER_PHOTO, createdAt: new Date().toISOString() },
  { id: generateId(), serviceNumber: "GH-2014-003", rank: "Sergeant", firstName: "Kwabena", lastName: "Osei", dateOfBirth: "1983-07-19", gender: "Male", nationality: "Ghanaian", unitName: "3rd Infantry Battalion", platoon: "Charlie", role: "Sniper", dateEnlisted: "2004-04-10", status: "Deceased", bloodType: "O+", contactPhone: "+233 20 111 0008", nextOfKinName: "Afia Osei", nextOfKinPhone: "+233 24 111 0008", notes: "KIA — honored in memoriam.", photo: PLACEHOLDER_PHOTO, createdAt: new Date().toISOString() },
];

function readStorage(): Soldier[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = seedFactory();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as Soldier[];
  } catch {
    return [];
  }
}

function writeStorage(soldiers: Soldier[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(soldiers));
  window.dispatchEvent(new Event("unit_registry_change"));
}

export function useSoldiers() {
  const [soldiers, setSoldiers] = useState<Soldier[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSoldiers(readStorage());
    setReady(true);
    const onChange = () => setSoldiers(readStorage());
    window.addEventListener("unit_registry_change", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("unit_registry_change", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const addSoldier = useCallback((s: Soldier) => {
    const list = readStorage();
    writeStorage([...list, s]);
  }, []);

  const updateSoldier = useCallback((id: string, patch: Partial<Soldier>) => {
    const list = readStorage();
    writeStorage(list.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  const deleteSoldier = useCallback((id: string) => {
    const list = readStorage();
    writeStorage(list.filter((s) => s.id !== id));
  }, []);

  return { soldiers, ready, addSoldier, updateSoldier, deleteSoldier };
}

export const STATUS_BADGE: Record<SoldierStatus, string> = {
  Active: "bg-green-100 text-green-800 border-green-300",
  Deployed: "bg-blue-100 text-blue-800 border-blue-300",
  "On Leave": "bg-yellow-100 text-yellow-800 border-yellow-300",
  Discharged: "bg-gray-200 text-gray-800 border-gray-300",
  Deceased: "bg-red-100 text-red-800 border-red-300",
};

export const ADMIN_PASSWORD = "unit2024";
export const ADMIN_SESSION_KEY = "isAdminLoggedIn";

export function isAdminLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
}

function readPlatoons(): string[] {
  if (typeof window === "undefined") return DEFAULT_PLATOONS;
  try {
    const raw = window.localStorage.getItem(PLATOONS_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(PLATOONS_STORAGE_KEY, JSON.stringify(DEFAULT_PLATOONS));
      return [...DEFAULT_PLATOONS];
    }
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [...DEFAULT_PLATOONS];
  } catch {
    return [...DEFAULT_PLATOONS];
  }
}

function writePlatoons(list: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PLATOONS_STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("unit_registry_platoons_change"));
}

export function usePlatoons() {
  const [platoons, setPlatoons] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPlatoons(readPlatoons());
    setReady(true);
    const onChange = () => setPlatoons(readPlatoons());
    window.addEventListener("unit_registry_platoons_change", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("unit_registry_platoons_change", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const addPlatoon = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return { ok: false as const, error: "Platoon name is required." };
    const list = readPlatoons();
    if (list.some((p) => p.toLowerCase() === trimmed.toLowerCase())) {
      return { ok: false as const, error: "A platoon with that name already exists." };
    }
    writePlatoons([...list, trimmed]);
    return { ok: true as const };
  }, []);

  const renamePlatoon = useCallback((oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return { ok: false as const, error: "Platoon name is required." };
    const list = readPlatoons();
    if (list.some((p) => p.toLowerCase() === trimmed.toLowerCase() && p !== oldName)) {
      return { ok: false as const, error: "A platoon with that name already exists." };
    }
    writePlatoons(list.map((p) => (p === oldName ? trimmed : p)));
    // cascade rename to soldiers
    const soldiers = readStorage();
    writeStorage(soldiers.map((s) => (s.platoon === oldName ? { ...s, platoon: trimmed } : s)));
    return { ok: true as const };
  }, []);

  const deletePlatoon = useCallback((name: string) => {
    const soldiers = readStorage();
    const inUse = soldiers.filter((s) => s.platoon === name).length;
    if (inUse > 0) {
      return { ok: false as const, error: `Cannot delete — ${inUse} soldier(s) are assigned to this platoon.` };
    }
    writePlatoons(readPlatoons().filter((p) => p !== name));
    return { ok: true as const };
  }, []);

  return { platoons, ready, addPlatoon, renamePlatoon, deletePlatoon };
}
