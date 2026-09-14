import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ACTIVATION_FEES, getFursaUser, SERVICE_LABELS, updateFursaUser } from "@/lib/fursa-auth";
import { confirmPaymentRequest, getActivationStatus, startZonmPayPayment } from "@/lib/zonmpay.functions";

export const Route = createFileRoute("/payment")({
  head: () => ({ meta: [{ title: "Lipa — FursaHub" }, { name: "description", content: "Lipia Activation ya FursaHub kwa ZonmPay USSD Push." }] }),
  component: PaymentPage,
});

type Phase = "ready" | "push-sent" | "verifying" | "approved" | "failed";

function PaymentPage() {
  const navigate = useNavigate();
  const startPayment = useServerFn(startZonmPayPayment);
  const confirm = useServerFn(confirmPaymentRequest);
  const getStatus = useServerFn(getActivationStatus);
  const [ready, setReady] = useState(false);
  const [phone, setPhone] = useState("");
  const [phase, setPhase] = useState<Phase>("ready");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [pushNumber, setPushNumber] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const user = getFursaUser();
    if (!user) { navigate({ to: "/register" }); return; }
    if (user.paid) { navigate({ to: "/dashboard" }); return; }
    setReady(true);
    setPhone("");
    setPaymentId(user.lastPaymentId ?? null);
    setReference(user.lastPaymentReference ?? null);
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
          setPhase("failed");
          setError(status.note || "Malipo hayajakamilika. Jaribu tena kwa kubonyeza LIPA SASA.");
          return;
        }
        if (status.paid) setMessage("Malipo yameonekana. Uthibitisho umetumwa kwa admin; subiri activation.");
      } catch {
        // Keep retrying while the customer waits for webhook/admin confirmation.
      }
      if (attempts >= 30) {
        if (timer.current) clearInterval(timer.current);
        setMessage("Bado tunasubiri uthibitisho. Unaweza kuacha ukurasa huu na kurudi baadaye.");
        setPhase("push-sent");
      }
    }, 10000);
  }

  async function onPayNow() {
    setError(null);
    setMessage(null);
    const user = getFursaUser();
    if (!user) { navigate({ to: "/register" }); return; }

    try {
      if (!phone.trim()) {
        setError("Weka namba ya simu unayotumia kulipia kwanza.");
        return;
      }
      const result = await startPayment({ data: { userId: user.id, phone, service: user.service } });
      updateFursaUser({ lastPaymentId: result.paymentId, lastPaymentReference: result.reference });
      setPaymentId(result.paymentId);
      setReference(result.reference);
      setPushNumber(result.pushedTo ?? phone);
      setPhase("push-sent");
      setMessage(result.message);
    } catch (err) {
      setPhase("failed");
      setError(err instanceof Error ? err.message : "Imeshindikana kutuma USSD Push.");
    }
  }

  async function onConfirm(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const user = getFursaUser();
    if (!user || !paymentId) {
      setError("Anzisha malipo kwa kubonyeza LIPA SASA kwanza.");
      return;
    }
    if (!phone.trim()) {
      setError("Weka namba ya simu uliyotumia kulipia.");
      return;
    }

    try {
      setPhase("verifying");
      await confirm({ data: { paymentId, userId: user.id, phone } });
      setMessage("Namba yako imepokelewa. Tunaangalia malipo na admin ata-activate account baada ya kuthibitisha.");
      beginPolling(paymentId, user.id);
    } catch (err) {
      setPhase("push-sent");
      setError(err instanceof Error ? err.message : "Imeshindikana kutuma uthibitisho.");
    }
  }

  if (!ready) return <main className="flex min-h-screen items-center justify-center bg-k-slate-50 font-jost text-k-slate-500">Inapakia...</main>;
  const user = getFursaUser();
  if (!user) return null;
  const amount = ACTIVATION_FEES[user.service];
  const maskedPushNumber = pushNumber ? `${pushNumber.slice(0, 6)}****${pushNumber.slice(-2)}` : "namba yako ya usajili";

  return (
    <div className="min-h-screen bg-k-slate-50 font-jost text-k-slate-800">
      <header className="flex items-center justify-between bg-k-green-900 px-6 py-4">
        <span className="text-lg font-extrabold text-white">FursaHub</span>
        <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] text-k-green-100">ZonmPay • MALIPO SALAMA</span>
      </header>

      <main className="mx-auto max-w-xl px-4 pb-16 pt-7">
        <div className="mb-5 rounded-2xl border border-k-red-300 bg-k-red-50 p-4">
          <h2 className="text-xs font-bold tracking-widest text-k-red-600">LINDA PESA YAKO</h2>
          <p className="mt-1 text-sm text-k-red-900">Usimpe mtu PIN yako. Bonyeza LIPA SASA kisha fuata ombi litakalotokea kwenye simu yako.</p>
        </div>

        <section className="overflow-hidden rounded-3xl border border-k-slate-200 bg-white shadow-sm">
          <div className="border-b border-k-slate-100 px-5 py-4">
            <h1 className="font-extrabold">Activation ya {SERVICE_LABELS[user.service]}</h1>
            <p className="mt-1 text-xs text-k-slate-500">Kiasi cha activation: TZS {amount.toLocaleString()}</p>
          </div>

          <div className="px-5 py-5">
            <div className="mb-4 flex items-center justify-between rounded-2xl bg-k-green-50 px-4 py-3">
              <span className="text-sm text-k-green-700">Kiasi cha kulipa</span>
              <span className="text-xl font-bold text-k-green-900">TZS {amount.toLocaleString()}</span>
            </div>

            <div className="mb-5 rounded-2xl bg-k-slate-50 p-4 text-sm">
              <p><strong>Huduma:</strong> {SERVICE_LABELS[user.service]}</p>
              <p className="mt-1"><strong>Reference:</strong> {reference ?? "Itatengenezwa ukibonyeza LIPA SASA"}</p>
            </div>

            {error && <div className="mb-4 rounded-xl border border-k-red-300 bg-k-red-50 px-4 py-3 text-sm text-k-red-900">{error}</div>}
            {message && <div className="mb-4 rounded-xl border border-k-green-200 bg-k-green-50 px-4 py-3 text-sm text-k-green-900">{message}</div>}

            {(phase === "ready" || phase === "failed") && (
              <div className="space-y-3">
                <div className="rounded-2xl border border-k-green-200 bg-k-green-50 p-4">
                  <p className="mb-2 text-sm font-extrabold text-k-green-900">WEKA NAMBA YA SIMU UNAYOTUMIA KULIPIA</p>
                  <p className="mb-3 text-xs text-k-green-800">Weka namba ya M-Pesa utakayotumia kupokea USSD Push. Ukiweka 07..., mfumo utaibadilisha kuwa +255... moja kwa moja.</p>
                  <input
                    id="push-phone"
                    type="tel"
                    inputMode="numeric"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9+]/g, ""))}
                    placeholder="0712345678"
                    className="w-full rounded-xl border border-k-green-200 bg-white px-4 py-3 text-base outline-none focus:border-k-green-500"
                  />
                  <p className="mt-2 text-[11px] text-k-green-700">Mfano: 0743871339 → +255743871339</p>
                </div>
                <button type="button" onClick={onPayNow} className="k-btn-green w-full text-base">
                  💳 LIPA SASA — TUMA USSD PUSH
                </button>
              </div>
            )}

            {(phase === "push-sent" || phase === "verifying") && (
              <div className="space-y-5">
                <div className="rounded-2xl border border-k-green-200 bg-k-green-50 p-4">
                  <p className="font-extrabold text-k-green-900">✓ Ombi la malipo limetumwa</p>
                  <p className="mt-1 text-sm text-k-green-800">Angalia simu yenye namba <strong>{maskedPushNumber}</strong>, kisha weka PIN yako kwenye prompt ya mtandao.</p>
                </div>

                <form onSubmit={onConfirm} className="border-t border-k-slate-100 pt-5">
                  <h3 className="mb-1 font-extrabold">Baada ya kulipia</h3>
                  <p className="mb-4 text-xs text-k-slate-500">Baada ya kulipia, hakikisha umeweka namba ile ile uliyotumia kulipia, kisha bonyeza NIMELIPIA.</p>
                  <label className="mb-1 block text-xs font-bold text-k-slate-500" htmlFor="paid-phone">Namba ya simu uliyolipia</label>
                  <input
                    id="paid-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9+]/g, ""))}
                    placeholder="0712345678"
                    className="mb-3 w-full rounded-xl border border-k-slate-200 bg-k-slate-50 px-4 py-3 outline-none focus:border-k-green-500"
                  />
                  <button type="submit" disabled={phase === "verifying"} className="k-btn-green w-full">
                    {phase === "verifying" ? "INATHIBITISHA..." : "✓ NIMELIPIA"}
                  </button>
                </form>
              </div>
            )}

            {phase === "approved" && <div className="rounded-2xl bg-k-green-50 p-5 text-center font-bold text-k-green-800">Malipo yamehakikiwa. Tunaelekeza kwenye dashboard...</div>}

            <p className="mt-5 text-center text-[11px] text-k-slate-500">Ukibonyeza NIMELIPIA bila kulipa, admin hataki-activate account mpaka malipo yaonekane.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
