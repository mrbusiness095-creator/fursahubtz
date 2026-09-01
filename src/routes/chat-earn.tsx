import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/fursa/AppShell";
import { RegisterDialog } from "@/components/fursa/RegisterDialog";
import { generateProfiles, money, type Profile } from "@/lib/fursa-data";
import { getFursaUser, MIN_WITHDRAWAL } from "@/lib/fursa-auth";

export const Route = createFileRoute("/chat-earn")({
  head: () => ({
    meta: [
      { title: "Chat & Earn — FursaHub" },
      {
        name: "description",
        content:
          "Pata malipo kwa kuchati na wageni kutoka nchi mbalimbali kuhusu mada tofauti. Chat, Connect & Earn na FursaHub.",
      },
      { property: "og:title", content: "Chat & Earn — FursaHub" },
      {
        property: "og:description",
        content: "Get paid by chatting with foreigners about different topics.",
      },
    ],
  }),
  component: ChatEarnPage,
});

function ChatEarnPage() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [liveUsers, setLiveUsers] = useState(1284);
  const [locked, setLocked] = useState(false);
  const [user, setUser] = useState(getFursaUser());

  useEffect(() => {
    const sync = () => setUser(getFursaUser());
    window.addEventListener("fursahub-user-updated", sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener("fursahub-user-updated", sync); window.removeEventListener("storage", sync); };
  }, []);

  useEffect(() => {
    setProfiles(generateProfiles(14));
    setLiveUsers(900 + Math.floor(Math.random() * 900));
    const t = setInterval(
      () => setLiveUsers((n) => Math.max(600, n + Math.floor(Math.random() * 11) - 5)),
      3000,
    );
    return () => clearInterval(t);
  }, []);

  return (
    <AppShell>
      <header className="bg-gradient-green px-5 pt-8 pb-14 text-primary-foreground">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary-foreground/15 text-lg">
              💬
            </div>
            <p className="truncate text-lg font-extrabold">FursaHub</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1.5 text-xs font-bold">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary-glow" />
            {liveUsers.toLocaleString("en-US")} live
          </div>
        </div>

        <div className="mt-6 rounded-3xl bg-primary-foreground/12 p-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="min-w-0">
              <p className="text-[11px] text-primary-foreground/80">Current Balance</p>
              <p className="truncate text-2xl font-extrabold">TZS {(user?.balance ?? 0).toLocaleString()}</p>
            </div>
            <button
              onClick={() => { if (user?.paid && user.balance >= MIN_WITHDRAWAL) navigate({ to: "/dashboard" }); else setLocked(true); }}
              className="shrink-0 rounded-2xl bg-primary-foreground px-4 py-2.5 text-xs font-extrabold text-primary"
            >
              {user?.balance && user.balance >= MIN_WITHDRAWAL ? "Withdraw" : `Withdraw ≥ ${MIN_WITHDRAWAL.toLocaleString()}`}
            </button>
          </div>
        </div>

        <h1 className="mt-6 text-[22px] leading-tight font-extrabold">
          Get paid by chatting with foreigners about different topics
        </h1>
        <p className="mt-2 text-sm text-primary-foreground/85">
          Chagua mgeni yeyote hapa chini, anza mazungumzo kwa muda uliopangwa na ulipwe pesa
          moja kwa moja. Wageni wanataka kujifunza Kiswahili na utamaduni wa Tanzania.
        </p>
      </header>

      <main className="-mt-8 px-4">
        <div className="flex items-center justify-between px-1 pb-3">
          <p className="text-sm font-extrabold text-foreground">AVAILABLE NOW</p>
          <p className="text-xs text-muted-foreground">{profiles.length} wageni</p>
        </div>

        <div className="space-y-3">
          {profiles.map((p) => (
            <article key={p.seed} className="rounded-3xl bg-card p-4 shadow-card">
              <div className="flex items-start gap-3">
                <img
                  src={p.photo}
                  alt={`${p.name} kutoka ${p.country}`}
                  loading="lazy"
                  className="h-14 w-14 shrink-0 rounded-2xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="text-base">{p.flag}</span>
                    <p className="truncate text-sm font-extrabold text-foreground">{p.name}</p>
                    <span className="shrink-0 text-xs text-gold">⭐ {p.rating}</span>
                  </div>
                  <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
                    {p.country}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-primary">
                    <span
                      className={`h-2 w-2 rounded-full ${p.online ? "bg-primary" : "bg-muted-foreground"}`}
                    />
                    {p.online ? "Online" : "Away"} · {p.minutes} minutes
                  </p>
                </div>
              </div>

              <div className="mt-3 rounded-2xl bg-muted px-3 py-2">
                <p className="text-[11px] text-muted-foreground">Topic</p>
                <p className="truncate text-[13px] font-bold text-foreground">{p.topic}</p>
              </div>

              <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground">Malipo</p>
                  <p className="truncate text-base font-extrabold text-primary">
                    {money(p.amount)}
                  </p>
                </div>
                <button
                  onClick={() => navigate({ to: "/chat/$seed", params: { seed: p.seed } })}
                  className="shrink-0 rounded-2xl bg-gradient-green px-5 py-3 text-xs font-extrabold text-primary-foreground shadow-card"
                >
                  START CHAT
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>

      <RegisterDialog
        open={locked}
        onClose={() => setLocked(false)}
        title="Withdrawal"
        message="Withdrawal inaruhusiwa kuanzia TZS 50,000. Ukifikisha kiasi hicho, fungua Dashboard kuendelea na Withdrawal."
        backLabel="← Rudi Kwenye Chat"
      />
    </AppShell>
  );
}
