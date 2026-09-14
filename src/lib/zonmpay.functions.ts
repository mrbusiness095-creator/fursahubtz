import { createServerFn } from "@tanstack/react-start";

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

function supabaseConfig() {
  return {
    url: env("SUPABASE_URL").replace(/\/$/, ""),
    key: env("SUPABASE_SERVICE_ROLE_KEY"),
  };
}

async function supabase(path: string, init: RequestInit = {}) {
  const { url, key } = supabaseConfig();
  const headers = new Headers(init.headers);
  headers.set("apikey", key);
  headers.set("Authorization", `Bearer ${key}`);
  headers.set("Content-Type", "application/json");
  headers.set("Prefer", headers.get("Prefer") ?? "return=representation");
  const response = await fetch(`${url}/rest/v1/${path}`, { ...init, headers });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(data?.message ?? data?.hint ?? data?.error_description ?? "Database request imeshindikana.");
  }
  return data;
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
    const fee = ACTIVATION_FEES[data.service];
    const rows = await supabase("fursa_users", {
      method: "POST",
      body: JSON.stringify({
        id: data.id,
        name: data.name.trim(),
        username: data.username.trim(),
        phone: normalizePhone(data.phone),
        email: data.email.trim().toLowerCase(),
        country: data.country,
        service: data.service,
        activation_fee: fee,
        activated: false,
      }),
    });
    return { user: rows?.[0] ?? null, fee };
  });

export const startZonmPayPayment = createServerFn({ method: "POST" })
  .inputValidator((input: { userId: string; phone: string; service: ActivationService }) => {
    if (!input?.userId || !input.phone) throw new Error("User na namba ya simu vinahitajika.");
    if (!(input.service in ACTIVATION_FEES)) throw new Error("Huduma haijachaguliwa.");
    return input;
  })
  .handler(async ({ data }) => {
    const fee = ACTIVATION_FEES[data.service];
    const orderRef = `FURSA-${data.userId.slice(0, 8)}-${Date.now()}`;
    const phone = normalizePhone(data.phone);

    const paymentRows = await supabase("payment_requests", {
      method: "POST",
      body: JSON.stringify({
        user_id: data.userId,
        customer_reference: orderRef,
        service: data.service,
        service_label: serviceLabel(data.service),
        amount: fee,
        payer_phone: phone,
        payment_status: "PENDING",
        admin_status: "pending",
      }),
    });

    const localPayment = paymentRows?.[0];
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

      await supabase(`payment_requests?id=eq.${encodeURIComponent(localPayment.id)}`, {
        method: "PATCH",
        body: JSON.stringify({
          zonmpay_reference: zonReference || null,
          payment_status: status,
          provider_response: response,
        }),
      });

      await supabase("admin_notifications", {
        method: "POST",
        body: JSON.stringify({
          payment_id: localPayment.id,
          title: "Payment request mpya",
          message: `User ameanzisha malipo ya TZS ${fee.toLocaleString()}.`,
          is_read: false,
        }),
      }).catch(() => null);

      return { paymentId: localPayment.id, reference: zonReference || orderRef, status, message: "USSD Push imetumwa. Ingiza PIN kwenye simu yako, kisha bonyeza NIMELIPIA." };
    } catch (error) {
      await supabase(`payment_requests?id=eq.${encodeURIComponent(localPayment.id)}`, {
        method: "PATCH",
        body: JSON.stringify({ payment_status: "FAILED", admin_status: "rejected", failure_reason: error instanceof Error ? error.message : "ZonmPay error" }),
      }).catch(() => null);
      throw error;
    }
  });

export const confirmPaymentRequest = createServerFn({ method: "POST" })
  .inputValidator((input: { paymentId: string; userId: string; phone: string }) => {
    if (!input?.paymentId || !input.userId || !input.phone) throw new Error("Taarifa za uthibitisho hazijakamilika.");
    return input;
  })
  .handler(async ({ data }) => {
    const rows = await supabase(`payment_requests?id=eq.${encodeURIComponent(data.paymentId)}&user_id=eq.${encodeURIComponent(data.userId)}&select=*`);
    const payment = rows?.[0];
    if (!payment) throw new Error("Payment request haijapatikana.");
    await supabase(`payment_requests?id=eq.${encodeURIComponent(data.paymentId)}`, {
      method: "PATCH",
      body: JSON.stringify({ payer_phone: normalizePhone(data.phone), customer_confirmed: true, customer_confirmed_at: new Date().toISOString() }),
    });
    await supabase("admin_notifications", {
      method: "POST",
      body: JSON.stringify({ payment_id: data.paymentId, title: "User amethibitisha malipo", message: `User ametuma uthibitisho wa malipo ya TZS ${Number(payment.amount).toLocaleString()}.`, is_read: false }),
    }).catch(() => null);
    return { ok: true };
  });

export const getActivationStatus = createServerFn({ method: "POST" })
  .inputValidator((input: { paymentId: string; userId: string }) => input)
  .handler(async ({ data }) => {
    const rows = await supabase(`payment_requests?id=eq.${encodeURIComponent(data.paymentId)}&user_id=eq.${encodeURIComponent(data.userId)}&select=id,payment_status,admin_status,admin_note,amount,service_label`);
    const payment = rows?.[0] ?? null;
    if (!payment) return { found: false, paid: false, activated: false };
    const users = await supabase(`fursa_users?id=eq.${encodeURIComponent(data.userId)}&select=activated`);
    return { found: true, paid: ["PAID", "SUCCESSFUL"].includes(String(payment.payment_status).toUpperCase()), activated: Boolean(users?.[0]?.activated), status: payment.payment_status, adminStatus: payment.admin_status, note: payment.admin_note };
  });

export const adminListPayments = createServerFn({ method: "POST" })
  .inputValidator((input: { password: string }) => input)
  .handler(async ({ data }) => {
    if (data.password !== env("ADMIN_PASSWORD")) throw new Error("Password ya admin si sahihi.");
    const payments = await supabase("payment_requests?select=*,fursa_users(name,username,email,phone)&order=created_at.desc&limit=200");
    const notifications = await supabase("admin_notifications?select=*&order=created_at.desc&limit=50");
    return { payments, notifications };
  });

export const adminSetPayment = createServerFn({ method: "POST" })
  .inputValidator((input: { password: string; paymentId: string; action: "approve" | "reject"; note?: string }) => input)
  .handler(async ({ data }) => {
    if (data.password !== env("ADMIN_PASSWORD")) throw new Error("Password ya admin si sahihi.");
    const rows = await supabase(`payment_requests?id=eq.${encodeURIComponent(data.paymentId)}&select=*`);
    const payment = rows?.[0];
    if (!payment) throw new Error("Payment haijapatikana.");
    const approved = data.action === "approve";
    await supabase(`payment_requests?id=eq.${encodeURIComponent(data.paymentId)}`, {
      method: "PATCH",
      body: JSON.stringify({ admin_status: approved ? "approved" : "rejected", admin_note: data.note ?? null, reviewed_at: new Date().toISOString() }),
    });
    if (approved) {
      await supabase(`fursa_users?id=eq.${encodeURIComponent(payment.user_id)}`, { method: "PATCH", body: JSON.stringify({ activated: true, activated_at: new Date().toISOString() }) });
    }
    return { ok: true };
  });
