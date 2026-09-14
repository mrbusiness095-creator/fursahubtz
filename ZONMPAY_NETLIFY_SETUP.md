# FursaHub + ZonmPay + Netlify Database

FursaHub sasa inatumia **Netlify Database (Postgres)** moja kwa moja; hakuna Supabase inayohitajika.

## 1. Netlify Database

Kwenye Netlify project yako:

**Project configuration → Data & storage → Database**

Hakikisha production database iko active. Netlify Database ni Postgres iliyounganishwa moja kwa moja na project. Package ya `@netlify/database` ndiyo inayotumika na app, na Netlify huapply migrations zilizo ndani ya `netlify/database/migrations/` wakati wa deploy.

## 2. Environment Variables

Weka hizi kwenye Netlify → Project configuration → Environment variables:

- `ZONMPAY_API_KEY` = API key yako ya ZonmPay (server-only)
- `ZONMPAY_WEBHOOK_SECRET` = webhook signing secret kutoka ZonmPay (server-only)
- `ADMIN_PASSWORD` = password ya `/admin`

Usiweke `ZONMPAY_API_KEY` kwenye `VITE_...` na usiiweke ndani ya source code.

`NETLIFY_DB_URL` hutolewa na Netlify Database. Usii-copy kwenye repository.

## 3. Database tables

Migration hii tayari ipo:

`netlify/database/migrations/20260914150000_create_fursahub_tables.sql`

Itatengeneza:

- `fursa_users`
- `payment_requests`
- `admin_notifications`

## 4. ZonmPay webhook

Weka webhook URL kwenye ZonmPay:

`https://DOMAIN-YAKO.NETLIFY.APP/.netlify/functions/zonmpay-webhook`

Tumia signing secret ya webhook kwenye `ZONMPAY_WEBHOOK_SECRET`.

Webhook inasikiliza `payment.confirmed` na `payment.failed`, kisha ina-update Netlify Database.

## 5. Activation fees

- Chat na Kulipwa: TZS 14,000
- Mikopo: TZS 15,000
- Ajira Nje: TZS 16,000

Flow ni: Register → USSD Push ya ZonmPay → user `NIMELIPIA` → admin anaona request → admin approve/reject → account ina-activate.

## 6. Admin

Fungua `/admin`, tumia `ADMIN_PASSWORD` uliyoweka kwenye Netlify.

> Muhimu: API key ya ZonmPay iliyowahi kuwekwa kwenye chat inapaswa ku-rotate/revoke kwa sababu secret keys hazipaswi kushirikiwa hadharani. Weka key mpya tu kwenye Netlify Environment Variables.
