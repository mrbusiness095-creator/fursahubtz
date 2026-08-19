import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { RegisterDialog } from "@/components/fursa/RegisterDialog";
import { CustomerServiceButton } from "@/components/fursa/AppShell";
import { JOBS } from "@/lib/fursa-data";

export const Route = createFileRoute("/ajira-nje/$jobId")({
  loader: ({ params }) => {
    const job = JOBS.find((j) => j.id === params.jobId);
    if (!job) throw notFound();
    return { job };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Ajira Haipatikani — FursaHub" }, { name: "robots", content: "noindex" }],
      };
    }
    const { job } = loaderData;
    const title = `${job.title} — ${job.country} | FursaHub`;
    const desc = `${job.employer} inatafuta ${job.title} ${job.city}, ${job.country}. Mshahara ${job.salary}.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  component: JobDetails,
});

function JobDetails() {
  const { job } = Route.useLoaderData();
  const [locked, setLocked] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="mx-auto w-full max-w-md">
        <header className="bg-gradient-green px-5 pt-7 pb-12 text-primary-foreground">
          <Link to="/ajira-nje" className="text-sm font-semibold">
            ← Rudi Kwenye Ajira
          </Link>
          <div className="mt-4 flex items-start gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary-foreground/15 text-2xl">
              {job.flag}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl leading-tight font-extrabold">{job.title}</h1>
              <p className="truncate text-xs text-primary-foreground/85">
                {job.employer} · {job.city}, {job.country}
              </p>
            </div>
          </div>
        </header>

        <main className="-mt-6 space-y-3 px-4">
          <section className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-card p-3 shadow-card">
              <p className="text-[10px] text-muted-foreground">Mshahara</p>
              <p className="text-[13px] font-extrabold text-primary">{job.salary}</p>
            </div>
            <div className="rounded-2xl bg-card p-3 shadow-card">
              <p className="text-[10px] text-muted-foreground">Aina ya Kazi</p>
              <p className="text-[13px] font-bold text-foreground">{job.type}</p>
            </div>
          </section>

          <section className="rounded-3xl bg-card p-4 shadow-card">
            <h2 className="text-sm font-extrabold text-foreground">Maelezo ya Kazi</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {job.description}
            </p>
          </section>

          <section className="rounded-3xl bg-card p-4 shadow-card">
            <h2 className="text-sm font-extrabold text-foreground">Sifa Zinazohitajika</h2>
            <ul className="mt-2 space-y-2">
              {job.requirements.map((r) => (
                <li key={r} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary">✓</span>
                  <span className="min-w-0">{r}</span>
                </li>
              ))}
            </ul>
          </section>

          <button
            onClick={() => setLocked(true)}
            className="w-full rounded-2xl bg-gradient-green py-4 text-sm font-extrabold text-primary-foreground shadow-card"
          >
            APPLY NOW
          </button>
        </main>
      </div>

      <CustomerServiceButton />

      <RegisterDialog
        open={locked}
        onClose={() => setLocked(false)}
        title="Huwezi Kuomba Ajira"
        message="Lazima uwe na Account Active ili uweze kuomba ajira kupitia FursaHub. Jisajili kisha Activate account kwa 14,500Tzs Tu."
        backLabel="← Rudi Kwenye Ajira"
      />
    </div>
  );
}
