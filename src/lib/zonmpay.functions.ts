import { createServerFn } from "@tanstack/react-start";
import { db } from "./netlify-db";

export const ACTIVATION_FEES = {
  chat: 14000,
  mikopo: 15000,
  ajira: 16000,
} as const;

export type ActivationService = keyof typeof ACTIVATION_FEES;

const ZONMPAY_BASE = "https://zonmpay.com";

function env(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} haijawekwa kwenye Netlify Environment Variables.`);
  return value;
}

function normalizePhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("255")) return digits;
  if (digits.startsWith("0")) return `255${digits.slice(1)}`;
  return `255${digits}`;
}

function serviceLabel(service: ActivationService) {
  return service === "chat" ? "Chat na Kulipwa" : service === "mikopo" ? "Mikopo" : "Ajira Nje";
}

function zonmpayToken() {
  return env("ZONMPAY_API_KEY");
}

async function zonmpay(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("apiToken", zonmpayToken());
  headers.set("Content-Type", "application/json");
  const response = await fetch(`${ZONMPAY_BASE}${path}`, { ...init, headers });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(data?.message ?? data?.error ?? `ZonmPay HTTP ${response.status}`);
  }
  return data;
}

export const registerFursaUser = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; name: string; username: string; phone: string; email: string; country: string; service: ActivationService }) => {
    if (!input?.id || !input.name || !input.username || !input.phone || !input.email) throw new Error("Taarifa za user hazijakamilika.");
    if (!(input.service in ACTIVATION_FEES)) throw new Error("Huduma haijachaguliwa.");
    return input;
  })
  .handler(async ({ data }) => {
    const database = db();
    const fee = ACTIVATION_FEES[data.service];
    const userRows = await database.sql`
      INSERT INTO fursa_users (id, name, username, phone, email, country, service, activation_fee, activated)
      VALUES (${data.id}, ${data.name.trim()}, ${data.username.trim()}, ${normalizePhone(data.phone)}, ${data.email.trim().toLowerCase()}, ${data.country}, ${data.service}, ${fee}, ${false})
      RETURNING *
    `;
    return { user: userRows[0] ?? null, fee };
  });

export const startZonmPayPayment = createServerFn({ method: "POST" })
  .inputValidator((input: { userId: string; phone: string; service: ActivationService }) => {
    if (!input?.userId || !input.phone) throw new Error("User na namba ya simu vinahitajika.");
    if (!(input.service in ACTIVATION_FEES)) throw new Error("Huduma haijachaguliwa.");
    return input;
  })
  .handler(async ({ data }) => {
    const database = db();
    const fee = ACTIVATION_FEES[data.service];
    const orderRef = `FURSA-${data.userId.slice(0, 8)}-${Date.now()}`;
    const phone = normalizePhone(data.phone);
    const paymentId = crypto.randomUUID();

    const paymentRows = await database.sql`
      INSERT INTO payment_requests
        (id, user_id, customer_reference, service, service_label, amount, payer_phone, payment_status, admin_status)
      VALUES
        (${paymentId}, ${data.userId}, ${orderRef}, ${data.service}, ${serviceLabel(data.service)}, ${fee}, ${phone}, ${"PENDING"}, ${"pending"})
      RETURNING *
    `;

    const localPayment = paymentRows[0];
    if (!localPayment?.id) throw new Error("Payment request haikuweza kuhifadhiwa.");

    try {
      const response = await zonmpay("/api/v2/payment/collection", {
        method: "POST",
        body: JSON.stringify({
          reference: orderRef,
          description: `FursaHub Activation - ${serviceLabel(data.service)}`,
          amount: fee,
          service: "mobile",
          account: phone,
          amountType: "FULL",
          push: true,
        }),
      });

      const zonReference = String(response?.reference ?? response?.data?.reference ?? response?.payment?.reference ?? "");
      const status = String(response?.status ?? response?.data?.status ?? "PROCESSING").toUpperCase();
      const providerJson = JSON.stringify(response);
      const immediateFailure = ["FAILED", "REJECTED", "CANCELLED", "CUSTOMER_REJECTED"].includes(status);
      const pushedTo = phone;

      await database.sql`
        UPDATE payment_requests
        SET zonmpay_reference = ${zonReference || null}, payment_status = ${status}, provider_response = ${providerJson}::jsonb
        WHERE id = ${paymentId}
      `;

      await database.sql`
        INSERT INTO admin_notifications (id, payment_id, title, message, is_read)
        VALUES (${crypto.randomUUID()}, ${paymentId}, ${"Payment request mpya"}, ${`User ameanzisha malipo ya TZS ${fee.toLocaleString()}.`}, ${false})
      `;

      if (immediateFailure) {
        throw new Error(response?.message ?? response?.error ?? `ZonmPay imekataa kuanzisha push (${status}).`);
      }

      return {
        paymentId,
        reference: zonReference || orderRef,
        status,
        pushedTo,
        message: `USSD Push imetumwa kwenye ${phone}. Angalia simu yako, weka PIN, kisha tumia sehemu ya NIMELIPIA hapa chini.`,
      };
    } catch (error) {
      await database.sql`
        UPDATE payment_requests
        SET payment_status = ${"FAILED"}, admin_status = ${"rejected"}, failure_reason = ${error instanceof Error ? error.message : "ZonmPay error"}
        WHERE id = ${paymentId}
      `.catch(() => null);
      throw error;
    }
  });

export const confirmPaymentRequest = createServerFn({ method: "POST" })
  .inputValidator((input: { paymentId: string; userId: string; phone: string }) => {
    if (!input?.paymentId || !input.userId || !input.phone) throw new Error("Taarifa za uthibitisho hazijakamilika.");
    return input;
  })
  .handler(async ({ data }) => {
    const database = db();
    const rows = await database.sql`
      SELECT * FROM payment_requests WHERE id = ${data.paymentId} AND user_id = ${data.userId} LIMIT 1
    `;
    const payment = rows[0];
    if (!payment) throw new Error("Payment request haijapatikana.");

    await database.sql`
      UPDATE payment_requests
      SET payer_phone = ${normalizePhone(data.phone)}, customer_confirmed = ${true}, customer_confirmed_at = NOW()
      WHERE id = ${data.paymentId}
    `;

    await database.sql`
      INSERT INTO admin_notifications (id, payment_id, title, message, is_read)
      VALUES (${crypto.randomUUID()}, ${data.paymentId}, ${"User amethibitisha malipo"}, ${`User ametuma uthibitisho wa malipo ya TZS ${Number(payment.amount).toLocaleString()}.`}, ${false})
    `;
    return { ok: true };
  });

export const getActivationStatus = createServerFn({ method: "POST" })
  .inputValidator((input: { paymentId: string; userId: string }) => input)
  .handler(async ({ data }) => {
    const database = db();
    const payments = await database.sql`
      SELECT id, payment_status, admin_status, admin_note, amount, service_label
      FROM payment_requests
      WHERE id = ${data.paymentId} AND user_id = ${data.userId}
      LIMIT 1
    `;
    const payment = payments[0] ?? null;
    if (!payment) return { found: false, paid: false, activated: false };
    const users = await database.sql`SELECT activated FROM fursa_users WHERE id = ${data.userId} LIMIT 1`;
    return {
      found: true,
      paid: ["PAID", "SUCCESSFUL", "PROCESSED"].includes(String(payment.payment_status).toUpperCase()),
      activated: Boolean(users[0]?.activated),
      status: payment.payment_status,
      adminStatus: payment.admin_status,
      note: payment.admin_note,
    };
  });

export const adminListPayments = createServerFn({ method: "POST" })
  .inputValidator((input: { password: string }) => input)
  .handler(async ({ data }) => {
    if (data.password !== env("ADMIN_PASSWORD")) throw new Error("Password ya admin si sahihi.");
    const database = db();
    const payments = await database.sql`
      SELECT p.*, json_build_object(
        'name', u.name,
        'username', u.username,
        'email', u.email,
        'phone', u.phone
      ) AS fursa_users
      FROM payment_requests p
      LEFT JOIN fursa_users u ON u.id = p.user_id
      ORDER BY p.created_at DESC
      LIMIT 200
    `;
    const notifications = await database.sql`
      SELECT * FROM admin_notifications ORDER BY created_at DESC LIMIT 50
    `;
    return { payments, notifications };
  });

export const adminSetPayment = createServerFn({ method: "POST" })
  .inputValidator((input: { password: string; paymentId: string; action: "approve" | "reject"; note?: string }) => input)
  .handler(async ({ data }) => {
    if (data.password !== env("ADMIN_PASSWORD")) throw new Error("Password ya admin si sahihi.");
    const database = db();
    const rows = await database.sql`SELECT * FROM payment_requests WHERE id = ${data.paymentId} LIMIT 1`;
    const payment = rows[0];
    if (!payment) throw new Error("Payment haijapatikana.");
    const approved = data.action === "approve";

    await database.sql`
      UPDATE payment_requests
      SET admin_status = ${approved ? "approved" : "rejected"}, admin_note = ${data.note ?? null}, reviewed_at = NOW()
      WHERE id = ${data.paymentId}
    `;

    if (approved) {
      await database.sql`
        UPDATE fursa_users SET activated = ${true}, activated_at = NOW()
        WHERE id = ${payment.user_id}
      `;
    }
    return { ok: true };
  });
