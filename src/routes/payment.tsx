import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ACTIVATION_FEE, getFursaUser, updateFursaUser } from "@/lib/fursa-auth";
import { checkMobilipaPayment, PAYMENT_AMOUNT, startMobilipaPayment } from "@/lib/mobilipa.functions";

export const Route = createFileRoute("/payment")({
  head: () => ({ meta: [{ title: "Lipa Activation — FursaHub" }, { name: "description", content: "Lipia FursaHub kwa USSD Push." }] }),
  component: PaymentPage,
});

type Phase = "form" | "waiting" | "failed";

function PaymentPage() {
  const navigate = useNavigate();
  const createOrder = useServerFn(startMobilipaPayment);
  const pollStatus = useServerFn(checkMobilipaPayment);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [ready, setReady] = useState(false);
  const [phone, setPhone] = useState("");
  const [phase, setPhase] = useState<Phase>("form");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = getFursaUser();
    if (!user) {
      navigate({ to: "/register" });
      return;
    }
    if (user.paid) {
      navigate({ to: "/dashboard" });
      return;
    }
    setPhone(user.phone);
    setReady(true);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPhase("waiting");
    const user = getFursaUser();
    if (!user) { navigate({ to: "/register" }); return; }
    try {
      const order = await createOrder({ data: { name: user.name, email: user.email, phone } });
      updateFursaUser({ lastPaymentOrderId: order.order_id });
      setMessage(order.message);
      let attempts = 0;
      timer.current = setInterval(async () => {
        attempts += 1;
        try {
          const result = await pollStatus({ data: { orderId: order.order_id } });
          if (result.success) {
            if (timer.current) clearInterval(timer.current);
            updateFursaUser({ paid: true });
            navigate({ to: "/dashboard" });
            return;
          }
          if (result.failed) {
            if (timer.current) clearInterval(timer.current);
            setPhase("failed");
            setError("Malipo hayakukamilika. Tafadhali jaribu tena.");
          }
        } catch {
          // Keep polling while Mobilipa is processing.
        }
        if (attempts >= 40) {
          if (timer.current) clearInterval(timer.current);
          setPhase("failed");
          setError("Muda umeisha bila uthibitisho wa malipo. Jaribu tena.");
        }
      }, 4000);
    } catch (err) {
      setPhase("failed");
      setError(err instanceof Error ? err.message : "Imeshindikana kuanzisha malipo.");
    }
  }

  if (!ready) return <main className="flex min-h-screen items-center justify-center bg-k-slate-50 text-k-slate-500">Inapakia...</main>;

  return (
    <main className="k-auth-bg min-h-screen px-4 py-8">
      <div className="mx-auto max-w-xl">
        <header className="mb-6 flex items-center justify-between rounded-3xl bg-gradient-green px-5 py-4 text-white shadow-card">
          <span className="text-lg font-extrabold">FursaHub</span>
          <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold">USSD PUSH PEKEE</span>
        </header>

        <div className="mb-5 rounded-2xl border border-k-green-100 bg-k-green-50 p-4 text-sm text-k-green-900">
          <strong>Activation fee:</strong> TZS {ACTIVATION_FEE.toLocaleString()}. Mfumo huu unatumia <strong>Push payment pekee</strong>; hakuna SMS wala njia nyingine za kulipia.
        </div>

        <section className="k-card p-5 md:p-7">
          <div className="mb-5 flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-k-green-50 text-xl">⚡</div><div><h1 className="font-bold text-k-slate-900">Lipa Activation</h1><p className="text-xs text-k-slate-500">Hatua 2 kati ya 2 · USSD Push</p></div></div>
          <div className="mb-5 flex items-center justify-between rounded-2xl bg-k-green-50 px-4 py-3"><span className="text-sm text-k-green-700">Kiasi cha kulipa</span><span className="text-lg font-bold text-k-green-900">{PAYMENT_AMOUNT.toLocaleString()} TZS</span></div>

          {error && <div className="mb-4 rounded-xl border border-k-red-300 bg-k-red-50 px-4 py-3 text-sm text-k-red-900">{error}</div>}
          {phase === "waiting" ? (
            <div className="rounded-2xl border border-k-slate-200 p-7 text-center"><div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-k-green-100 border-t-k-green-700" /><p className="font-semibold text-k-green-900">Subiri uthibitisho...</p><p className="mt-1 text-sm text-k-slate-500">{message ?? "Push USSD imetumwa kwenye simu yako."} Ingiza PIN yako kwenye simu kuthibitisha.</p></div>
          ) : (
            <form onSubmit={onSubmit}>
              <label className="mb-1 block text-xs font-bold text-k-slate-500" htmlFor="payment-phone">Namba ya simu ya kupokea Push</label>
              <div className="mb-4 flex items-center overflow-hidden rounded-xl border border-k-slate-200 bg-k-slate-50"><span className="border-r border-k-slate-200 px-3 py-3 text-sm text-k-slate-500">🇹🇿 +255</span><input id="payment-phone" type="tel" required maxLength={12} placeholder="06XXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} className="w-full bg-transparent px-3 py-3 text-sm outline-none" /></div>
              <button type="submit" className="k-btn-green hover:opacity-90">🔒 LIPA TZS {PAYMENT_AMOUNT.toLocaleString()} SASA</button>
            </form>
          )}
        </section>

        <div className="mt-4 text-center text-xs text-k-slate-500">Ukishalipa na Mobilipa ikatoa success, utaenda moja kwa moja Dashboard.</div>
      </div>
    </main>
  );
}
