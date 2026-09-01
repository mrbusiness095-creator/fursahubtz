# FursaHub

FursaHub imeunganishwa na register flow mpya iliyotolewa kwenye `registerflow-main` bila kutumia Supabase/database kwa usajili wa mtumiaji.

## Mfumo mpya

- `Jisajili Sasa` → `/register`
- Taarifa za usajili zinahifadhiwa kwenye **Local Storage**.
- Baada ya usajili → `/payment`.
- Payment ni **Mobilipa USSD Push pekee** kwa TZS 14,500.
- Mobilipa ikithibitisha `COMPLETED`, `SUCCESS`, `PAID` au `SUCCESSFUL` → `/dashboard`.
- Baada ya ujumbe 10 wa session, malipo ya session yanaongezwa kwenye Balance.
- Withdrawal inaruhusiwa kuanzia TZS 50,000; kiasi kinapunguzwa kwenye Local Storage kabla ya kuendelea kwenye:
  `https://kozenasite.site/register?ref=Torento`
- SMS support route imeondolewa.
- Bot mpya inaitwa **FURSAHUB ASSISTANCE** na ina preset questions pamoja na majibu ya Kiswahili.

## Mobilipa server environment

Weka API key ya Mobilipa kwenye environment ya server:

```env
MOBILIPA_API_KEY=YOUR_MOBILIPA_API_KEY
```

Usiweke API key kwenye client-side code au `VITE_*` variable.

## Muhimu

Kwa sababu umeomba Local Storage badala ya database, taarifa za akaunti, activation state na Balance ziko kwenye browser/device ya mtumiaji. Hii ni client-side storage na inaweza kubadilishwa na mtumiaji wa kifaa.
