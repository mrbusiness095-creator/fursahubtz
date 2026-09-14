import crypto from "node:crypto";

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} haijawekwa.`);
  return value;
}

async function db(path: string, init: RequestInit = {}) {
  const url = required("SUPABASE_URL").replace(/\/$/, "");
  const key = required("SUPABASE_SERVICE_ROLE_KEY");
  const headers = new Headers(init.headers);
  headers.set("apikey", key);
  headers.set("Authorization", `Bearer ${key}`);
  headers.set("Content-Type", "application/json");
  headers.set("Prefer", headers.get("Prefer") ?? "return=representation");
  const response = await fetch(`${url}/rest/v1/${path}`, { ...init, headers });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(data?.message ?? "Supabase error");
  return data;
}

function validSignature(raw: string, header: string | null, secret: string) {
  if (!header) return false;
  const t = header.match(/(?:^|,)t=([^,]+)/)?.[1] ?? "";
  const v1 = header.match(/(?:^|,)v1=([a-f0-9]+)/)?.[1] ?? "";
  if (!t || !v1) return false;
  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(t));
  if (!Number.isFinite(Number(t)) || age > 300) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${t}.${raw}`).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(v1, "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export default async (request: Request) => {
  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  const raw = await request.text();
  if (!validSignature(raw, request.headers.get("X-ZonmPay-Signature"), required("ZONMPAY_WEBHOOK_SECRET"))) {
    return new Response("Invalid signature", { status: 401 });
  }

  const event = JSON.parse(raw) as {
    event?: string;
    reference?: string;
    customerReference?: string;
    amount?: number;
    status?: string;
    transactionId?: string;
    failureReason?: string;
    customer?: { phoneNumber?: string; mno?: string };
  };

  const customerReference = event.customerReference ?? event.reference;
  if (!customerReference) return new Response("ok", { status: 200 });

  const paymentRows = await db(`payment_requests?customer_reference=eq.${encodeURIComponent(customerReference)}&select=*`);
  const payment = paymentRows?.[0];
  if (!payment) return new Response("ok", { status: 200 });

  if (event.event === "payment.confirmed") {
    await db(`payment_requests?id=eq.${encodeURIComponent(payment.id)}`, {
      method: "PATCH",
      body: JSON.stringify({
        payment_status: String(event.status ?? "PAID").toUpperCase(),
        zonmpay_reference: event.reference ?? payment.zonmpay_reference,
        provider_response: event,
        payer_phone: event.customer?.phoneNumber ?? payment.payer_phone,
      }),
    });
    await db("admin_notifications", {
      method: "POST",
      body: JSON.stringify({ payment_id: payment.id, title: "ZonmPay payment confirmed", message: `Malipo ya TZS ${Number(event.amount ?? payment.amount).toLocaleString()} yamethibitishwa na ZonmPay.`, is_read: false }),
    });
  } else if (event.event === "payment.failed") {
    await db(`payment_requests?id=eq.${encodeURIComponent(payment.id)}`, {
      method: "PATCH",
      body: JSON.stringify({ payment_status: String(event.status ?? "FAILED").toUpperCase(), failure_reason: event.failureReason ?? null, provider_response: event }),
    });
    await db("admin_notifications", {
      method: "POST",
      body: JSON.stringify({ payment_id: payment.id, title: "ZonmPay payment failed", message: event.failureReason ?? "Malipo hayajakamilika.", is_read: false }),
    });
  }

  return new Response("ok", { status: 200 });
};
