import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/Layout";
import {
  useSoldiers,
  isAdminLoggedIn,
  STATUSES,
  STATUS_BADGE,
  type SoldierStatus,
} from "@/lib/soldiers";
import {
  Users,
  Activity,
  Globe,
  Calendar,
  UserMinus,
  Shield,
  LayoutDashboard,
  Users2,
  Lock,
} from "lucide-react";
import { useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/overview")({
  head: () => ({ meta: [{ title: "Unit Overview — Command Access" }] }),
  component: AdminOverview,
});

function AdminOverview() {
  const router = useRouter();
  const { soldiers, ready } = useSoldiers();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.navigate({ to: "/admin/login" });
    } else {
      setAuthChecked(true);
    }
  }, [router]);

  if (!authChecked || !ready) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="relative isolate overflow-hidden">
        {/* Background Accents */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-accent opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>

        <div className="px-6 md:px-10 py-16 max-w-6xl mx-auto space-y-16 animate-in fade-in duration-700">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-[10px] uppercase tracking-widest text-accent font-bold">
                <Shield size={12} />
                Command Overview
              </div>
              <h1 className="mt-6 text-4xl md:text-6xl font-black text-foreground tracking-tight leading-tight">
                Unit Readiness <br />
                <span className="text-accent">& Status</span> Report
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
                Comprehensive visibility into unit strength, deployment status, and personnel readiness. Authorized command access only.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/admin"
                  className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-lg hover:opacity-90 transition-all hover:translate-y-[-2px]"
                >
                  <LayoutDashboard size={18} />
                  Manage Personnel
                </Link>
                <Link
                  to="/admin/platoons"
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/50 backdrop-blur-sm px-6 py-3.5 text-sm font-bold text-foreground hover:bg-accent/5 transition-all"
                >
                  <Users2 size={18} />
                  Unit Structure
                </Link>
              </div>
            </div>

            <div className="hidden lg:block w-72 h-72 rounded-3xl tactical-gradient p-1 shadow-2xl rotate-3">
              <div className="w-full h-full bg-background rounded-[1.4rem] flex items-center justify-center relative overflow-hidden group">
                <Shield size={120} className="text-primary/10 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <div className="text-5xl font-black text-primary">{soldiers.length}</div>
                  <div className="mt-1 text-xs uppercase tracking-widest font-bold text-muted-foreground">Total Strength</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-border/50" />
              <h2 className="text-xs uppercase tracking-[0.3em] font-bold text-muted-foreground whitespace-nowrap">Tactical Status Grid</h2>
              <div className="h-px flex-1 bg-border/50" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              <SummaryCard label="Strength" value={soldiers.length} icon={<Users size={20} />} trend="Active" />
              <StatusCards soldiers={soldiers} />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function StatusCards({ soldiers }: { soldiers: any[] }) {
  const statusConfig: Record<SoldierStatus, { icon: React.ReactNode; color: string }> = {
    Active: { icon: <Activity size={20} />, color: "text-green-500" },
    Deployed: { icon: <Globe size={20} />, color: "text-blue-500" },
    "On Leave": { icon: <Calendar size={20} />, color: "text-amber-500" },
    Discharged: { icon: <UserMinus size={20} />, color: "text-slate-500" },
    Deceased: { icon: <Shield size={20} />, color: "text-red-500" },
    Sick: { icon: <Activity size={20} />, color: "text-orange-500" },
  };

  return (
    <>
      {STATUSES.map((s) => {
        const count = soldiers.filter((x) => x.status === s).length;
        const config = statusConfig[s];
        return (
          <SummaryCard
            key={s}
            label={s}
            value={count}
            icon={config.icon}
            badgeClass={STATUS_BADGE[s]}
            iconColor={config.color}
          />
        );
      })}
    </>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  badgeClass,
  trend,
  iconColor,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  badgeClass?: string;
  trend?: string;
  iconColor?: string;
}) {
  return (
    <div className="group relative rounded-2xl bg-card border border-border p-6 shadow-sm hover:shadow-md transition-all hover:border-accent/20">
      <div className="flex items-start justify-between">
        <div className={`rounded-xl bg-muted p-3 transition-colors group-hover:bg-accent/10 ${iconColor || "text-primary"}`}>
          {icon}
        </div>
        {trend && (
          <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
            Ready
          </span>
        )}
      </div>
      <div className="mt-6">
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</div>
        <div className="mt-1 text-4xl font-black text-foreground tracking-tight">{value}</div>
      </div>
      {badgeClass && (
        <div className="mt-4 flex">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-tighter ${badgeClass}`}>
            {label}
          </span>
        </div>
      )}
    </div>
  );
}
