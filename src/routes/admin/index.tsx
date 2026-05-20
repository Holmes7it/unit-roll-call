import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/Layout";
import {
  useSoldiers,
  usePlatoons,
  isAdminLoggedIn,
  STATUSES,
  RANKS,
  STATUS_BADGE,
  toCSV,
  formatDate,
  type Soldier,
  type SoldierStatus,
} from "@/lib/soldiers";
import {
  Search,
  Download,
  Filter,
  ChevronDown,
  ChevronRight,
  Eye,
  User,
  Plus,
  LayoutGrid,
  List,
  ArrowUpDown,
  Activity,
  Globe,
  Calendar,
  UserMinus,
  Shield,
  Users,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Command Dashboard — Unit Registry" }] }),
  component: AdminDashboard,
});

type SortKey = "serviceNumber" | "fullName" | "rank" | "role" | "status" | "dateEnlisted";

function AdminDashboard() {
  const router = useRouter();
  const { soldiers, ready } = useSoldiers();
  const { platoons } = usePlatoons();
  const [authChecked, setAuthChecked] = useState(false);

  const [statusFilter, setStatusFilter] = useState("all");
  const [unitFilter, setUnitFilter] = useState("all");
  const [rankFilter, setRankFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("serviceNumber");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.navigate({ to: "/admin/login" });
    } else {
      setAuthChecked(true);
    }
  }, [router]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return soldiers.filter((s) => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (unitFilter !== "all" && s.unit !== unitFilter) return false;
      if (rankFilter !== "all" && s.rank !== rankFilter) return false;
      if (q) {
        const hay = `${s.lastName} ${s.firstName} ${s.serviceNumber}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [soldiers, statusFilter, unitFilter, rankFilter, search]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const va = sortKey === "fullName" ? `${a.lastName} ${a.firstName}` : (a[sortKey] ?? "");
      const vb = sortKey === "fullName" ? `${b.lastName} ${b.firstName}` : (b[sortKey] ?? "");
      const cmp = String(va).localeCompare(String(vb));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const groups = useMemo(() => {
    const map = new Map<string, Soldier[]>();
    for (const s of sorted) {
      const key = s.unit || "Unassigned";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [sorted]);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(k);
      setSortDir("asc");
    }
  };

  const exportCSV = () => {
    const csv = toCSV(soldiers);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `unit_registry_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
      <div className="px-6 md:px-10 py-10 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-widest mb-2">
              <LayoutGrid size={14} />
              Operational Control
            </div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">Command Dashboard</h1>
            <p className="text-muted-foreground mt-1">Personnel management and unit logistics overview.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={exportCSV} variant="outline" className="gap-2 font-bold">
              <Download size={16} />
              Export Data
            </Button>
            <Button asChild className="gap-2 font-bold bg-primary hover:opacity-90">
              <Link to="/">
                <Plus size={16} />
                Enroll Personnel
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          <SummaryCard label="Total Strength" value={soldiers.length} icon={<Users size={20} />} trend="Active" />
          <StatusCards soldiers={soldiers} />
        </div>

        {/* Search & Filters */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Search service no. or name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-background/50 border-border/50">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={unitFilter} onValueChange={setUnitFilter}>
                <SelectTrigger className="bg-background/50 border-border/50">
                  <SelectValue placeholder="All Units" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Units</SelectItem>
                  {platoons.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p} Unit
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={rankFilter} onValueChange={setRankFilter}>
                <SelectTrigger className="bg-background/50 border-border/50">
                  <SelectValue placeholder="All Ranks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ranks</SelectItem>
                  {RANKS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-6 pb-20">
          {groups.length === 0 ? (
            <Card className="border-dashed border-2 py-20 bg-muted/5">
              <CardContent className="flex flex-col items-center justify-center text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <User size={32} className="text-muted-foreground opacity-20" />
                </div>
                <h3 className="text-lg font-bold text-foreground">No personnel found</h3>
                <p className="text-muted-foreground text-sm max-w-xs mt-1">
                  Try adjusting your search or filters to find the personnel you are looking for.
                </p>
                <Button variant="link" onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setUnitFilter("all");
                  setRankFilter("all");
                }} className="mt-4 text-accent">
                  Clear all filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            groups.map(([unit, list]) => {
              const isCollapsed = collapsed[unit];
              return (
                <Card key={unit} className="overflow-hidden border-border/50 shadow-sm">
                  <button
                    onClick={() => setCollapsed((c) => ({ ...c, [unit]: !c[unit] }))}
                    className="w-full flex items-center justify-between px-6 py-4 bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-black tracking-tight">Unit {unit}</span>
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-bold">
                          {list.length} Personnel
                        </Badge>
                      </div>
                    </div>
                  </button>
                  <div className={isCollapsed ? "hidden" : "block"}>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-muted/10">
                          <TableRow className="hover:bg-transparent border-border/50">
                            <TableHead className="w-[80px]">Profile</TableHead>
                            <SortableHead label="Service No." k="serviceNumber" current={sortKey} dir={sortDir} onSort={toggleSort} />
                            <SortableHead label="Surname & First Name" k="fullName" current={sortKey} dir={sortDir} onSort={toggleSort} />
                            <SortableHead label="Rank" k="rank" current={sortKey} dir={sortDir} onSort={toggleSort} />
                            <TableHead className="font-bold text-foreground/70 uppercase text-[10px] tracking-widest">Role</TableHead>
                            <SortableHead label="Status" k="status" current={sortKey} dir={sortDir} onSort={toggleSort} />
                            <SortableHead label="Enlisted" k="dateEnlisted" current={sortKey} dir={sortDir} onSort={toggleSort} />
                            <TableHead className="text-right font-bold text-foreground/70 uppercase text-[10px] tracking-widest">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {list.map((s) => (
                            <TableRow key={s.id} className="group border-border/30 hover:bg-muted/20">
                              <TableCell>
                                <Avatar className="h-10 w-10 border border-border/50 group-hover:border-accent/30 transition-colors">
                                  <AvatarImage src={s.photo} className="object-cover" />
                                  <AvatarFallback className="bg-muted text-muted-foreground">
                                    {s.lastName[0]}{s.firstName[0]}
                                  </AvatarFallback>
                                </Avatar>
                              </TableCell>
                              <TableCell className="font-mono text-xs font-bold text-muted-foreground">
                                {s.serviceNumber}
                              </TableCell>
                              <TableCell className="font-bold">
                                {s.lastName} {s.firstName}
                              </TableCell>
                              <TableCell className="text-sm font-medium">
                                {s.rank}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground italic">
                                {s.role}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={`font-bold text-[10px] uppercase tracking-tighter ${STATUS_BADGE[s.status]}`}>
                                  {s.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {formatDate(s.dateEnlisted)}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button asChild variant="ghost" size="sm" className="hover:text-accent font-bold gap-2">
                                  <Link to="/admin/soldiers/$id" params={{ id: s.id }}>
                                    <Eye size={14} />
                                    Review
                                  </Link>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
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
    <div className="group relative rounded-2xl bg-card border border-border p-4 shadow-sm hover:shadow-md transition-all hover:border-accent/20">
      <div className="flex items-start justify-between">
        <div className={`rounded-xl bg-muted p-2 transition-colors group-hover:bg-accent/10 ${iconColor || "text-primary"}`}>
          {icon}
        </div>
        {trend && (
          <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
            Ready
          </span>
        )}
      </div>
      <div className="mt-3">
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</div>
        <div className="mt-0.5 text-2xl font-black text-foreground tracking-tight">{value}</div>
      </div>
    </div>
  );
}

function SortableHead({
  label,
  k,
  current,
  dir,
  onSort,
}: {
  label: string;
  k: SortKey;
  current: SortKey;
  dir: "asc" | "desc";
  onSort: (k: SortKey) => void;
}) {
  const active = current === k;
  return (
    <TableHead className="p-0">
      <button
        onClick={() => onSort(k)}
        className={`w-full h-full flex items-center gap-2 px-4 font-bold uppercase text-[10px] tracking-widest transition-colors ${
          active ? "text-accent bg-accent/5" : "text-foreground/70 hover:text-foreground"
        }`}
      >
        {label}
        {active ? (
          dir === "asc" ? <ArrowUpDown size={12} className="text-accent" /> : <ArrowUpDown size={12} className="text-accent rotate-180 transition-transform" />
        ) : (
          <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-30" />
        )}
      </button>
    </TableHead>
  );
}
