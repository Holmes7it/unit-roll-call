import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/Layout";
import { storeAdminPassword } from "@/lib/admin-session";
import { verifyAdminPassword } from "@/lib/registry.functions";
import { Lock, ShieldCheck, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Command Access — Unit Registry" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { ok } = await verifyAdminPassword({ data: { password } });
      if (ok) {
        storeAdminPassword(password);
        router.navigate({ to: "/admin/overview" });
      } else {
        setErr("Incorrect access code. Please verify credentials.");
      }
    } catch {
      setErr("Authentication service unavailable. Please try again.");
    }
  };

  return (
    <AppShell>
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-10 animate-in fade-in duration-700">
        <div className="mb-8 flex flex-col items-center">
          <div className="rounded-2xl tactical-gradient p-3 shadow-xl mb-4">
            <ShieldCheck size={40} className="text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Command Access</h1>
          <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-[0.3em] mt-2">Restricted Area</p>
        </div>

        <Card className="w-full max-w-sm border-border/50 shadow-2xl bg-card/50 backdrop-blur-sm overflow-hidden">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl font-bold">Authentication Required</CardTitle>
            <CardDescription>Enter the unit access code to proceed.</CardDescription>
          </CardHeader>
          <form onSubmit={submit}>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    type="password"
                    placeholder="Access Code"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErr("");
                    }}
                    className="pl-10 bg-background/50 border-border/50"
                    autoFocus
                  />
                </div>
              </div>

              {err && (
                <Alert variant="destructive" className="animate-in shake-in duration-300">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Access Denied</AlertTitle>
                  <AlertDescription>{err}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="pb-8">
              <Button type="submit" className="w-full font-bold h-11 bg-primary hover:opacity-90">
                Establish Connection
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
