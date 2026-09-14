# FursaHub — Lipa Namba Manual Flow

Malipo ya FursaHub hayatumii tena USSD Push/ZonmPay. User analipa moja kwa moja kwa Lipa Namba **251161660**, jina la biashara **ASSERT BRIDGE**.

## Amounts
- Chat na Kulipwa: TZS 12,000
- Mikopo: TZS 15,000
- Ajira Nje: TZS 20,000

## User flow
1. User anachagua huduma wakati wa usajili.
2. Payment page inaonyesha amount kulingana na huduma.
3. User ana-copy Lipa Namba 251161660.
4. User anafuata USSD menu ya mtandao wake.
5. Baada ya kulipa anaweka namba aliyotumia kulipia.
6. Anabonyeza **NIMELIPIA**.
7. Taarifa inaingia Netlify Database na admin notification.
8. Admin anaingia `/admin`, anathibitisha malipo kisha **APPROVE & ACTIVATE**.
9. Account ya user inakuwa active.

## Netlify Environment Variables
- `ADMIN_PASSWORD` — required
- Netlify Database connection is managed by Netlify.
- `ZONMPAY_API_KEY` and `ZONMPAY_WEBHOOK_SECRET` are no longer needed for this flow.
