import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/fursa/AppShell";
import { REGISTER_URL, SUPPORT_NUMBER } from "@/lib/fursa-data";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Account — FursaHub" },
      {
        name: "description",
        content:
          "Akaunti yako ya FursaHub: jisajili ili kuanza kupata kipato, mikopo na ajira za nje.",
      },
      { property: "og:title", content: "Account — FursaHub" },
      { property: "og:description", content: "Simamia akaunti yako ya FursaHub." },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  return (
    <AppShell>
      <PageHeader emoji="👤" title="Account" subtitle="Akaunti yako ya FursaHub" />

      <main className="-mt-5 space-y-3 px-4">
        <section className="rounded-3xl bg-card p-5 text-center shadow-card">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-secondary text-3xl">
            👤
          </div>
          <p className="mt-3 text-base font-extrabold text-foreground">Mgeni</p>
          <p className="text-xs text-muted-foreground">Akaunti haijaanzishwa</p>
          <span className="mt-3 inline-block rounded-full bg-muted px-3 py-1 text-[11px] font-bold text-muted-foreground">
            Status: Inactive
          </span>
          <a
            href={REGISTER_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-4 block w-full rounded-2xl bg-gradient-green py-3.5 text-sm font-extrabold text-primary-foreground shadow-card"
          >
            👤 Jisajili Sasa
          </a>
        </section>

        <section className="rounded-3xl bg-card p-4 shadow-card">
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { k: "Balance", v: "TZS 0" },
              { k: "Chats", v: "0" },
              { k: "Maombi", v: "0" },
            ].map((x) => (
              <div key={x.k} className="rounded-2xl bg-muted px-2 py-3">
                <p className="text-sm font-extrabold text-primary">{x.v}</p>
                <p className="text-[10px] text-muted-foreground">{x.k}</p>
              </div>
            ))}
          </div>
        </section>

        <a
          href={`sms:${SUPPORT_NUMBER}`}
          className="flex items-center justify-between rounded-3xl bg-card p-4 shadow-card"
        >
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground">Customer Service</p>
            <p className="truncate text-xs text-muted-foreground">SMS: {SUPPORT_NUMBER}</p>
          </div>
          <span className="shrink-0 text-lg">🎧</span>
        </a>
      </main>
    </AppShell>
  );
}
