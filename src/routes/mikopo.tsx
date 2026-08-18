import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/fursa/AppShell";
import { RegisterDialog } from "@/components/fursa/RegisterDialog";
import { LOANS } from "@/lib/fursa-data";

export const Route = createFileRoute("/mikopo")({
  head: () => ({
    meta: [
      { title: "Pata Mkopo — FursaHub" },
      {
        name: "description",
        content:
          "Omba mkopo kwa urahisi: mikopo ya haraka, biashara, mshahara, kilimo na bodaboda kupitia FursaHub.",
      },
      { property: "og:title", content: "Pata Mkopo — FursaHub" },
      { property: "og:description", content: "Mikopo ya haraka kwa masharti nafuu." },
    ],
  }),
  component: MikopoPage,
});

function MikopoPage() {
  const [locked, setLocked] = useState(false);

  return (
    <AppShell>
      <PageHeader
        emoji="💰"
        title="Pata Mkopo"
        subtitle="Omba Mkopo kwa Urahisi"
      />

      <main className="-mt-5 space-y-3 px-4">
        {LOANS.map((l) => (
          <article key={l.id} className="rounded-3xl bg-card p-4 shadow-card">
            <div className="flex items-start gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-secondary text-xl">
                {l.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold text-foreground">{l.title}</p>
                <p className="text-xs text-muted-foreground">{l.desc}</p>
              </div>
            </div>

            <dl className="mt-3 grid grid-cols-3 gap-2">
              {[
                { k: "Kiasi", v: l.amount },
                { k: "Muda", v: l.duration },
                { k: "Riba", v: l.fees },
              ].map((x) => (
                <div key={x.k} className="rounded-2xl bg-muted px-2.5 py-2">
                  <dt className="text-[10px] text-muted-foreground">{x.k}</dt>
                  <dd className="text-[11px] leading-tight font-bold text-foreground">{x.v}</dd>
                </div>
              ))}
            </dl>

            <button
              onClick={() => setLocked(true)}
              className="mt-3 w-full rounded-2xl bg-gradient-green py-3 text-sm font-extrabold text-primary-foreground shadow-card"
            >
              Apply
            </button>
          </article>
        ))}
      </main>

      <RegisterDialog
        open={locked}
        onClose={() => setLocked(false)}
        title="Huwezi Kupata Mkopo"
        message="Huwezi kupata mkopo bila kuwa na Account Active kwenye FursaHub."
        backLabel="← Rudi Kwenye Mikopo"
      />
    </AppShell>
  );
}
