// ZonmPay push/webhook is intentionally unused in the manual Lipa Namba flow.
// Kept as a harmless endpoint so old deployments do not break if a webhook URL exists.
export default async () => new Response("Lipa Namba manual flow active", { status: 200 });
