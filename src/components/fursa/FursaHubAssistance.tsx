import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { getFursaUser } from "@/lib/fursa-auth";
import csAvatar from "@/assets/cs-avatar.png";

const PRESETS = [
  "Nawezaje kujisajili?",
  "Activation fee ni kiasi gani?",
  "Kutoa pesa ni kuanzia kiasi gani?",
  "Nimefanya malipo lakini sijaingia dashboard.",
];

function answerFor(question: string) {
  const q = question.toLowerCase();
  if (q.includes("jisa") || q.includes("register") || q.includes("akaunti")) {
    return "Gusa Start Chat, kisha Jisajili na Lipia Activation fee kukamilisha usajili wako.";
  }
  if (q.includes("activation") || q.includes("14500") || q.includes("14,500")) {
    return "Activation fee ni TZS 14,500.";
  }
  if (q.includes("kutoa") || q.includes("withdraw") || q.includes("50,000") || q.includes("50000")) {
    return "Kutoa pesa ni kuanzia TZS 50,000.";
  }
  if (q.includes("malip") || q.includes("dashboard") || q.includes("push")) {
    return "Baada ya Mobilipa kuthibitisha malipo yako kwa mafanikio, utaelekezwa kwenye Dashboard na unaweza kuendelea kuchat.";
  }
  return "Nimekuelewa. Chagua swali hapo juu au niandikie swali kuhusu usajili, Activation fee, malipo au Withdrawal.";
}

export function FursaHubAssistance() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ from: "bot" | "me"; text: string }[]>([
    { from: "bot", text: "Habari 👋 Mimi ni FURSAHUB ASSISTANCE. Naweza kukusaidia kuhusu usajili, malipo na Withdrawal." },
  ]);
  const [text, setText] = useState("");

  const user = useMemo(() => getFursaUser(), [open]);

  function ask(question: string) {
    setMessages((m) => [...m, { from: "me", text: question }, { from: "bot", text: answerFor(question) }]);
  }

  function send() {
    const q = text.trim();
    if (!q) return;
    ask(q);
    setText("");
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-24 right-3 z-30 flex items-center gap-2 rounded-full bg-gradient-green px-4 py-3 text-xs font-extrabold text-primary-foreground shadow-float"
        aria-label="FURSAHUB ASSISTANCE"
      >
        <span className="relative">
          <img src={csAvatar} alt="FURSAHUB ASSISTANCE" className="h-8 w-8 rounded-full object-cover ring-2 ring-white/70" />
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-primary" />
        </span>
        FURSAHUB ASSISTANCE
      </button>

      {open && (
        <section className="fixed inset-x-3 bottom-24 z-[60] mx-auto flex max-w-md flex-col overflow-hidden rounded-3xl bg-card shadow-float ring-1 ring-primary/10" style={{ height: "min(72vh, 620px)" }}>
          <header className="bg-gradient-green px-4 py-4 text-primary-foreground">
            <div className="flex items-center gap-3">
              <img src={csAvatar} alt="FURSAHUB ASSISTANCE" className="h-11 w-11 rounded-full object-cover ring-2 ring-white/40" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold">FURSAHUB ASSISTANCE</p>
                <p className="text-[11px] text-primary-foreground/80">● ONLINE · Msaidizi wa Kiswahili</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-xl" aria-label="Funga">×</button>
            </div>
          </header>

          <div className="flex gap-2 overflow-x-auto border-b border-border p-3">
            {PRESETS.map((q) => (
              <button key={q} onClick={() => ask(q)} className="shrink-0 rounded-full border border-border bg-muted px-3 py-2 text-[11px] font-bold text-foreground">
                {q}
              </button>
            ))}
          </div>

          <main className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div key={i} className={m.from === "me" ? "flex justify-end" : "flex justify-start"}>
                <div className={m.from === "me" ? "max-w-[82%] rounded-3xl rounded-br-md bg-gradient-green px-4 py-3 text-sm text-primary-foreground" : "max-w-[82%] rounded-3xl rounded-bl-md bg-muted px-4 py-3 text-sm text-foreground"}>
                  {m.text}
                </div>
              </div>
            ))}
          </main>

          {!user && (
            <button onClick={() => navigate({ to: "/register" })} className="mx-4 mb-2 rounded-2xl bg-secondary px-4 py-3 text-xs font-extrabold text-secondary-foreground">
              👤 Jisajili Sasa
            </button>
          )}

          <div className="flex gap-2 border-t border-border p-3">
            <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Andika ujumbe wako..." className="min-w-0 flex-1 rounded-2xl border border-border bg-muted px-4 py-3 text-sm outline-none focus:border-primary" />
            <button onClick={send} className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-green text-primary-foreground">➤</button>
          </div>
        </section>
      )}
    </>
  );
}
