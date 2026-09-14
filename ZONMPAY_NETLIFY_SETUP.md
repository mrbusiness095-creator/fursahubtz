# FursaHub — ZonmPay + Admin Setup

## 1. Supabase
Run `supabase.schema.sql` in Supabase SQL Editor.

## 2. Netlify Environment Variables
Add these server-side variables:

- `ZONMPAY_API_KEY` = your ZonmPay live key
- `ZONMPAY_WEBHOOK_SECRET` = the `whsec_...` secret shown after registering the webhook
- `SUPABASE_URL` = your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` = Supabase service role key
- `ADMIN_PASSWORD` = strong admin password

Do not use `VITE_` for any secret.

## 3. ZonmPay webhook
In ZonmPay Developer settings register:

`https://YOUR-DOMAIN/.netlify/functions/zonmpay-webhook`

Copy the generated `whsec_...` secret into `ZONMPAY_WEBHOOK_SECRET` in Netlify.

## 4. Deploy
Netlify build command:

`bun run build`

Publish directory:

`dist`

After adding/changing environment variables, trigger a new deploy.

## 5. Admin
Open:

`https://YOUR-DOMAIN/admin`

Use the password from `ADMIN_PASSWORD`.

Admin sees payment requests, ZonmPay references, user details and notifications. Approving a payment activates the user.
