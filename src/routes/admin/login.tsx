import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/Layout";
import { ADMIN_PASSWORD, ADMIN_SESSION_KEY } from "@/lib/soldiers";
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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      window.sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
      router.navigate({ to: "/admin/overview" });
    } else {
      setErr("Incorrect access code. Please verify credentials.");
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
            <CardFooter className="flex flex-col gap-4 pb-8">
              <Button type="submit" className="w-full font-bold h-11 bg-primary hover:opacity-90">
                Establish Connection
              </Button>
              <p className="text-[10px] text-muted-foreground text-center uppercase tracking-widest leading-relaxed">
                Hint: system default is <code className="bg-muted px-1.5 py-0.5 rounded font-bold text-foreground">unit2024</code>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
