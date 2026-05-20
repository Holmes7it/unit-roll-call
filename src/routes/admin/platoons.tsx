import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/Layout";
import { useSoldiers, usePlatoons, isAdminLoggedIn } from "@/lib/soldiers";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  ArrowLeft,
  Users2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/platoons")({
  head: () => ({ meta: [{ title: "Manage Units — Unit Registry" }] }),
  component: PlatoonsAdmin,
});

function PlatoonsAdmin() {
  const router = useRouter();
  const { platoons, ready, addPlatoon, renamePlatoon, deletePlatoon } = usePlatoons();
  const { soldiers } = useSoldiers();
  const [authChecked, setAuthChecked] = useState(false);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!isAdminLoggedIn()) router.navigate({ to: "/admin/login" });
    else setAuthChecked(true);
  }, [router]);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of soldiers) m.set(s.unit, (m.get(s.unit) ?? 0) + 1);
    return m;
  }, [soldiers]);

  if (!authChecked || !ready) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppShell>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = addPlatoon(name);
    if (!r.ok) return toast.error(r.error);
    toast.success(`Unit "${name.trim()}" established.`);
    setName("");
  };

  const saveRename = (oldName: string) => {
    const r = renamePlatoon(oldName, draft);
    if (!r.ok) return toast.error(r.error);
    toast.success(`Unit designation updated to "${draft.trim()}".`);
    setEditing(null);
    setDraft("");
  };

  const remove = (n: string) => {
    const r = deletePlatoon(n);
    if (!r.ok) return toast.error(r.error);
    toast.success(`Unit "${n}" decommissioned.`);
  };

  return (
    <AppShell>
      <div className="px-6 md:px-10 py-10 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-4 text-accent hover:text-accent font-bold gap-2 -ml-2">
            <Link to="/admin">
              <ArrowLeft size={16} />
              Dashboard
            </Link>
          </Button>
          <div className="flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-widest mb-2">
            <Users2 size={14} />
            Unit Structure
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Unit Management</h1>
          <p className="text-muted-foreground mt-1">Configure and organize unit subdivisions.</p>
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold">New Designation</CardTitle>
            <CardDescription>Assign a new unit identifier to the unit registry.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[240px] space-y-2">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Echo, Foxtrot..."
                  className="bg-background/50 border-border/50"
                />
              </div>
              <Button type="submit" className="bg-primary hover:opacity-90 font-bold gap-2 px-6">
                <Plus size={18} />
                Add Unit
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="font-bold text-foreground/70 uppercase text-[10px] tracking-widest px-6">Unit Identifier</TableHead>
                <TableHead className="font-bold text-foreground/70 uppercase text-[10px] tracking-widest px-6">Current Strength</TableHead>
                <TableHead className="text-right font-bold text-foreground/70 uppercase text-[10px] tracking-widest px-6">Operations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {platoons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                    No units established.
                  </TableCell>
                </TableRow>
              ) : (
                platoons.map((p) => {
                  const isEditing = editing === p;
                  const count = counts.get(p) ?? 0;
                  return (
                    <TableRow key={p} className="group border-border/30 hover:bg-muted/20">
                      <TableCell className="font-black tracking-tight px-6 text-lg">
                        {isEditing ? (
                          <div className="flex items-center gap-2 max-w-[200px]">
                            <Input
                              value={draft}
                              onChange={(e) => setDraft(e.target.value)}
                              className="h-8 py-0 bg-background/50 border-accent/50 focus-visible:ring-accent"
                              autoFocus
                            />
                          </div>
                        ) : (
                          p
                        )}
                      </TableCell>
                      <TableCell className="px-6">
                        <div className="flex items-center gap-2">
                          <Users size={14} className="text-muted-foreground" />
                          <span className="font-bold text-muted-foreground">{count} Personnel</span>
                          {count > 0 && (
                            <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-tighter bg-green-500/10 text-green-500 border-green-500/20">
                              Active
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <div className="flex items-center justify-end gap-2">
                          {isEditing ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 border-green-500/50 text-green-500 hover:bg-green-500/10"
                                onClick={() => saveRename(p)}
                              >
                                <Check size={14} />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 border-border/50 text-muted-foreground hover:bg-muted"
                                onClick={() => {
                                  setEditing(null);
                                  setDraft("");
                                }}
                              >
                                <X size={14} />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-accent"
                                onClick={() => {
                                  setEditing(p);
                                  setDraft(p);
                                }}
                              >
                                <Pencil size={14} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                disabled={count > 0}
                                title={count > 0 ? "Reassign personnel first" : "Decommission unit"}
                                onClick={() => remove(p)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AppShell>
  );
}