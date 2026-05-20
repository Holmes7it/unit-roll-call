import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 animate-in fade-in duration-700">
      <div className="max-w-md text-center">
        <div className="inline-flex items-center justify-center rounded-2xl bg-muted p-6 mb-6">
          <h1 className="text-7xl font-black text-primary tracking-tighter">404</h1>
        </div>
        <h2 className="text-2xl font-black text-foreground tracking-tight">Coordinates Lost</h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          The requested data sector could not be located. It may have been relocated or purged from the registry.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3 text-sm font-black text-primary-foreground shadow-lg hover:opacity-90 transition-all hover:translate-y-[-2px]"
          >
            Return to Command
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 animate-in fade-in duration-700">
      <div className="max-w-md text-center">
        <div className="inline-flex items-center justify-center rounded-2xl bg-destructive/10 p-6 mb-6 text-destructive">
          <AlertCircle size={48} />
        </div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">
          System Interruption
        </h1>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          An unexpected error has occurred within the registry uplink. Protocol failure detected.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-xl bg-primary px-8 py-3 text-sm font-black text-primary-foreground shadow-lg hover:opacity-90 transition-all"
          >
            Re-establish Link
          </Button>
          <Button
            variant="outline"
            asChild
            className="rounded-xl px-8 py-3 text-sm font-black text-foreground shadow-sm hover:bg-accent/5 transition-all"
          >
            <Link to="/">
              Abort to Command
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Unit Log" },
      { name: "description", content: "database for units" },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Unit Log" },
      { property: "og:description", content: "database for units" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Unit Log" },
      { name: "twitter:description", content: "database for units" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/16cc4186-3035-4cff-b82c-416958071e84/id-preview-a660de48--80287c99-05c0-4425-8f2c-d7298697a1e1.lovable.app-1778709729402.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/16cc4186-3035-4cff-b82c-416958071e84/id-preview-a660de48--80287c99-05c0-4425-8f2c-d7298697a1e1.lovable.app-1778709729402.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster />
    </QueryClientProvider>
  );
}
