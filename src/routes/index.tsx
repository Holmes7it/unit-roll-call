import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/Layout";
import {
  useSoldiers,
  usePlatoons,
  generateId,
  RANKS,
  STATUSES,
  BLOOD_TYPES,
  GENDERS,
  PLACEHOLDER_PHOTO,
  type Soldier,
} from "@/lib/soldiers";
import {
  UserPlus,
  Upload,
  User,
  Shield,
  Phone,
  FileText,
  Save,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Enroll Personnel — Unit Registry" }] }),
  component: AddSoldier,
});

const empty = (): Omit<Soldier, "id" | "createdAt"> => ({
  serviceNumber: "",
  rank: "Private",
  lastName: "",
  firstName: "",
  dateOfBirth: "",
  gender: "Male",
  nationality: "Ghanaian",
  unitName: "3rd Infantry Battalion",
  unit: "Alpha",
  role: "",
  dateEnlisted: "",
  status: "Active",
  bloodType: "O+",
  contactPhone: "",
  nextOfKinName: "",
  nextOfKinPhone: "",
  notes: "",
  photo: "",
});

function AddSoldier() {
  const { addSoldier } = useSoldiers();
  const { platoons } = usePlatoons();
  const [form, setForm] = useState(empty());
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set("photo", String(reader.result));
    reader.readAsDataURL(file);
  };

  const clear = () => {
    setForm(empty());
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const soldier: Soldier = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      ...form,
      photo: form.photo || PLACEHOLDER_PHOTO,
    };
    addSoldier(soldier);
    const msg = `${soldier.rank} ${soldier.lastName} ${soldier.firstName} (${soldier.serviceNumber}) has been successfully enrolled.`;
    toast.success("Enrollment Successful", { description: msg });
    clear();
  };

  return (
    <AppShell>
      <div className="px-6 md:px-10 py-10 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div>
          <div className="flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-widest mb-2">
            <UserPlus size={14} />
            Registry Intake
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Personnel Enrollment</h1>
          <p className="text-muted-foreground mt-1">Register new tactical personnel into the unit database.</p>
        </div>

        <form onSubmit={submit} className="space-y-6 pb-20">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
            <CardHeader className="border-b border-border/50 bg-muted/20">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-2 border-border shadow-md group-hover:border-accent/50 transition-colors">
                    <AvatarImage src={form.photo || PLACEHOLDER_PHOTO} className="object-cover" />
                    <AvatarFallback className="bg-muted">
                      <User size={32} className="text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                  >
                    <Upload size={24} className="text-foreground" />
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" onChange={onPhoto} className="hidden" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Identity Verification</CardTitle>
                  <CardDescription>Upload a official service photograph for the profile.</CardDescription>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 h-8 text-[10px] font-bold uppercase tracking-wider"
                    onClick={() => fileRef.current?.click()}
                  >
                    Select Image
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8 space-y-8">
              {/* Personal Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                  <User size={16} className="text-accent" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-foreground/70">Personal Credentials</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-tighter">Surname</Label>
                    <Input required value={form.lastName} onChange={(e) => set("lastName", e.target.value)} placeholder="e.g. Mensah" className="bg-background/50 border-border/50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-tighter">First Name</Label>
                    <Input required value={form.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder="e.g. Kwame" className="bg-background/50 border-border/50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-tighter">Date of Birth</Label>
                    <Input type="date" value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} className="bg-background/50 border-border/50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-tighter">Gender</Label>
                    <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
                      <SelectTrigger className="bg-background/50 border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GENDERS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-tighter">Blood Type</Label>
                    <Select value={form.bloodType} onValueChange={(v) => set("bloodType", v)}>
                      <SelectTrigger className="bg-background/50 border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BLOOD_TYPES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-tighter">Nationality</Label>
                    <Input value={form.nationality} onChange={(e) => set("nationality", e.target.value)} className="bg-background/50 border-border/50" />
                  </div>
                </div>
              </div>

              {/* Service Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                  <Shield size={16} className="text-accent" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-foreground/70">Service Record</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-tighter">Service Number</Label>
                    <Input required value={form.serviceNumber} onChange={(e) => set("serviceNumber", e.target.value)} placeholder="GH-2024-XXX" className="bg-background/50 border-border/50 font-mono text-xs uppercase" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-tighter">Current Rank</Label>
                    <Select value={form.rank} onValueChange={(v) => set("rank", v)}>
                      <SelectTrigger className="bg-background/50 border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RANKS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-tighter">Assigned Unit</Label>
                    <Select value={form.unit} onValueChange={(v) => set("unit", v)}>
                      <SelectTrigger className="bg-background/50 border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {platoons.map((p) => <SelectItem key={p} value={p}>{p} Unit</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-tighter">Operational Role</Label>
                    <Input value={form.role} onChange={(e) => set("role", e.target.value)} placeholder="e.g. Squad Leader" className="bg-background/50 border-border/50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-tighter">Enlistment Date</Label>
                    <Input type="date" value={form.dateEnlisted} onChange={(e) => set("dateEnlisted", e.target.value)} className="bg-background/50 border-border/50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-tighter">Service Status</Label>
                    <Select value={form.status} onValueChange={(v) => set("status", v as any)}>
                      <SelectTrigger className="bg-background/50 border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                  <Phone size={16} className="text-accent" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-foreground/70">Emergency Contact Protocols</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-tighter">Primary Contact Phone</Label>
                    <Input value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} placeholder="+233 XX XXX XXXX" className="bg-background/50 border-border/50" />
                  </div>
                  <div className="hidden md:block" />
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-tighter">Next of Kin Name</Label>
                    <Input value={form.nextOfKinName} onChange={(e) => set("nextOfKinName", e.target.value)} placeholder="Full Name" className="bg-background/50 border-border/50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-tighter">Next of Kin Phone</Label>
                    <Input value={form.nextOfKinPhone} onChange={(e) => set("nextOfKinPhone", e.target.value)} placeholder="+233 XX XXX XXXX" className="bg-background/50 border-border/50" />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                  <FileText size={16} className="text-accent" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-foreground/70">Tactical Notes & Remarks</h3>
                </div>
                <Textarea
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Additional service notes, marksmanship scores, or special qualifications..."
                  className="min-h-[120px] bg-background/50 border-border/50 resize-none"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={clear}
              className="font-bold gap-2 text-muted-foreground hover:text-destructive"
            >
              <Trash2 size={16} />
              Reset Form
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:opacity-90 font-bold gap-2 px-8 h-12 shadow-lg"
            >
              <Save size={18} />
              Commit to Registry
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
