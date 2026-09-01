#!/usr/bin/env bash
# One-shot setup: pushes the Supabase schema and syncs Vercel production env vars,
# then triggers a production deploy. Run this on your own machine (not in a
# restricted sandbox) since it needs real network access to supabase.com and
# vercel.com.
#
# Nothing here is committed with real values — every credential below is read
# from your shell environment. Export what you have, then run this script.
#
# Required:
#   SUPABASE_PROJECT_REF        e.g. gedpcvnxcrflyphbibgh
#   SUPABASE_ACCESS_TOKEN       personal access token: supabase.com/dashboard/account/tokens
#   SUPABASE_DB_PASSWORD        the Postgres password set when the project was created
#   VERCEL_TOKEN                vercel.com/account/tokens
#   VERCEL_PROJECT_ID           e.g. prj_xxxxxxxxxxxxxxxxxxxxxxxx
#   VERCEL_ORG_ID               team/org id shown in Vercel project settings > General
#   NEXT_PUBLIC_SUPABASE_URL    https://<ref>.supabase.co
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
#   SUPABASE_SERVICE_ROLE_KEY
#   NEXT_PUBLIC_APP_URL         https://erica.tranquilitytravel.site
#   STRIPE_SECRET_KEY
#
# Optional (skipped with a warning if unset):
#   STRIPE_WEBHOOK_SECRET, STRIPE_SEAT_PRICE_ID, STRIPE_USAGE_PRICE_ID,
#   RESEND_API_KEY, EMAIL_FROM
#
# Usage:
#   export SUPABASE_PROJECT_REF=... SUPABASE_ACCESS_TOKEN=... SUPABASE_DB_PASSWORD=... \
#          VERCEL_TOKEN=... VERCEL_PROJECT_ID=... VERCEL_ORG_ID=... \
#          NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
#          SUPABASE_SERVICE_ROLE_KEY=... NEXT_PUBLIC_APP_URL=... STRIPE_SECRET_KEY=...
#   ./scripts/deploy.sh

set -euo pipefail
cd "$(dirname "$0")/.."

required=(SUPABASE_PROJECT_REF SUPABASE_ACCESS_TOKEN SUPABASE_DB_PASSWORD VERCEL_TOKEN VERCEL_PROJECT_ID VERCEL_ORG_ID \
  NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY NEXT_PUBLIC_APP_URL STRIPE_SECRET_KEY)
missing=()
for v in "${required[@]}"; do [ -z "${!v:-}" ] && missing+=("$v"); done
if [ ${#missing[@]} -gt 0 ]; then
  echo "Missing required env vars: ${missing[*]}" >&2
  exit 1
fi

command -v supabase >/dev/null || { echo "Installing Supabase CLI..."; npm install -g supabase; }
command -v vercel >/dev/null || { echo "Installing Vercel CLI..."; npm install -g vercel; }

echo "==> Linking and pushing Supabase schema ($SUPABASE_PROJECT_REF)"
supabase link --project-ref "$SUPABASE_PROJECT_REF"
supabase db push --password "$SUPABASE_DB_PASSWORD"

echo "==> Linking Vercel project ($VERCEL_PROJECT_ID)"
mkdir -p .vercel
cat > .vercel/project.json <<JSON
{"projectId":"$VERCEL_PROJECT_ID","orgId":"$VERCEL_ORG_ID"}
JSON

set_env() {
  local name="$1" value="$2"
  [ -z "$value" ] && { echo "  skipping $name (not set)"; return; }
  vercel env rm "$name" production --token "$VERCEL_TOKEN" --yes >/dev/null 2>&1 || true
  printf '%s' "$value" | vercel env add "$name" production --token "$VERCEL_TOKEN" >/dev/null
  echo "  set $name"
}

echo "==> Syncing production env vars"
set_env NEXT_PUBLIC_SUPABASE_URL "$NEXT_PUBLIC_SUPABASE_URL"
set_env NEXT_PUBLIC_SUPABASE_ANON_KEY "$NEXT_PUBLIC_SUPABASE_ANON_KEY"
set_env SUPABASE_SERVICE_ROLE_KEY "$SUPABASE_SERVICE_ROLE_KEY"
set_env NEXT_PUBLIC_APP_URL "$NEXT_PUBLIC_APP_URL"
set_env STRIPE_SECRET_KEY "$STRIPE_SECRET_KEY"
set_env STRIPE_WEBHOOK_SECRET "${STRIPE_WEBHOOK_SECRET:-}"
set_env STRIPE_SEAT_PRICE_ID "${STRIPE_SEAT_PRICE_ID:-}"
set_env STRIPE_USAGE_PRICE_ID "${STRIPE_USAGE_PRICE_ID:-}"
set_env RESEND_API_KEY "${RESEND_API_KEY:-}"
set_env EMAIL_FROM "${EMAIL_FROM:-}"

echo "==> Deploying to production"
vercel deploy --prod --token "$VERCEL_TOKEN"

cat <<'NEXT'

Done. Two things this script cannot do for you:
1. Vercel dashboard -> your project -> Domains -> add erica.tranquilitytravel.site,
   then add the DNS record it shows you at your domain's DNS provider.
2. Stripe dashboard -> Webhooks -> add an endpoint at
   https://erica.tranquilitytravel.site/api/webhooks/stripe, subscribe to
   customer.subscription.created/updated/deleted, copy the signing secret into
   STRIPE_WEBHOOK_SECRET (re-run this script after exporting it to sync that var
   and redeploy).
NEXT
