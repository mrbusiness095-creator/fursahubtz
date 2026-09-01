import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { InstallAppButton } from "./InstallAppButton";
import { FursaHubAssistance } from "./FursaHubAssistance";


const NAV = [
  { to: "/", label: "Home", icon: "🏠" },
  { to: "/chat-earn", label: "Chat", icon: "💬" },
  { to: "/mikopo", label: "Mikopo", icon: "💰" },
  { to: "/ajira-nje", label: "Ajira", icon: "🌍" },
  { to: "/account", label: "Account", icon: "👤" },
] as const;

export function CustomerServiceButton() {
  return <FursaHubAssistance />;
}

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-5 px-1 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: item.to === "/" }}
            className="flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-semibold text-muted-foreground transition-colors data-[status=active]:text-primary"
          >
            <span className="text-lg leading-none">{item.icon}</span>
            <span className="truncate">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="mx-auto w-full max-w-md">{children}</div>
      <InstallAppButton />
      <FursaHubAssistance />
      <BottomNav />
    </div>
  );
}


export function PageHeader({
  title,
  subtitle,
  emoji,
}: {
  title: string;
  subtitle?: string;
  emoji?: string;
}) {
  return (
    <header className="bg-gradient-green px-5 pt-8 pb-10 text-primary-foreground">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary-foreground/15 text-xl">
          {emoji ?? "🌟"}
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-extrabold">{title}</h1>
          {subtitle ? (
            <p className="truncate text-xs text-primary-foreground/80">{subtitle}</p>
          ) : null}
        </div>
      </div>
    </header>
  );
}
