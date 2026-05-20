import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/Layout";
import {
  useSoldiers,
  usePlatoons,
  isAdminLoggedIn,
  STATUSES,
  RANKS,
  BLOOD_TYPES,
  GENDERS,
  STATUS_BADGE,
  formatDate,
  PLACEHOLDER_PHOTO,
  type Soldier,
} from "@/lib/soldiers";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Save,
  X,
  Shield,
  User,
  Activity,
  Phone,
  FileText,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/admin/soldiers/$id")({
  head: () => ({ meta: [{ title: "Personnel Review — Unit Registry" }] }),
  component: SoldierProfile,
});

function SoldierProfile() {
  const { id } = Route.useParams();
  const router = useRouter();
  const { soldiers, ready, updateSoldier, deleteSoldier } = useSoldiers();
  const { platoons } = usePlatoons();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Soldier | null>(null);
  const [confirmDel, setConfirmDel] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!isAdminLoggedIn()) router.navigate({ to: "/admin/login" });
    else setAuthChecked(true);
  }, [router]);

  const soldier = soldiers.find((s) => s.id === id);

  useEffect(() => {
    if (soldier) setForm(soldier);
  }, [soldier]);

  if (!authChecked || !ready) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppShell>
    );
  }

  if (!soldier) {
    return (
      <AppShell>
        <div className="p-10 max-w-3xl mx-auto flex flex-col items-center justify-center text-center space-y-4">
          <div className="rounded-full bg-muted p-6">
            <X size={48} className="text-muted-foreground opacity-20" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">Personnel Not Found</h2>
          <p className="text-muted-foreground">The requested service record does not exist or has been archived.</p>
          <Button asChild variant="outline" className="font-bold gap-2">
            <Link to="/admin">
              <ArrowLeft size={16} />
              Return to Command
            </Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !form) return;
    const reader = new FileReader();
    reader.onload = () => setForm({ ...form, photo: String(reader.result) });
    reader.readAsDataURL(file);
  };

  const save = () => {
    if (!form) return;
    updateSoldier(id, form);
    setEditing(false);
    toast.success("Profile Updated", {
      description: `Service record for ${form.rank} ${form.lastName} has been committed.`,
    });
  };

  const remove = () => {
    const name = `${soldier.firstName} ${soldier.lastName}`;
    deleteSoldier(id);
    toast.success("Personnel Removed", {
      description: `${name} has been purged from the registry.`,
    });
    router.navigate({ to: "/admin" });
  };

  const data = editing && form ? form : soldier;

  return (
    <AppShell>
      <div className="px-6 md:px-10 py-10 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <Button asChild variant="ghost" size="sm" className="text-accent hover:text-accent font-bold gap-2 -ml-2">
              <Link to="/admin">
                <ArrowLeft size={16} />
                Command Dashboard
              </Link>
            </Button>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-border shadow-md">
                <AvatarImage src={data.photo || PLACEHOLDER_PHOTO} className="object-cover" />
                <AvatarFallback className="bg-muted">
                  <User size={24} className="text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-black text-foreground tracking-tight">
                  {data.rank} {data.lastName} {data.firstName}
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <Badge variant="secondary" className="font-mono text-[10px] tracking-widest bg-muted text-muted-foreground border-border/50">
                    {data.serviceNumber}
                  </Badge>
                  <Badge className={`font-bold text-[10px] uppercase tracking-tighter ${STATUS_BADGE[data.status]}`}>
                    {data.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-center">
            {!editing ? (
              <>
                <Button onClick={() => setEditing(true)} className="font-bold gap-2 bg-primary hover:opacity-90">
                  <Edit size={16} />
                  Modify Profile
                </Button>
                <Button variant="outline" onClick={() => setConfirmDel(true)} className="font-bold gap-2 text-destructive border-destructive/20 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/50">
                  <Trash2 size={16} />
                  Purge Record
                </Button>
              </>
            ) : (
              <>
                <Button onClick={save} className="font-bold gap-2 bg-primary hover:opacity-90">
                  <Save size={16} />
                  Commit Changes
                </Button>
                <Button variant="ghost" onClick={() => { setEditing(false); setForm(soldier); }} className="font-bold gap-2">
                  <X size={16} />
                  Discard
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Identity Column */}
          <div className="space-y-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden shadow-xl">
              <CardHeader className="bg-muted/20 border-b border-border/50">
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <User size={16} className="text-accent" />
                  Identity Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="relative group mx-auto w-full aspect-square max-w-[240px]">
                  <img
                    src={data.photo || PLACEHOLDER_PHOTO}
                    alt=""
                    className="w-full h-full object-cover rounded-2xl border border-border/50 shadow-inner bg-muted"
                  />
                  {editing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                      <label className="cursor-pointer flex flex-col items-center gap-2">
                        <Upload size={24} className="text-foreground" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Update Photo</span>
                        <input type="file" accept="image/*" onChange={onPhoto} className="hidden" />
                      </label>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <InfoRow label="Service Number" value={data.serviceNumber} edit={editing} onChange={(v) => setForm({ ...form!, serviceNumber: v })} />
                  <InfoRow label="Surname" value={data.lastName} edit={editing} onChange={(v) => setForm({ ...form!, lastName: v })} />
                  <InfoRow label="First Name" value={data.firstName} edit={editing} onChange={(v) => setForm({ ...form!, firstName: v })} />
                  <InfoRow label="Gender" value={data.gender} edit={editing} options={GENDERS} onChange={(v) => setForm({ ...form!, gender: v })} />
                  <InfoRow label="Blood Type" value={data.bloodType} edit={editing} options={BLOOD_TYPES} onChange={(v) => setForm({ ...form!, bloodType: v })} />
                  <InfoRow label="Nationality" value={data.nationality} edit={editing} onChange={(v) => setForm({ ...form!, nationality: v })} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Operational & Contact Column */}
          <div className="lg:col-span-2 space-y-6 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Service Info */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
                <CardHeader className="bg-muted/20 border-b border-border/50">
                  <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                    <Shield size={16} className="text-accent" />
                    Service Record
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <InfoRow label="Current Rank" value={data.rank} edit={editing} options={RANKS} onChange={(v) => setForm({ ...form!, rank: v })} />
                  <InfoRow label="Assigned Unit" value={data.unit} edit={editing} options={platoons} onChange={(v) => setForm({ ...form!, unit: v })} />
                  <InfoRow label="Operational Role" value={data.role} edit={editing} onChange={(v) => setForm({ ...form!, role: v })} />
                  <InfoRow label="Service Status" value={data.status} edit={editing} options={STATUSES as any} onChange={(v) => setForm({ ...form!, status: v as any })} />
                  <InfoRow label="Enlistment Date" value={editing ? data.dateEnlisted : formatDate(data.dateEnlisted)} edit={editing} type="date" raw={data.dateEnlisted} onChange={(v) => setForm({ ...form!, dateEnlisted: v })} />
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
                <CardHeader className="bg-muted/20 border-b border-border/50">
                  <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                    <Phone size={16} className="text-accent" />
                    Communications
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <InfoRow label="Primary Phone" value={data.contactPhone} edit={editing} onChange={(v) => setForm({ ...form!, contactPhone: v })} />
                  <div className="h-px bg-border/30 my-2" />
                  <InfoRow label="Next of Kin" value={data.nextOfKinName} edit={editing} onChange={(v) => setForm({ ...form!, nextOfKinName: v })} />
                  <InfoRow label="Kin Contact Phone" value={data.nextOfKinPhone} edit={editing} onChange={(v) => setForm({ ...form!, nextOfKinPhone: v })} />
                </CardContent>
              </Card>
            </div>

            {/* Notes Section */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
              <CardHeader className="bg-muted/20 border-b border-border/50">
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <FileText size={16} className="text-accent" />
                  Tactical Remarks
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {editing ? (
                  <Textarea
                    value={form?.notes ?? ""}
                    onChange={(e) => setForm({ ...form!, notes: e.target.value })}
                    className="min-h-[160px] bg-background/50 border-border/50 resize-none"
                    placeholder="Enter additional service notes..."
                  />
                ) : (
                  <div className="min-h-[100px] p-4 rounded-xl bg-muted/20 border border-border/30 italic text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {data.notes || "No tactical remarks on record."}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <AlertDialog open={confirmDel} onOpenChange={setConfirmDel}>
          <AlertDialogContent className="border-border/50 shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-black tracking-tight">Purge Service Record?</AlertDialogTitle>
              <AlertDialogDescription className="pt-2">
                This action is irreversible. It will permanently remove <strong>{soldier.rank} {soldier.lastName}</strong> from the unit registry and all operational databases.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-6">
              <AlertDialogCancel className="font-bold">Abort Purge</AlertDialogCancel>
              <AlertDialogAction onClick={remove} className="bg-destructive hover:bg-destructive/90 font-bold">
                Confirm Purge
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppShell>
  );
}

function InfoRow({
  label,
  value,
  edit,
  options,
  onChange,
  type,
  raw,
}: {
  label: string;
  value: string;
  edit: boolean;
  options?: readonly string[];
  onChange?: (v: string) => void;
  type?: string;
  raw?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</Label>
      {edit && onChange ? (
        options ? (
          <Select value={raw ?? value} onValueChange={onChange}>
            <SelectTrigger className="h-9 bg-background/50 border-border/50 font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            type={type ?? "text"}
            value={raw ?? value}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 bg-background/50 border-border/50 font-medium"
          />
        )
      ) : (
        <div className="text-sm font-bold text-foreground">
          {value || <span className="text-muted-foreground/30">—</span>}
        </div>
      )}
    </div>
  );
}
