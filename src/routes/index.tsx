import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/fursa/AppShell";
import { SUPPORT_NUMBER, SUPPORT_MESSAGE } from "@/lib/fursa-data";
import csAvatar from "@/assets/cs-avatar.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FursaHub — Fursa za Kipato, Mikopo na Ajira" },
      {
        name: "description",
        content:
          "FursaHub inakuunganisha na fursa za kipato kwa kuchati, mikopo ya haraka na ajira za nje ya nchi.",
      },
      { property: "og:title", content: "FursaHub — Fursa za Kipato, Mikopo na Ajira" },
      {
        property: "og:description",
        content: "Chat & Earn, Pata Mkopo na Ajira Nje — yote sehemu moja.",
      },
    ],
  }),
  component: Index,
});

const SERVICES = [
  {
    to: "/chat-earn",
    icon: "💬",
    title: "CHAT & EARN",
    sub: "Chat, Connect & Earn",
    desc: "Chati na wageni kutoka nje na upate malipo.",
    theme: "chat",
    blink: "animate-blink",
  },
  {
    to: "/mikopo",
    icon: "💰",
    title: "PATA MKOPO",
    sub: "Omba Mkopo kwa Urahisi",
    desc: "Mikopo ya haraka bila usumbufu.",
    theme: "loan",
    blink: "animate-blink-delay-1",
  },
  {
    to: "/ajira-nje",
    icon: "🌍",
    title: "AJIRA NJE",
    sub: "Find Jobs Around the World",
    desc: "Nafasi za kazi UAE, Canada, UK na zaidi.",
    theme: "job",
    blink: "animate-blink-delay-2",
  },
] as const;

function Index() {
  return (
    <AppShell>
      <header className="bg-gradient-green px-5 pt-10 pb-16 text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary-foreground/15 text-2xl">
            🌍
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-extrabold tracking-tight">FursaHub</p>
            <p className="text-xs text-primary-foreground/80">Karibu kwenye fursa zako</p>
          </div>
        </div>
        <h1 className="mt-6 text-[26px] leading-tight font-extrabold">
          Fursa za Kipato, Mikopo na Ajira Duniani.
        </h1>
        <p className="mt-2 text-sm text-primary-foreground/85">
          Jiunge na maelfu ya Watanzania wanaotumia FursaHub kupata kipato, mikopo na ajira za
          kimataifa.
        </p>
      </header>

      <main className="-mt-9 space-y-4 px-4">
        {SERVICES.map((s) => {
          const themeClasses = {
            chat: {
              iconBg: "bg-chat-card-light text-chat-card",
              text: "text-chat-card",
              gradient: "bg-gradient-chat",
            },
            loan: {
              iconBg: "bg-loan-card-light text-loan-card",
              text: "text-loan-card",
              gradient: "bg-gradient-loan",
            },
            job: {
              iconBg: "bg-job-card-light text-job-card",
              text: "text-job-card",
              gradient: "bg-gradient-job",
            },
          }[s.theme];
          return (
            <Link
              key={s.to}
              to={s.to}
              className={`${s.blink} flex items-center gap-4 rounded-3xl bg-card p-4 shadow-card transition-transform active:scale-[0.98]`}
            >
              <div
                className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-2xl ${themeClasses.iconBg}`}
              >
                {s.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm font-extrabold ${themeClasses.text}`}>
                  {s.title}
                </p>
                <p className="truncate text-[13px] font-semibold text-foreground">{s.sub}</p>
                <p className="truncate text-xs text-muted-foreground">{s.desc}</p>
              </div>
              <span className={`shrink-0 text-lg ${themeClasses.text}`}>›</span>
            </Link>
          );
        })}

        <section className="grid grid-cols-3 gap-3 pt-2">
          {[
            { v: "12,480+", l: "Watumiaji" },
            { v: "TZS 89M", l: "Zimelipwa" },
            { v: "320+", l: "Ajira" },
          ].map((x) => (
            <div key={x.l} className="rounded-2xl bg-card p-3 text-center shadow-card">
              <p className="text-sm font-extrabold text-primary">{x.v}</p>
              <p className="text-[10px] text-muted-foreground">{x.l}</p>
            </div>
          ))}
        </section>

        <a
          href={`sms:${SUPPORT_NUMBER}?body=${encodeURIComponent(SUPPORT_MESSAGE)}`}
          className="mt-2 flex items-center gap-3 rounded-3xl bg-card p-4 shadow-card"
        >
          <img
            src={csAvatar}
            alt="Customer Service"
            width={44}
            height={44}
            className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-primary/20"
            loading="lazy"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-foreground">Unahitaji msaada?</p>
            <p className="truncate text-xs text-muted-foreground">
              Tuma SMS kwa {SUPPORT_NUMBER}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-gradient-green px-3 py-1.5 text-xs font-bold text-primary-foreground">
            Wasiliana
          </span>
        </a>
      </main>
    </AppShell>
  );
}
