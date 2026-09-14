import { createServerFn } from "@tanstack/react-start";
import { db } from "./netlify-db";

export const ACTIVATION_FEES = {
  chat: 12000,
  mikopo: 15000,
  ajira: 20000,
} as const;

export type ActivationService = keyof typeof ACTIVATION_FEES;

function normalizePhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("255")) return `+${digits}`;
  if (digits.startsWith("0")) return `+255${digits.slice(1)}`;
  return `+255${digits}`;
}

function serviceLabel(service: ActivationService) {
  return service === "chat" ? "Chat na Kulipwa" : service === "mikopo" ? "Mikopo" : "Ajira Nje";
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
    const rows = await database.sql`
      INSERT INTO fursa_users (id, name, username, phone, email, country, service, activation_fee, activated)
      VALUES (${data.id}, ${data.name.trim()}, ${data.username.trim()}, ${normalizePhone(data.phone)}, ${data.email.trim().toLowerCase()}, ${data.country}, ${data.service}, ${fee}, ${false})
      RETURNING *
    `;
    return { user: rows[0] ?? null, fee };
  });

/** User confirms that they have paid the displayed Lipa Namba. Admin manually verifies and activates. */
export const confirmPaymentRequest = createServerFn({ method: "POST" })
  .inputValidator((input: { userId: string; phone: string; service: ActivationService }) => {
    if (!input?.userId || !input.phone) throw new Error("Weka namba ya simu uliyotumia kulipia.");
    if (!(input.service in ACTIVATION_FEES)) throw new Error("Huduma haijachaguliwa.");
    return input;
  })
  .handler(async ({ data }) => {
    const database = db();
    const fee = ACTIVATION_FEES[data.service];
    const phone = normalizePhone(data.phone);
    const paymentId = crypto.randomUUID();
    const orderRef = `FURSA-MANUAL-${data.userId.slice(0, 8)}-${Date.now()}`;

    const userRows = await database.sql`
      SELECT id, name, username, service FROM fursa_users WHERE id = ${data.userId} LIMIT 1
    `;
    if (!userRows[0]) throw new Error("Account ya user haijapatikana.");

    const rows = await database.sql`
      INSERT INTO payment_requests
        (id, user_id, customer_reference, service, service_label, amount, payer_phone, payment_status, admin_status, customer_confirmed, customer_confirmed_at)
      VALUES
        (${paymentId}, ${data.userId}, ${orderRef}, ${data.service}, ${serviceLabel(data.service)}, ${fee}, ${phone}, ${"CUSTOMER_REPORTED"}, ${"pending"}, ${true}, NOW())
      RETURNING *
    `;
    if (!rows[0]) throw new Error("Taarifa ya malipo haikuweza kuhifadhiwa.");

    await database.sql`
      INSERT INTO admin_notifications (id, payment_id, title, message, is_read)
      VALUES (
        ${crypto.randomUUID()}, ${paymentId},
        ${"Malipo mapya yanasubiri uthibitisho"},
        ${`${userRows[0].name} (${userRows[0].username}) ameripoti amelipa TZS ${fee.toLocaleString()} kupitia Lipa Namba 251161660. Namba aliyolipia: ${phone}.`},
        ${false}
      )
    `;

    return { ok: true, paymentId, reference: orderRef, amount: fee };
  });

export const getActivationStatus = createServerFn({ method: "POST" })
  .inputValidator((input: { paymentId?: string; userId: string }) => input)
  .handler(async ({ data }) => {
    const database = db();
    const payments = data.paymentId
      ? await database.sql`SELECT id, payment_status, admin_status, admin_note, amount, service_label FROM payment_requests WHERE id = ${data.paymentId} AND user_id = ${data.userId} LIMIT 1`
      : await database.sql`SELECT id, payment_status, admin_status, admin_note, amount, service_label FROM payment_requests WHERE user_id = ${data.userId} ORDER BY created_at DESC LIMIT 1`;
    const payment = payments[0] ?? null;
    const users = await database.sql`SELECT activated FROM fursa_users WHERE id = ${data.userId} LIMIT 1`;
    return {
      found: Boolean(payment),
      paid: String(payment?.admin_status).toLowerCase() === "approved",
      activated: Boolean(users[0]?.activated),
      status: payment?.payment_status ?? null,
      adminStatus: payment?.admin_status ?? null,
      note: payment?.admin_note ?? null,
    };
  });

export const adminListPayments = createServerFn({ method: "POST" })
  .inputValidator((input: { password: string }) => input)
  .handler(async ({ data }) => {
    if (data.password !== process.env.ADMIN_PASSWORD) throw new Error("Password ya admin si sahihi.");
    const database = db();
    const payments = await database.sql`
      SELECT p.*, json_build_object('name', u.name, 'username', u.username, 'email', u.email, 'phone', u.phone) AS fursa_users
      FROM payment_requests p LEFT JOIN fursa_users u ON u.id = p.user_id
      ORDER BY p.created_at DESC LIMIT 200
    `;
    const notifications = await database.sql`SELECT * FROM admin_notifications ORDER BY created_at DESC LIMIT 50`;
    return { payments, notifications };
  });

export const adminSetPayment = createServerFn({ method: "POST" })
  .inputValidator((input: { password: string; paymentId: string; action: "approve" | "reject"; note?: string }) => input)
  .handler(async ({ data }) => {
    if (data.password !== process.env.ADMIN_PASSWORD) throw new Error("Password ya admin si sahihi.");
    const database = db();
    const rows = await database.sql`SELECT * FROM payment_requests WHERE id = ${data.paymentId} LIMIT 1`;
    const payment = rows[0];
    if (!payment) throw new Error("Payment haijapatikana.");
    const approved = data.action === "approve";

    await database.sql`
      UPDATE payment_requests
      SET admin_status = ${approved ? "approved" : "rejected"}, payment_status = ${approved ? "PAID" : "REJECTED"}, admin_note = ${data.note ?? null}, reviewed_at = NOW()
      WHERE id = ${data.paymentId}
    `;
    await database.sql`
      INSERT INTO admin_notifications (id, payment_id, title, message, is_read)
      VALUES (${crypto.randomUUID()}, ${data.paymentId}, ${approved ? "Account ime-activate" : "Malipo yamekataliwa"}, ${approved ? "Admin amethibitisha malipo na account imefunguliwa." : "Admin amekataa uthibitisho wa malipo."}, ${false})
    `;

    if (approved) {
      await database.sql`UPDATE fursa_users SET activated = ${true}, activated_at = NOW() WHERE id = ${payment.user_id}`;
    }
    return { ok: true };
  });
