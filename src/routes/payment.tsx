import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ACTIVATION_FEES, getFursaUser, SERVICE_LABELS, updateFursaUser } from "@/lib/fursa-auth";
import { confirmPaymentRequest, getActivationStatus, startZonmPayPayment } from "@/lib/zonmpay.functions";

export const Route = createFileRoute("/payment")({
  head: () => ({ meta: [{ title: "Lipa — FursaHub" }, { name: "description", content: "Lipia Activation ya FursaHub kwa ZonmPay USSD Push." }] }),
  component: PaymentPage,
});

type Phase = "form" | "waiting" | "failed" | "approved";

function PaymentPage() {
  const navigate = useNavigate();
  const startPayment = useServerFn(startZonmPayPayment);
  const confirm = useServerFn(confirmPaymentRequest);
  const getStatus = useServerFn(getActivationStatus);
  const [ready, setReady] = useState(false);
  const [phone, setPhone] = useState("");
  const [phase, setPhase] = useState<Phase>("form");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const user = getFursaUser();
    if (!user) { navigate({ to: "/register" }); return; }
    if (user.paid) { navigate({ to: "/dashboard" }); return; }
    setPhone(user.phone);
    setPaymentId(user.lastPaymentId ?? null);
    setReference(user.lastPaymentReference ?? null);
    setReady(true);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [navigate]);

  function beginPolling(id: string, userId: string) {
    if (timer.current) clearInterval(timer.current);
    let attempts = 0;
    timer.current = setInterval(async () => {
      attempts += 1;
      try {
        const status = await getStatus({ data: { paymentId: id, userId } });
        if (status.activated) {
          if (timer.current) clearInterval(timer.current);
          updateFursaUser({ paid: true });
          setPhase("approved");
          navigate({ to: "/dashboard" });
          return;
        }
        if (status.status && ["FAILED", "REJECTED", "CANCELLED", "CUSTOMER_REJECTED"].includes(String(status.status).toUpperCase())) {
          if (timer.current) clearInterval(timer.current);
          setPhase("failed"); setError(status.note || "Malipo hayajakamilika."); return;
        }
        if (status.paid) setMessage("Malipo yameonekana. Yanasubiri approval ya admin.");
      } catch { /* retry */ }
      if (attempts >= 90) {
        if (timer.current) clearInterval(timer.current);
        setPhase("failed"); setError("Muda wa kusubiri umeisha. Unaweza kurudia verification bila kulipia mara mbili.");
      }
    }, 10000);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(null); setPhase("waiting");
    const user = getFursaUser();
    if (!user) { navigate({ to: "/register" }); return; }
    try {
      const result = await startPayment({ data: { userId: user.id, phone, service: user.service } });
      updateFursaUser({ lastPaymentId: result.paymentId, lastPaymentReference: result.reference });
      setPaymentId(result.paymentId); setReference(result.reference); setMessage(result.message);
      beginPolling(result.paymentId, user.id);
    } catch (err) { setPhase("failed"); setError(err instanceof Error ? err.message : "Imeshindikana kuanzisha malipo."); }
  }

  async function onConfirm() {
    const user = getFursaUser();
    if (!user || !paymentId) return;
    try {
      await confirm({ data: { paymentId, userId: user.id, phone } });
      setMessage("Uthibitisho umetumwa kwa admin. Subiri account i-activate.");
      beginPolling(paymentId, user.id);
    } catch (err) { setError(err instanceof Error ? err.message : "Imeshindikana kutuma uthibitisho."); }
  }

  if (!ready) return <main className="flex min-h-screen items-center justify-center bg-k-slate-50 font-jost text-k-slate-500">Inapakia...</main>;
  const user = getFursaUser();
  if (!user) return null;
  const amount = ACTIVATION_FEES[user.service];

  return (
    <div className="min-h-screen bg-k-slate-50 font-jost text-k-slate-800">
      <header className="flex items-center justify-between bg-k-green-900 px-6 py-4"><span className="text-lg font-extrabold text-white">FursaHub</span><span className="rounded-full bg-white/10 px-3 py-1 text-[11px] text-k-green-100">ZonmPay • MALIPO SALAMA</span></header>
      <main className="mx-auto max-w-xl px-4 pb-16 pt-7">
        <div className="mb-5 rounded-2xl border border-k-red-300 bg-k-red-50 p-4"><h2 className="text-xs font-bold tracking-widest text-k-red-600">LINDA PESA YAKO</h2><p className="mt-1 text-sm text-k-red-900">Tumia USSD Push ya FursaHub pekee. Usimpe mtu PIN yako.</p></div>
        <section className="overflow-hidden rounded-3xl border border-k-slate-200 bg-white">
          <div className="border-b border-k-slate-100 px-5 py-4"><h1 className="font-extrabold">Activation ya {SERVICE_LABELS[user.service]}</h1><p className="mt-1 text-xs text-k-slate-500">Namba uliyolipia ndiyo itatumwa USSD Push.</p></div>
          <div className="px-5 py-5">
            <div className="mb-4 flex items-center justify-between rounded-2xl bg-k-green-50 px-4 py-3"><span className="text-sm text-k-green-700">Kiasi cha kulipa</span><span className="text-xl font-bold text-k-green-900">TZS {amount.toLocaleString()}</span></div>
            <div className="mb-4 rounded-2xl bg-k-slate-50 p-4 text-sm"><p><strong>Huduma:</strong> {SERVICE_LABELS[user.service]}</p><p className="mt-1"><strong>Reference:</strong> {reference ?? "Itatengenezwa ukianza malipo"}</p></div>
            {error && <div className="mb-4 rounded-xl border border-k-red-300 bg-k-red-50 px-4 py-3 text-sm text-k-red-900">{error}</div>}
            {message && <div className="mb-4 rounded-xl border border-k-green-200 bg-k-green-50 px-4 py-3 text-sm text-k-green-900">{message}</div>}
            {phase === "waiting" ? (
              <div className="space-y-3 text-center"><div className="rounded-2xl border border-k-slate-200 p-5"><div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-k-green-100 border-t-k-green-700"/><p className="font-bold">Subiri uthibitisho...</p><p className="mt-1 text-xs text-k-slate-500">Kamilisha PIN kwenye simu. Admin ata-approve baada ya payment kuthibitishwa.</p></div><button onClick={onConfirm} className="k-btn-green">✓ NIMELIPIA — THIBITISHA</button></div>
            ) : (
              <form onSubmit={onSubmit}>
                <label className="mb-1 block text-xs font-bold text-k-slate-500" htmlFor="phone">Namba ya simu uliyolipia</label>
                <input id="phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^0-9+]/g, ""))} placeholder="0712345678" className="mb-4 w-full rounded-xl border border-k-slate-200 bg-k-slate-50 px-4 py-3 outline-none" />
                <button type="submit" className="k-btn-green">🔒 NIMELIPIA — TUMA USSD PUSH</button>
              </form>
            )}
            <p className="mt-4 text-center text-[11px] text-k-slate-500">Malipo yakishathibitishwa na admin, account yako ita-activate moja kwa moja.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
