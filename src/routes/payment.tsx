import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ACTIVATION_FEES, getFursaUser, SERVICE_LABELS, updateFursaUser } from "@/lib/fursa-auth";
import { confirmPaymentRequest, getActivationStatus } from "@/lib/zonmpay.functions";

export const Route = createFileRoute("/payment")({
  head: () => ({ meta: [{ title: "Lipa — FursaHub" }, { name: "description", content: "Lipa FursaHub kupitia Lipa Namba." }] }),
  component: PaymentPage,
});

const LIPA_NAMBA = "251161660";
const BUSINESS_NAME = "ASSERT BRIDGE";

type Phase = "ready" | "submitted" | "checking" | "approved";

function PaymentPage() {
  const navigate = useNavigate();
  const confirm = useServerFn(confirmPaymentRequest);
  const getStatus = useServerFn(getActivationStatus);
  const [ready, setReady] = useState(false);
  const [phone, setPhone] = useState("");
  const [phase, setPhase] = useState<Phase>("ready");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const user = getFursaUser();
    if (!user) { navigate({ to: "/register" }); return; }
    if (user.paid) { navigate({ to: "/dashboard" }); return; }
    setReady(true);
    setPaymentId(user.lastPaymentId ?? null);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [navigate]);

  const normalize = (value: string) => value.replace(/[^0-9]/g, "").slice(0, 13);

  const copyLipa = async () => {
    await navigator.clipboard?.writeText(LIPA_NAMBA);
    setMessage("Lipa Namba 251161660 imenakiliwa.");
  };

  const checkApproval = (id: string, userId: string) => {
    if (timer.current) clearInterval(timer.current);
    let attempts = 0;
    timer.current = setInterval(async () => {
      attempts++;
      try {
        const status = await getStatus({ data: { paymentId: id, userId } });
        if (status.activated) {
          if (timer.current) clearInterval(timer.current);
          updateFursaUser({ paid: true });
          setPhase("approved");
          navigate({ to: "/dashboard" });
          return;
        }
        if (status.adminStatus === "rejected") {
          if (timer.current) clearInterval(timer.current);
          setPhase("ready");
          setError("Admin hajathibitisha malipo haya. Hakikisha kiasi na namba uliyotumia ni sahihi.");
          return;
        }
      } catch { /* continue */ }
      if (attempts >= 18 && timer.current) {
        clearInterval(timer.current);
        setPhase("submitted");
        setMessage("Taarifa yako imepokelewa. Subiri admin athibitishe malipo.");
      }
    }, 10000);
  };

  async function onConfirm(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setMessage(null);
    const user = getFursaUser();
    if (!user) { navigate({ to: "/register" }); return; }
    if (!phone.trim()) { setError("Weka namba ya simu uliyotumia kulipia."); return; }
    try {
      setPhase("checking");
      const result = await confirm({ data: { userId: user.id, phone, service: user.service } });
      setPaymentId(result.paymentId);
      updateFursaUser({ lastPaymentId: result.paymentId, lastPaymentReference: result.reference });
      setMessage("Uthibitisho umetumwa kwa admin. Account itafunguliwa baada ya malipo kuthibitishwa.");
      setPhase("submitted");
      checkApproval(result.paymentId, user.id);
    } catch (err) {
      setPhase("ready");
      setError(err instanceof Error ? err.message : "Imeshindikana kutuma taarifa ya malipo.");
    }
  }

  if (!ready) return <main className="flex min-h-screen items-center justify-center bg-k-slate-50 font-jost text-k-slate-500">Inapakia...</main>;
  const user = getFursaUser();
  if (!user) return null;
  const amount = ACTIVATION_FEES[user.service];

  return (
    <div className="min-h-screen bg-k-slate-50 font-jost text-k-slate-800">
      <header className="flex items-center justify-between bg-k-green-900 px-6 py-4">
        <span className="text-lg font-extrabold text-white">FursaHub</span>
        <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] text-k-green-100">MALIPO SALAMA</span>
      </header>
      <main className="mx-auto max-w-xl px-4 pb-16 pt-7">
        <div className="mb-5 rounded-2xl border border-k-red-300 bg-k-red-50 p-4">
          <h2 className="text-xs font-bold tracking-widest text-k-red-600">LINDA PESA YAKO</h2>
          <p className="mt-1 text-sm text-k-red-900">Usimpe mtu PIN yako. Lipa kupitia menu ya mtandao wako kwa kutumia Lipa Namba iliyo hapa chini.</p>
        </div>
        <section className="overflow-hidden rounded-3xl border border-k-slate-200 bg-white shadow-sm">
          <div className="border-b border-k-slate-100 px-5 py-4">
            <h1 className="font-extrabold">Lipa Activation ya {SERVICE_LABELS[user.service]}</h1>
            <p className="mt-1 text-xs text-k-slate-500">Kiasi chako cha kulipa: TZS {amount.toLocaleString()}</p>
          </div>
          <div className="px-5 py-5">
            <div className="mb-5 flex items-center justify-between rounded-2xl bg-k-green-50 px-4 py-4">
              <div><p className="text-sm text-k-green-700">AMOUNT</p><p className="text-2xl font-black text-k-green-900">TZS {amount.toLocaleString()}</p></div>
              <div className="text-right"><p className="text-xs text-k-slate-500">Huduma</p><p className="font-bold">{SERVICE_LABELS[user.service]}</p></div>
            </div>

            <div className="mb-5 rounded-2xl border border-k-green-200 bg-k-green-50 p-5 text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-k-green-700">LIPA NAMBA</p>
              <p className="my-2 text-4xl font-black tracking-widest text-k-green-950">{LIPA_NAMBA}</p>
              <p className="text-sm text-k-green-800">Jina la Biashara: <strong>{BUSINESS_NAME}</strong></p>
              <button type="button" onClick={copyLipa} className="mt-4 rounded-xl bg-k-green-700 px-5 py-3 text-sm font-bold text-white">📋 COPY LIPA NAMBA</button>
            </div>

            <div className="mb-5 rounded-2xl border border-k-slate-200 bg-k-slate-50 p-4">
              <h3 className="mb-3 font-extrabold">NJIA ZA MALIPO / USSD MENU</h3>
              <Operator name="Vodacom M-Pesa" ussd="*150*00#" steps={["Bonyeza *150*00#", "Chagua Lipa kwa M-PESA", "Chagua Lipa kwa simu / Lipa bidhaa", `Weka LIPA NAMBA: ${LIPA_NAMBA}`, `Weka kiasi TZS ${amount.toLocaleString()}`, "Weka namba ya siri"]} />
              <Operator name="Mixx by Yas" ussd="*150*01#" steps={["Bonyeza *150*01#", "Chagua Lipa kwa simu", "Chagua Kwenda mitandao mingine", `Weka LIPA NAMBA: ${LIPA_NAMBA}`, `Weka kiasi TZS ${amount.toLocaleString()}`, "Weka namba ya siri"]} />
              <Operator name="Airtel Money" ussd="*150*60#" steps={["Bonyeza *150*60#", "Chagua Lipia Bili / Lipa kwa simu", "Chagua Lipa kwa simu (mitandao yote)", `Weka kumbukumbu/Lipa Namba: ${LIPA_NAMBA}`, `Weka kiasi TZS ${amount.toLocaleString()}`, "Ingiza namba ya siri"]} />
              <Operator name="Halopesa" ussd="*150*88#" steps={["Bonyeza *150*88#", "Chagua Lipia Bidhaa", `Weka namba ya malipo: ${LIPA_NAMBA}`, `Weka kiasi TZS ${amount.toLocaleString()}`, "Ingiza namba ya siri na ruhusu muamala"]} />
            </div>

            {error && <div className="mb-4 rounded-xl border border-k-red-300 bg-k-red-50 px-4 py-3 text-sm text-k-red-900">{error}</div>}
            {message && <div className="mb-4 rounded-xl border border-k-green-200 bg-k-green-50 px-4 py-3 text-sm text-k-green-900">{message}</div>}

            <form onSubmit={onConfirm} className="rounded-2xl border-2 border-k-green-200 bg-white p-4">
              <h3 className="font-extrabold text-k-green-900">BAADA YA KULIPIA</h3>
              <p className="mt-1 mb-4 text-xs text-k-slate-500">Weka namba ya simu uliyotumia kufanya malipo, kisha gusa NIMELIPIA.</p>
              <input type="tel" inputMode="numeric" required value={phone} onChange={e => setPhone(normalize(e.target.value))} placeholder="0743871339" className="mb-3 w-full rounded-xl border border-k-slate-200 bg-k-slate-50 px-4 py-3 text-base outline-none focus:border-k-green-500" />
              <button disabled={phase === "checking"} type="submit" className="k-btn-green w-full text-base disabled:opacity-60">{phase === "checking" ? "INATUMA TAARIFA..." : "✓ NIMELIPIA"}</button>
              {phase === "submitted" && <p className="mt-3 text-center text-xs font-semibold text-k-green-700">Uthibitisho umefika kwa admin. Subiri account ifunguliwe.</p>}
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}

function Operator({ name, ussd, steps }: { name: string; ussd: string; steps: string[] }) {
  const [open, setOpen] = useState(false);
  return <div className="mb-2 overflow-hidden rounded-xl border border-k-slate-200 bg-white">
    <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-4 py-3 text-left">
      <span><strong>{name}</strong><span className="ml-3 text-xs text-k-slate-500">{ussd}</span></span><span>{open ? "⌃" : "⌄"}</span>
    </button>
    {open && <ol className="space-y-2 border-t border-k-slate-100 px-4 py-3 text-sm">{steps.map((s, i) => <li key={s}><span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-k-green-100 text-xs font-bold text-k-green-800">{i + 1}</span>{s}</li>)}</ol>}
  </div>;
}
