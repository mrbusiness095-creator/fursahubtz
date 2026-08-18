import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/fursa/AppShell";
import { JOBS, JOB_COUNTRIES } from "@/lib/fursa-data";

export const Route = createFileRoute("/ajira-nje/")({
  head: () => ({
    meta: [
      { title: "Ajira Nje — FursaHub" },
      {
        name: "description",
        content:
          "Nafasi za ajira nje ya nchi: UAE, Saudi Arabia, Qatar, Canada, UK, Germany, Australia na USA.",
      },
      { property: "og:title", content: "Ajira Nje — FursaHub" },
      { property: "og:description", content: "Find jobs around the world na FursaHub." },
    ],
  }),
  component: AjiraPage,
});

function AjiraPage() {
  const [active, setActive] = useState<string | null>(null);
  const jobs = active ? JOBS.filter((j) => j.country === active) : JOBS;

  return (
    <AppShell>
      <PageHeader emoji="🌍" title="Ajira Nje" subtitle="Find Jobs Around the World" />

      <main className="-mt-5 px-4">
        <section className="rounded-3xl bg-card p-4 shadow-card">
          <p className="text-sm font-extrabold text-foreground">Countries</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {JOB_COUNTRIES.map((c) => {
              const on = active === c.country;
              return (
                <button
                  key={c.country}
                  onClick={() => setActive(on ? null : c.country)}
                  className={`flex min-w-0 items-center gap-2 rounded-2xl px-3 py-2.5 text-xs font-bold ${
                    on
                      ? "bg-gradient-green text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <span className="shrink-0 text-base">{c.flag}</span>
                  <span className="truncate">{c.country}</span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="flex items-center justify-between px-1 py-3">
          <p className="text-sm font-extrabold text-foreground">Nafasi za Kazi</p>
          <p className="text-xs text-muted-foreground">{jobs.length} nafasi</p>
        </div>

        <div className="space-y-3">
          {jobs.map((j) => (
            <Link
              key={j.id}
              to="/ajira-nje/$jobId"
              params={{ jobId: j.id }}
              className="block rounded-3xl bg-card p-4 shadow-card"
            >
              <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-secondary text-xl">
                  {j.flag}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold text-foreground">{j.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {j.employer} · {j.city}, {j.country}
                  </p>
                  <p className="mt-1 truncate text-[11px] font-semibold text-muted-foreground">
                    {j.type}
                  </p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <p className="truncate text-sm font-extrabold text-primary">{j.salary}</p>
                <span className="shrink-0 rounded-2xl bg-gradient-green px-4 py-2.5 text-xs font-extrabold text-primary-foreground">
                  View
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </AppShell>
  );
}
