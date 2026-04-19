import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Users, Sparkles, BarChart3, Bell, Settings, GraduationCap } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import type { ReactNode } from "react";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/students", label: "Students", icon: Users },
  { to: "/insights", label: "AI Insights", icon: Sparkles },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppLayout({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="relative min-h-screen mesh-bg">
      <div className="aurora-3 fixed inset-0 -z-10">
        <span /><span /><span /><span />
      </div>

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 glass border-b border-border/50 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg gradient-aurora glow-violet flex items-center justify-center">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg">AurorIQ</span>
        </Link>
        <ThemeToggle />
      </header>

      <div className="lg:flex">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-20 p-4">
          <div className="glass-glow rounded-3xl flex flex-col h-full p-5">
            <Link to="/" className="flex items-center gap-3 px-2 mb-8">
              <div className="h-10 w-10 rounded-xl gradient-aurora glow-violet flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-display font-bold text-lg leading-tight">AurorIQ</div>
                <div className="text-[11px] text-muted-foreground tracking-wide">STUDENT ANALYTICS</div>
              </div>
            </Link>

            <nav className="flex-1 space-y-1">
              {NAV.map(({ to, label, icon: Icon }) => {
                const active = path.startsWith(to);
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? "gradient-violet text-white glow-violet"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? "" : "group-hover:scale-110 transition-transform"}`} />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full gradient-coral" />
                <div className="text-xs">
                  <div className="font-semibold">Ms. Patel</div>
                  <div className="text-muted-foreground">Math Dept.</div>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 lg:ml-64 px-4 lg:px-8 py-6 lg:py-8 max-w-[1600px] w-full">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-3 left-3 right-3 z-30 glass-glow rounded-2xl px-2 py-2 flex justify-around">
        {NAV.slice(0, 5).map(({ to, icon: Icon, label }) => {
          const active = path.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                active ? "gradient-violet text-white" : "text-muted-foreground"
              }`}
              aria-label={label}
            >
              <Icon className="h-4 w-4" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
