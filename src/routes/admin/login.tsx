import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/Layout";
import { ADMIN_PASSWORD, ADMIN_SESSION_KEY } from "@/lib/soldiers";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin Login — Unit Registry" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const router = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      window.sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
      router.navigate({ to: "/admin" });
    } else {
      setErr("Incorrect password. Please try again.");
    }
  };

  return (
    <AppShell>
      <div className="min-h-[80vh] flex items-center justify-center px-6 py-10">
        <form onSubmit={submit} className="w-full max-w-sm bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Admin Login</h1>
          <p className="mt-1 text-sm text-slate-600">Restricted area — authorized personnel only.</p>
          <label className="block mt-5">
            <span className="text-xs font-medium text-slate-700">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErr(""); }}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4d7c0f]"
              autoFocus
            />
          </label>
          {err && <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">{err}</div>}
          <button type="submit" className="mt-5 w-full rounded-md bg-[#4d7c0f] hover:bg-[#3f6b0a] text-white px-4 py-2.5 text-sm font-medium">
            Sign In
          </button>
          <p className="mt-4 text-xs text-slate-500">Hint: default password is <code className="bg-slate-100 px-1 rounded">unit2024</code></p>
        </form>
      </div>
    </AppShell>
  );
}
