import crypto from "node:crypto";
import { db } from "../../src/lib/netlify-db";

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} haijawekwa.`);
  return value;
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

  const database = db();
  const paymentRows = await database.sql`
    SELECT * FROM payment_requests WHERE customer_reference = ${customerReference} LIMIT 1
  `;
  const payment = paymentRows[0];
  if (!payment) return new Response("ok", { status: 200 });

  if (event.event === "payment.confirmed") {
    await database.sql`
      UPDATE payment_requests
      SET payment_status = ${String(event.status ?? "PAID").toUpperCase()},
          zonmpay_reference = ${event.reference ?? payment.zonmpay_reference},
          provider_response = ${raw}::jsonb,
          payer_phone = ${event.customer?.phoneNumber ?? payment.payer_phone}
      WHERE id = ${payment.id}
    `;
    await database.sql`
      INSERT INTO admin_notifications (id, payment_id, title, message, is_read)
      VALUES (${crypto.randomUUID()}, ${payment.id}, ${"ZonmPay payment confirmed"}, ${`Malipo ya TZS ${Number(event.amount ?? payment.amount).toLocaleString()} yamethibitishwa na ZonmPay.`}, ${false})
    `;
  } else if (event.event === "payment.failed") {
    await database.sql`
      UPDATE payment_requests
      SET payment_status = ${String(event.status ?? "FAILED").toUpperCase()},
          failure_reason = ${event.failureReason ?? null},
          provider_response = ${raw}::jsonb
      WHERE id = ${payment.id}
    `;
    await database.sql`
      INSERT INTO admin_notifications (id, payment_id, title, message, is_read)
      VALUES (${crypto.randomUUID()}, ${payment.id}, ${"ZonmPay payment failed"}, ${event.failureReason ?? "Malipo hayajakamilika."}, ${false})
    `;
  }

  return new Response("ok", { status: 200 });
};
