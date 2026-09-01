import { createServerFn } from "@tanstack/react-start";

export const PAYMENT_AMOUNT = 14500;
export const PAYMENT_CURRENCY = "TZS";
const MOBILIPA_BASE = "https://api.mobilipa.store";

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("255")) return digits;
  if (digits.startsWith("0")) return `255${digits.slice(1)}`;
  return `255${digits}`;
}

function apiKey() {
  const key = process.env["MOBILIPA_API_KEY"];
  if (!key) throw new Error("MOBILIPA_API_KEY haijawekwa kwenye environment ya server.");
  return key;
}

export const startMobilipaPayment = createServerFn({ method: "POST" })
  .inputValidator((input: { name: string; email: string; phone: string }) => {
    const digits = (input?.phone ?? "").replace(/\D/g, "");
    if (digits.length < 9) throw new Error("Namba ya simu si sahihi.");
    if (!input?.name?.trim()) throw new Error("Jina linahitajika.");
    if (!input?.email?.trim()) throw new Error("Email inahitajika.");
    return { name: input.name.trim(), email: input.email.trim(), phone: digits };
  })
  .handler(async ({ data }) => {
    const res = await fetch(`${MOBILIPA_BASE}/v1/payment/create_order`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-KEY": apiKey() },
      body: JSON.stringify({
        buyer_email: data.email,
        buyer_name: data.name,
        buyer_phone: normalizePhone(data.phone),
        amount: PAYMENT_AMOUNT,
        currency: PAYMENT_CURRENCY,
      }),
    });

    const json = (await res.json().catch(() => null)) as
      | { status?: string; message?: string; data?: Record<string, unknown> }
      | null;

    if (!res.ok || json?.status !== "success" || !json?.data) {
      throw new Error(json?.message ?? "Imeshindikana kutuma ombi la malipo. Jaribu tena.");
    }

    const orderId = String(json.data["order_id"] ?? "");
    if (!orderId) throw new Error("Mobilipa haikurudisha order_id.");

    return {
      order_id: orderId,
      reference: json.data["reference"] ? String(json.data["reference"]) : null,
      message: json.message ?? "Push USSD imetumwa kwenye simu yako.",
    };
  });

export const checkMobilipaPayment = createServerFn({ method: "POST" })
  .inputValidator((input: { orderId: string }) => {
    if (!input?.orderId) throw new Error("Order id inahitajika.");
    return { orderId: input.orderId };
  })
  .handler(async ({ data }) => {
    const res = await fetch(`${MOBILIPA_BASE}/v1/payment/check_status`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-KEY": apiKey() },
      body: JSON.stringify({ order_id: data.orderId }),
    });

    const json = (await res.json().catch(() => null)) as
      | { status?: string; message?: string; data?: Record<string, unknown> }
      | null;

    const paymentStatus = String(
      json?.data?.["payment_status"] ?? json?.data?.["status"] ?? json?.status ?? "PENDING",
    ).toUpperCase();
    const success = ["COMPLETED", "SUCCESS", "PAID", "SUCCESSFUL"].includes(paymentStatus);
    const failed = ["CANCELLED", "USERCANCELLED", "REJECTED", "FAILED", "EXPIRED"].includes(paymentStatus);

    return {
      payment_status: paymentStatus,
      success,
      failed,
      transid: json?.data?.["transid"] ? String(json.data["transid"]) : null,
      message: json?.message ?? null,
    };
  });
