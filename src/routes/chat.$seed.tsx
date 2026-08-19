import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { RegisterDialog } from "@/components/fursa/RegisterDialog";
import { money, profileFromSeed } from "@/lib/fursa-data";

export const Route = createFileRoute("/chat/$seed")({
  head: () => ({
    meta: [
      { title: "Chat Room — FursaHub" },
      {
        name: "description",
        content: "Chumba cha mazungumzo cha FursaHub: chati na mgeni na upate malipo.",
      },
      { property: "og:title", content: "Chat Room — FursaHub" },
      { property: "og:description", content: "Chati na mgeni wa kimataifa upate kipato." },
    ],
  }),
  component: ChatRoom,
});

type Msg = { from: "them" | "me"; text: string };

function ChatRoom() {
  const { seed } = Route.useParams();
  const p = profileFromSeed(seed);
  const [messages, setMessages] = useState<Msg[]>([
    {
      from: "them",
      text: `Hujambo, mimi ni ${p.name} kutoka ${p.country}. Nataka kujifunza Kiswahili, hasa kuhusu ${p.topic}. Wewe unaweza kunisaidia?`,
    },
    {
      from: "them",
      text: "Nitafurahi sana tukianza mazungumzo sasa hivi. Uko tayari?",
    },
  ]);
  const [text, setText] = useState("");
  const [locked, setLocked] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { from: "me", text: text.trim() }]);
    setText("");
    setLocked(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="bg-gradient-green px-4 pt-6 pb-5 text-primary-foreground">
        <div className="mx-auto flex w-full max-w-md items-center gap-3">
          <Link to="/chat-earn" className="shrink-0 text-xl" aria-label="Rudi">
            ←
          </Link>
          <img
            src={p.photo}
            alt={p.name}
            className="h-11 w-11 shrink-0 rounded-2xl object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-extrabold">
              {p.flag} {p.name}
            </p>
            <p className="flex items-center gap-1.5 text-[11px] text-primary-foreground/85">
              <span className="h-2 w-2 rounded-full bg-primary-glow" /> Online Now
            </p>
          </div>
          <span className="shrink-0 text-xs font-bold">⭐ {p.rating}</span>
        </div>
      </header>

      <div className="mx-auto w-full max-w-md px-4 pt-3">
        <div className="rounded-2xl bg-secondary px-4 py-3 text-center text-[12px] font-semibold text-secondary-foreground">
          Unachati na {p.name} kwa muda wa dakika {p.minutes} na malipo yake ni{" "}
          {money(p.amount)}.
        </div>
      </div>

      <main className="mx-auto w-full max-w-md flex-1 space-y-3 px-4 py-4 pb-32">
        {messages.map((m, i) => (
          <div key={i} className={m.from === "me" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={
                m.from === "me"
                  ? "max-w-[80%] rounded-3xl rounded-br-md bg-gradient-green px-4 py-3 text-sm text-primary-foreground shadow-card"
                  : "max-w-[80%] rounded-3xl rounded-bl-md bg-card px-4 py-3 text-sm text-card-foreground shadow-card"
              }
            >
              {m.text}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-card/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
        <div className="mx-auto flex w-full max-w-md items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Andika ujumbe wako..."
            className="min-w-0 flex-1 rounded-2xl border border-border bg-muted px-4 py-3 text-sm outline-none focus:border-primary"
          />
          <button
            onClick={send}
            aria-label="Tuma"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-green text-primary-foreground shadow-card"
          >
            ➤
          </button>
        </div>
      </div>

      <RegisterDialog
        open={locked}
        onClose={() => setLocked(false)}
        title="Huwezi Kutuma Ujumbe"
        message="Huwezi kutuma ujumbe au kupata huduma hii kwa sasa mpaka kujisajili kwa Mtaji wa 14,500Tzs kwenye FursaHub."
        backLabel="← Rudi Kwenye Chat"
      />
    </div>
  );
}
