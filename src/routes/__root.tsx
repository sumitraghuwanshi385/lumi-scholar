import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Link } from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center mesh-bg px-4">
      <div className="aurora-3 fixed inset-0 -z-10"><span /><span /><span /><span /></div>
      <div className="glass-glow rounded-3xl max-w-md text-center p-10">
        <h1 className="text-7xl font-display font-bold text-gradient">404</h1>
        <h2 className="mt-4 text-xl font-display font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Looks like this page wandered off campus.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl gradient-violet glow-violet px-5 py-2.5 text-sm font-semibold text-white hover-lift"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "AurorIQ — AI Student Performance & Analytics" },
      { name: "description", content: "Unlock every student's potential with AI-powered insights, predictions and personalized learning paths." },
      { name: "author", content: "AurorIQ" },
      { property: "og:title", content: "AurorIQ — AI Student Performance & Analytics" },
      { property: "og:description", content: "AI-powered student performance, attendance and learning analytics." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <ThemeProvider>
      <Outlet />
      <Toaster />
    </ThemeProvider>
  );
}
