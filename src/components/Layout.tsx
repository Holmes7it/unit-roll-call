import { Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ADMIN_SESSION_KEY, isAdminLoggedIn } from "@/lib/soldiers";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const loggedIn = typeof window !== "undefined" && isAdminLoggedIn();

  const logout = () => {
    window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
    router.navigate({ to: "/admin/login" });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-3 left-3 z-50 md:hidden rounded-md bg-[#0f172a] text-white px-3 py-2 text-sm"
      >
        {open ? "Close" : "Menu"}
      </button>
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0f172a] text-slate-100 flex flex-col transform transition-transform md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:static md:translate-x-0`}
      >
        <div className="px-6 py-5 border-b border-white/10">
          <div className="text-xs uppercase tracking-widest text-[#a3e635]">Unit Registry</div>
          <div className="mt-1 text-lg font-semibold">3rd Infantry Bn</div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          <NavLink to="/" label="Home" />
          <NavLink to="/add" label="Add Soldier" />
          <NavLink to="/admin" label="Admin Dashboard" />
          {!loggedIn && <NavLink to="/admin/login" label="Admin Login" />}
        </nav>
        {loggedIn && (
          <div className="p-4 border-t border-white/10">
            <button
              onClick={logout}
              className="w-full rounded-md bg-[#4d7c0f] hover:bg-[#3f6b0a] text-white text-sm py-2 font-medium"
            >
              Logout
            </button>
          </div>
        )}
      </aside>
      <main className="md:ml-0 min-h-screen">{children}</main>
    </div>
  );
}

function NavLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: to === "/" }}
      className="block rounded-md px-3 py-2 text-slate-300 hover:bg-white/5 hover:text-white"
      activeProps={{ className: "block rounded-md px-3 py-2 bg-[#4d7c0f] text-white font-medium" }}
    >
      {label}
    </Link>
  );
}
