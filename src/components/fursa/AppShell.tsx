import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SUPPORT_NUMBER, SUPPORT_MESSAGE } from "@/lib/fursa-data";
import csAvatar from "@/assets/cs-avatar.png";
import { InstallAppButton } from "./InstallAppButton";


const NAV = [
  { to: "/", label: "Home", icon: "🏠" },
  { to: "/chat-earn", label: "Chat", icon: "💬" },
  { to: "/mikopo", label: "Mikopo", icon: "💰" },
  { to: "/ajira-nje", label: "Ajira", icon: "🌍" },
  { to: "/account", label: "Account", icon: "👤" },
] as const;

export function CustomerServiceButton() {
  return (
    <a
      href={`sms:${SUPPORT_NUMBER}?body=${encodeURIComponent(SUPPORT_MESSAGE)}`}
      aria-label="Customer Service"
      className="fixed right-3 bottom-24 z-40 flex items-center gap-3 rounded-2xl bg-card p-2.5 pl-3 shadow-float ring-1 ring-primary/20"
    >
      <div className="relative">
        <img
          src={csAvatar}
          alt="Customer Service"
          width={40}
          height={40}
          className="h-10 w-10 rounded-full object-cover ring-2 ring-primary"
          loading="lazy"
        />
        <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-card" />
      </div>
      <div className="pr-1">
        <p className="text-xs font-extrabold text-foreground">Msaada</p>
        <p className="text-[10px] font-semibold text-primary">Customer Service</p>
      </div>
    </a>
  );
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
      <CustomerServiceButton />
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
