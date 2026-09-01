import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, PageHeader } from "@/components/fursa/AppShell";
import { getFursaUser, ACTIVATION_FEE } from "@/lib/fursa-auth";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "Account — FursaHub" }, { name: "description", content: "Akaunti yako ya FursaHub." }] }),
  component: AccountPage,
});

function AccountPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getFursaUser());
  useEffect(() => {
    const sync = () => setUser(getFursaUser());
    window.addEventListener("fursahub-user-updated", sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener("fursahub-user-updated", sync); window.removeEventListener("storage", sync); };
  }, []);

  return <AppShell><PageHeader emoji="👤" title="Account" subtitle="Akaunti yako ya FursaHub" /><main className="-mt-5 space-y-3 px-4">
    <section className="rounded-3xl bg-card p-5 text-center shadow-card"><div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-secondary text-3xl">👤</div><p className="mt-3 text-base font-extrabold text-foreground">{user?.name || "Mgeni"}</p><p className="text-xs text-muted-foreground">{user?.username || "Akaunti haijaanzishwa"}</p><span className="mt-3 inline-block rounded-full bg-muted px-3 py-1 text-[11px] font-bold text-muted-foreground">Status: {user?.paid ? "ACTIVE" : "INACTIVE"}</span>{user ? <Link to={user.paid ? "/dashboard" : "/payment"} className="mt-4 block w-full rounded-2xl bg-gradient-green py-3.5 text-sm font-extrabold text-primary-foreground">{user.paid ? "Open Dashboard" : `Lipia TZS ${ACTIVATION_FEE.toLocaleString()}`}</Link> : <button onClick={() => navigate({ to: "/register" })} className="mt-4 block w-full rounded-2xl bg-gradient-green py-3.5 text-sm font-extrabold text-primary-foreground">👤 Jisajili Sasa</button>}</section>
    <section className="rounded-3xl bg-card p-4 shadow-card"><div className="grid grid-cols-3 gap-2 text-center">{[{k:"Balance",v:`TZS ${(user?.balance ?? 0).toLocaleString()}`},{k:"Chats",v:String(user?.chats ?? 0)},{k:"Activation",v:user?.paid?"PAID":"PENDING"}].map(x=><div key={x.k} className="rounded-2xl bg-muted px-2 py-3"><p className="text-sm font-extrabold text-primary">{x.v}</p><p className="text-[10px] text-muted-foreground">{x.k}</p></div>)}</div></section>
  </main></AppShell>;
}
