import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/fursa/AppShell";
import { getFursaUser, MIN_WITHDRAWAL, updateFursaUser, WITHDRAWAL_URL } from "@/lib/fursa-auth";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — FursaHub" }, { name: "description", content: "Dashboard ya FursaHub baada ya activation." }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getFursaUser());
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const current = getFursaUser();
    if (!current) { navigate({ to: "/register" }); return; }
    if (!current.paid) { navigate({ to: "/payment" }); return; }
    setUser(current);
    const sync = () => setUser(getFursaUser());
    window.addEventListener("fursahub-user-updated", sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener("fursahub-user-updated", sync); window.removeEventListener("storage", sync); };
  }, [navigate]);

  function withdraw() {
    setError(null);
    const value = Number(amount.replace(/[^0-9]/g, ""));
    if (value < MIN_WITHDRAWAL) { setError(`Kiasi cha Withdrawal ni kuanzia TZS ${MIN_WITHDRAWAL.toLocaleString()}.`); return; }
    if (value > (user?.balance ?? 0)) { setError("Balance yako haitoshi kwa kiasi hicho."); return; }
    updateFursaUser({ balance: (user?.balance ?? 0) - value });
    window.location.href = WITHDRAWAL_URL;
  }

  if (!user) return null;
  const canWithdraw = user.balance >= MIN_WITHDRAWAL;

  return (
    <AppShell>
      <header className="bg-gradient-green px-5 pt-8 pb-12 text-primary-foreground">
        <div className="flex items-center justify-between"><div><p className="text-xs text-primary-foreground/75">FURSAHUB DASHBOARD</p><h1 className="mt-1 text-2xl font-extrabold">Karibu, {user.name || user.username}</h1></div><span className="rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-bold">ACTIVE ✓</span></div>
        <div className="mt-5 rounded-3xl bg-primary-foreground/10 p-4"><p className="text-xs text-primary-foreground/75">Balance</p><p className="mt-1 text-3xl font-extrabold">TZS {user.balance.toLocaleString()}</p><button disabled={!canWithdraw} onClick={() => setWithdrawOpen(true)} className="mt-4 w-full rounded-2xl bg-primary-foreground py-3 text-sm font-extrabold text-primary disabled:cursor-not-allowed disabled:opacity-50">{canWithdraw ? "Withdraw" : `Withdraw kuanzia TZS ${MIN_WITHDRAWAL.toLocaleString()}`}</button></div>
      </header>

      <main className="-mt-6 space-y-3 px-4 pb-8">
        <section className="grid grid-cols-3 gap-3"><Stat label="Chats" value={String(user.chats)} /><Stat label="Balance" value={`TZS ${user.balance.toLocaleString()}`} /><Stat label="Status" value="ACTIVE" /></section>
        <section className="rounded-3xl bg-card p-5 shadow-card"><h2 className="font-extrabold text-foreground">Endelea Kuchat</h2><p className="mt-1 text-sm text-muted-foreground">Chagua mgeni, kamilisha session ya ujumbe 10 na malipo ya session yataongezwa kwenye Balance.</p><Link to="/chat-earn" className="mt-4 block rounded-2xl bg-gradient-green py-3 text-center text-sm font-extrabold text-primary-foreground">START CHAT</Link></section>
        <section className="rounded-3xl bg-card p-5 shadow-card"><h2 className="font-extrabold text-foreground">Taarifa za akaunti</h2><div className="mt-3 space-y-2 text-sm"><Row label="Username" value={user.username} /><Row label="Simu" value={user.phone} /><Row label="Email" value={user.email} /><Row label="Activation" value="TZS 14,500 · PAID" /></div></section>
      </main>

      {withdrawOpen && <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-4 sm:items-center"><div className="w-full max-w-sm rounded-3xl bg-card p-5 shadow-float"><h2 className="text-lg font-extrabold text-foreground">Withdrawal</h2><p className="mt-1 text-sm text-muted-foreground">Minimum ni TZS {MIN_WITHDRAWAL.toLocaleString()}. Balance: TZS {user.balance.toLocaleString()}.</p><label className="mt-4 block text-xs font-bold text-muted-foreground">Amount</label><input inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="50000" className="mt-1 w-full rounded-2xl border border-border bg-muted px-4 py-3 outline-none focus:border-primary" />{error && <p className="mt-2 text-sm font-semibold text-destructive">{error}</p>}<button onClick={withdraw} className="mt-4 w-full rounded-2xl bg-gradient-green py-3.5 text-sm font-extrabold text-primary-foreground">Endelea na Withdrawal</button><button onClick={() => setWithdrawOpen(false)} className="mt-2 w-full rounded-2xl bg-muted py-3 text-sm font-bold text-foreground">Rudi</button></div></div>}
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl bg-card p-3 text-center shadow-card"><p className="text-xs font-extrabold text-primary">{value}</p><p className="mt-1 text-[10px] text-muted-foreground">{label}</p></div>; }
function Row({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-3 rounded-2xl bg-muted px-3 py-2"><span className="text-muted-foreground">{label}</span><span className="truncate font-bold text-foreground">{value}</span></div>; }
