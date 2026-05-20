import { Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ADMIN_SESSION_KEY, isAdminLoggedIn } from "@/lib/soldiers";
import {
  Home,
  UserPlus,
  LayoutDashboard,
  Users,
  LogIn,
  LogOut,
  Menu,
  X,
  Shield,
} from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const loggedIn = typeof window !== "undefined" && isAdminLoggedIn();

  const logout = () => {
    window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
    router.navigate({ to: "/admin/login" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      {/* Mobile Toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 right-4 z-50 md:hidden rounded-full glass p-2 text-foreground shadow-lg border border-border/50"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-sidebar text-sidebar-foreground flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:static md:translate-x-0 border-r border-sidebar-border`}
      >
        <div className="px-6 py-8 border-b border-sidebar-border/50">
          <div className="flex items-center gap-3">
            <div className="bg-sidebar-primary rounded-lg p-2 shadow-inner">
              <Shield size={24} className="text-sidebar-primary-foreground" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-sidebar-primary font-bold">
                Unit Registry
              </div>
              <div className="text-lg font-bold tracking-tight">3rd Infantry Bn</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {!loggedIn ? (
            <>
              <NavLink to="/" label="Personnel Enrollment" icon={<UserPlus size={18} />} onClick={() => setOpen(false)} />
              <div className="pt-4 pb-2">
                <div className="px-3 text-[10px] uppercase tracking-widest text-sidebar-foreground/40 font-semibold">
                  Administration
                </div>
              </div>
              <NavLink
                to="/admin/login"
                label="Command Access"
                icon={<LogIn size={18} />}
                onClick={() => setOpen(false)}
              />
            </>
          ) : (
            <>
              <NavLink to="/admin/overview" label="Unit Overview" icon={<Home size={18} />} onClick={() => setOpen(false)} />
              <NavLink to="/admin" label="Command Dashboard" icon={<LayoutDashboard size={18} />} onClick={() => setOpen(false)} />
              <NavLink to="/admin/platoons" label="Unit Structure" icon={<Users size={18} />} onClick={() => setOpen(false)} />
              <div className="pt-4 pb-2">
                <div className="px-3 text-[10px] uppercase tracking-widest text-sidebar-foreground/40 font-semibold">
                  Public Facing
                </div>
              </div>
              <NavLink
                to="/"
                label="Enroll Personnel"
                icon={<UserPlus size={18} />}
                onClick={() => setOpen(false)}
              />
            </>
          )}
        </nav>

        {loggedIn && (
          <div className="p-4 border-t border-sidebar-border/50">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-sidebar-primary hover:opacity-90 transition-opacity text-sidebar-primary-foreground text-sm py-2.5 font-semibold shadow-sm"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen overflow-y-auto relative animate-in fade-in duration-500">
        {children}
      </main>
    </div>
  );
}

function NavLink({
  to,
  label,
  icon,
  onClick,
}: {
  to: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: to === "/" }}
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200 group"
      activeProps={{
        className:
          "flex items-center gap-3 rounded-lg px-3 py-2.5 bg-sidebar-accent text-sidebar-foreground font-semibold shadow-sm border border-sidebar-border/50",
      }}
    >
      <span className="group-hover:scale-110 transition-transform duration-200">{icon}</span>
      <span className="text-sm">{label}</span>
    </Link>
  );
}
