import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/Layout";
import {
  useBatches,
  useSoldiers,
  isAdminLoggedIn,
  type Batch,
} from "@/lib/soldiers";
import {
  Plus,
  Copy,
  Trash2,
  Users,
  ShieldAlert,
  Layers,
  CheckCircle,
  XCircle,
  Link as LinkIcon,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/batches")({
  head: () => ({ meta: [{ title: "Deployment Batches — Command Access" }] }),
  component: AdminBatches,
});

function AdminBatches() {
  const router = useRouter();
  const { batches, ready: batchesReady, addBatch, toggleBatchStatus, deleteBatch } = useBatches();
  const { soldiers, ready: soldiersReady } = useSoldiers();
  
  const [authChecked, setAuthChecked] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.navigate({ to: "/admin/login" });
    } else {
      setAuthChecked(true);
    }
  }, [router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await addBatch(name, code);
    if (result.ok) {
      toast.success("Batch Created", {
        description: `Batch "${name}" [${code.toUpperCase()}] has been successfully created.`,
      });
      setName("");
      setCode("");
    } else {
      toast.error("Operation Failed", {
        description: result.error,
      });
    }
  };

  const handleCopyLink = (code: string) => {
    if (typeof window === "undefined") return;
    const link = `${window.location.origin}/enroll?batch=${encodeURIComponent(code)}`;
    navigator.clipboard.writeText(link)
      .then(() => {
        toast.success("Link Copied", {
          description: `Enrollment URL for batch ${code} copied to clipboard.`,
        });
      })
      .catch(() => {
        toast.error("Copy Failed", {
          description: "Could not write link to clipboard.",
        });
      });
  };

  const handleToggle = async (id: string, name: string) => {
    const result = await toggleBatchStatus(id);
    if (result?.ok) {
      toast.success("Batch Updated", {
        description: `Status for batch "${name}" has been toggled.`,
      });
    } else {
      toast.error("Operation Failed", {
        description: result?.error ?? "Could not update this batch.",
      });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const result = await deleteBatch(id);
    if (result.ok) {
      toast.success("Batch Deleted", {
        description: `Batch "${name}" has been purged from the database.`,
      });
    } else {
      toast.error("Purge Prevented", {
        description: result.error,
      });
    }
  };

  if (!authChecked || !batchesReady || !soldiersReady) {
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
      <div className="px-6 md:px-10 py-10 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-widest mb-2">
            <Layers size={14} />
            Deployment &amp; Logistics
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Deployment Batches</h1>
          <p className="text-muted-foreground mt-1">
            Group tactical personnel into enlistment batches and generate secure shareable enrollment links.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Create Batch Card */}
          <div className="lg:col-span-4">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Plus size={18} className="text-accent" />
                  Establish New Batch
                </CardTitle>
                <CardDescription>
                  Define a deployment group or intake code for incoming soldiers.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-tighter">Batch Name</Label>
                    <Input
                      required
                      placeholder="e.g. Intake 2026-Alpha"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-tighter">Batch Code</Label>
                    <Input
                      required
                      placeholder="e.g. M4-26A"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="bg-background/50 border-border/50 font-mono uppercase"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:opacity-90 font-bold h-10 mt-2">
                    Create Deployment Batch
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Batches Table List */}
          <div className="lg:col-span-8">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Active Deployments &amp; Intake Batches</CardTitle>
                <CardDescription>
                  Monitor and manage active batches. Active batches are listed in the public enrollment dropdown.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/20">
                    <TableRow className="hover:bg-transparent border-border/50">
                      <TableHead className="font-bold text-foreground/70 uppercase text-[10px] tracking-widest pl-6">Intake Group</TableHead>
                      <TableHead className="font-bold text-foreground/70 uppercase text-[10px] tracking-widest">Code</TableHead>
                      <TableHead className="font-bold text-foreground/70 uppercase text-[10px] tracking-widest">Assigned Strength</TableHead>
                      <TableHead className="font-bold text-foreground/70 uppercase text-[10px] tracking-widest">Status</TableHead>
                      <TableHead className="font-bold text-foreground/70 uppercase text-[10px] tracking-widest text-right pr-6">Controls</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batches.length === 0 ? (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={5} className="py-12 text-center text-muted-foreground italic text-sm">
                          No batches established. Create a batch on the left to begin.
                        </TableCell>
                      </TableRow>
                    ) : (
                      batches.map((b) => {
                        const count = soldiers.filter((s) => s.batch === b.code).length;
                        return (
                          <TableRow key={b.id} className="border-border/30 hover:bg-muted/10 group">
                            <TableCell className="font-bold pl-6 py-4">
                              {b.name}
                            </TableCell>
                            <TableCell className="font-mono text-xs font-bold text-muted-foreground uppercase">
                              {b.code}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="font-bold flex w-fit items-center gap-1.5 bg-primary/10 text-primary border-primary/20">
                                <Users size={12} />
                                {count} Soldiers
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <button
                                onClick={() => handleToggle(b.id, b.name)}
                                className="flex items-center gap-1.5 focus:outline-none text-xs font-bold"
                              >
                                {b.isActive ? (
                                  <Badge className="bg-green-100 hover:bg-green-200 text-green-800 border-green-300 font-bold uppercase text-[9px] flex gap-1 items-center">
                                    <CheckCircle size={10} /> Active
                                  </Badge>
                                ) : (
                                  <Badge className="bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300 font-bold uppercase text-[9px] flex gap-1 items-center">
                                    <XCircle size={10} /> Inactive
                                  </Badge>
                                )}
                              </button>
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCopyLink(b.code)}
                                  className="h-8 w-8 p-0"
                                  title="Copy Enrollment URL"
                                >
                                  <Copy size={14} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(b.id, b.name)}
                                  disabled={count > 0}
                                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive disabled:opacity-30 disabled:cursor-not-allowed"
                                  title={count > 0 ? "Purge blocked: batch contains personnel" : "Purge Batch"}
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

        </div>

      </div>
    </AppShell>
  );
}
