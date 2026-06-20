import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

// All data access is funnelled through these server functions. The Supabase
// tables have RLS enabled with no public policies, so anon/authenticated
// clients cannot reach them directly. Server functions use the service-role
// client (RLS-bypassing) and verify the admin password on every write and
// on every soldier read.

const ADMIN_FALLBACK = "unit2024";

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || ADMIN_FALLBACK;
}

function requireAdmin() {
  const supplied = getRequestHeader("x-admin-password") ?? "";
  if (supplied !== getAdminPassword()) {
    throw new Response("Unauthorized", { status: 401 });
  }
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

// ---------- Auth ----------
export const verifyAdminPassword = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string }) => d)
  .handler(async ({ data }) => {
    return { ok: data.password === getAdminPassword() };
  });

// ---------- Platoons ----------
// Public read so the /enroll dropdown works without admin auth.
export const listPlatoons = createServerFn({ method: "GET" }).handler(async () => {
  const sb = await admin();
  const { data, error } = await sb.from("platoons").select("name").order("name");
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => r.name as string);
});

export const addPlatoonFn = createServerFn({ method: "POST" })
  .inputValidator((d: { name: string }) => d)
  .handler(async ({ data }) => {
    requireAdmin();
    const name = data.name.trim();
    if (!name) return { ok: false as const, error: "Unit name is required." };
    const sb = await admin();
    const { data: existing } = await sb.from("platoons").select("name").ilike("name", name);
    if (existing && existing.length > 0) return { ok: false as const, error: "A unit with that name already exists." };
    const { error } = await sb.from("platoons").insert({ name });
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });

export const renamePlatoonFn = createServerFn({ method: "POST" })
  .inputValidator((d: { oldName: string; newName: string }) => d)
  .handler(async ({ data }) => {
    requireAdmin();
    const newName = data.newName.trim();
    if (!newName) return { ok: false as const, error: "Unit name is required." };
    const sb = await admin();
    const { data: clash } = await sb.from("platoons").select("name").ilike("name", newName);
    if (clash && clash.some((r) => r.name !== data.oldName)) {
      return { ok: false as const, error: "A unit with that name already exists." };
    }
    const { error } = await sb.from("platoons").update({ name: newName }).eq("name", data.oldName);
    if (error) return { ok: false as const, error: error.message };
    await sb.from("soldiers").update({ unit: newName }).eq("unit", data.oldName);
    return { ok: true as const };
  });

export const deletePlatoonFn = createServerFn({ method: "POST" })
  .inputValidator((d: { name: string }) => d)
  .handler(async ({ data }) => {
    requireAdmin();
    const sb = await admin();
    const { count } = await sb.from("soldiers").select("id", { count: "exact", head: true }).eq("unit", data.name);
    if ((count ?? 0) > 0) return { ok: false as const, error: `Cannot delete — ${count} soldier(s) are assigned to this unit.` };
    const { error } = await sb.from("platoons").delete().eq("name", data.name);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });

// ---------- Batches ----------
// Public read so /enroll can show available batches.
export const listBatches = createServerFn({ method: "GET" }).handler(async () => {
  const sb = await admin();
  const { data, error } = await sb.from("batches").select("*").order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    id: r.id as string,
    name: r.name as string,
    code: r.code as string,
    isActive: r.is_active as boolean,
    createdAt: r.created_at as string,
  }));
});

export const addBatchFn = createServerFn({ method: "POST" })
  .inputValidator((d: { name: string; code: string }) => d)
  .handler(async ({ data }) => {
    requireAdmin();
    const name = data.name.trim();
    const code = data.code.trim().toUpperCase();
    if (!name || !code) return { ok: false as const, error: "Name and code are required." };
    const sb = await admin();
    const { error } = await sb.from("batches").insert({ name, code, is_active: true });
    if (error?.code === "23505") return { ok: false as const, error: `Batch with code "${code}" already exists.` };
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });

export const toggleBatchFn = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    requireAdmin();
    const sb = await admin();
    const { data: row } = await sb.from("batches").select("is_active").eq("id", data.id).single();
    if (!row) return { ok: false as const, error: "Batch not found." };
    const { error } = await sb.from("batches").update({ is_active: !row.is_active }).eq("id", data.id);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });

export const deleteBatchFn = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    requireAdmin();
    const sb = await admin();
    const { data: batch } = await sb.from("batches").select("code").eq("id", data.id).single();
    if (!batch) return { ok: false as const, error: "Batch not found." };
    const { count } = await sb.from("soldiers").select("id", { count: "exact", head: true }).eq("batch", batch.code);
    if ((count ?? 0) > 0) return { ok: false as const, error: `Cannot delete — ${count} soldier(s) are assigned to this batch.` };
    const { error } = await sb.from("batches").delete().eq("id", data.id);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });

// ---------- Soldiers (admin-only reads — contain PII) ----------
export const listSoldiers = createServerFn({ method: "GET" }).handler(async () => {
  requireAdmin();
  const sb = await admin();
  const { data, error } = await sb.from("soldiers").select("*").order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getSoldier = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    requireAdmin();
    const sb = await admin();
    const { data: row, error } = await sb.from("soldiers").select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

// Public insert: /enroll allows new personnel to be registered without admin.
// Matches original product behavior. Server side still rejects unknown columns
// and clients never see PII of others.
export const addSoldierFn = createServerFn({ method: "POST" })
  .inputValidator((d: { row: Record<string, unknown> }) => d)
  .handler(async ({ data }) => {
    const sb = await admin();
    const { error } = await sb.from("soldiers").insert(data.row as never);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });

export const updateSoldierFn = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string; patch: Record<string, unknown> }) => d)
  .handler(async ({ data }) => {
    requireAdmin();
    const sb = await admin();
    const { error } = await sb.from("soldiers").update(data.patch as never).eq("id", data.id);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });

export const deleteSoldierFn = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    requireAdmin();
    const sb = await admin();
    const { error } = await sb.from("soldiers").delete().eq("id", data.id);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });