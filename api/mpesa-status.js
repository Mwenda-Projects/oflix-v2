// api/mpesa-status.js
// Rescues a subscription stuck on 'pending' by asking Safaricom's STK
// Query API what actually happened, for the case where Safaricom's own
// callback to /api/mpesa-callback never arrives. This does NOT replace
// the callback — it's a fallback the frontend calls once, after it has
// been polling the row for a while with no result.
//
// Limitation: the STK Query response only ever returns a result code
// and description, never the M-Pesa receipt number, phone, or amount —
// those only ever arrive via the callback's CallbackMetadata. So a
// payment rescued here upgrades correctly, but its receipt email will
// show "N/A" for the M-Pesa receipt instead of the real code.

import { createClient } from '@supabase/supabase-js'

const MPESA_BASE_URL = 'https://api.safaricom.co.ke'
const STORE_NUMBER = '9828218' // BusinessShortCode — same as mpesa-stk.js

const DURATION_DAYS = { monthly: 30, annual: 365 }
const EXPECTED_AMOUNT = { monthly: 299, annual: 2499 }

function getTimestamp() {
  const now = new Date()
  return (
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0')
  )
}

async function getAccessToken() {
  const credentials = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64')

  const response = await fetch(
    `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    { method: 'GET', headers: { Authorization: `Basic ${credentials}` } }
  )

  if (!response.ok) throw new Error(`Failed to get access token: ${await response.text()}`)
  const data = await response.json()
  return data.access_token
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    // ── Auth check: same pattern as mpesa-stk.js ────────────────
    const authHeader = req.headers.authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) {
      return res.status(401).json({ error: 'Missing authorization token' })
    }

    const supabaseAuth = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    )
    const { data: { user: callingUser }, error: authError } = await supabaseAuth.auth.getUser(token)
    if (authError || !callingUser) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: subscription, error: findError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', callingUser.id)
      .single()

    if (findError || !subscription || !subscription.checkout_request_id) {
      return res.status(404).json({ error: 'No payment attempt found for this account.' })
    }

    // Already resolved (either by the callback, or by a previous call
    // to this endpoint) — nothing to query, just report what we have.
    if (subscription.plan !== 'pending') {
      return res.status(200).json({
        resolved: true,
        resultCode: subscription.last_result_code,
        resultDesc: subscription.last_result_desc,
        plan: subscription.plan,
      })
    }

    // ── Ask Safaricom directly ──────────────────────────────────
    const passkey = process.env.VITE_MPESA_PASSKEY
    const timestamp = getTimestamp()
    const password = Buffer.from(`${STORE_NUMBER}${passkey}${timestamp}`).toString('base64')
    const accessToken = await getAccessToken()

    const queryResponse = await fetch(`${MPESA_BASE_URL}/mpesa/stkpushquery/v1/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: STORE_NUMBER,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: subscription.checkout_request_id,
      }),
    })

    const queryData = await queryResponse.json()
    console.log('STK status query response:', JSON.stringify(queryData))

    // Safaricom returns a generic error (no ResultCode) while the
    // transaction is still being processed on their side — this is
    // not a failure, it just means "still waiting", so the frontend
    // should keep polling the row as normal.
    if (queryData.ResultCode === undefined) {
      return res.status(200).json({ resolved: false, plan: 'pending' })
    }

    const resultCode = Number(queryData.ResultCode)
    const resultDesc = queryData.ResultDesc || 'Unknown result'

    if (resultCode !== 0) {
      // Failed or cancelled — restore whatever they had before this
      // attempt, same logic as the callback's failure branch.
      await supabase
        .from('subscriptions')
        .update({
          plan: subscription.previous_plan ?? 'free',
          billing_cycle: subscription.previous_billing_cycle ?? null,
          expires_at: subscription.previous_expires_at ?? null,
          previous_plan: null,
          previous_billing_cycle: null,
          previous_expires_at: null,
          last_result_code: resultCode,
          last_result_desc: resultDesc,
          updated_at: new Date().toISOString(),
        })
        .eq('checkout_request_id', subscription.checkout_request_id)
        .eq('plan', 'pending')

      return res.status(200).json({ resolved: true, resultCode, resultDesc, plan: subscription.previous_plan ?? 'free' })
    }

    // ── Success, but the callback never told us ─────────────────
    let billingCycle = subscription.billing_cycle
    if (!billingCycle) {
      billingCycle = 'monthly'
      console.warn('billing_cycle missing on subscription row during status rescue — defaulting to monthly')
    }

    const now = new Date()
    const currentExpiry = subscription.expires_at ? new Date(subscription.expires_at) : null
    const expiresAt = (currentExpiry && currentExpiry > now) ? currentExpiry : now
    expiresAt.setDate(expiresAt.getDate() + (DURATION_DAYS[billingCycle] || 30))

    const { error: upgradeError } = await supabase
      .from('subscriptions')
      .update({
        plan: 'pro',
        billing_cycle: billingCycle,
        expires_at: expiresAt.toISOString(),
        mpesa_phone: subscription.mpesa_phone,
        // Not available from STK Query — only the callback's
        // CallbackMetadata carries the real receipt code.
        mpesa_receipt: null,
        amount_paid: EXPECTED_AMOUNT[billingCycle] ?? null,
        previous_plan: null,
        previous_billing_cycle: null,
        previous_expires_at: null,
        last_result_code: 0,
        last_result_desc: resultDesc,
        updated_at: new Date().toISOString(),
      })
      .eq('checkout_request_id', subscription.checkout_request_id)
      // If the real callback lands between our query and this write,
      // the row will no longer be 'pending' and this update is a no-op
      // rather than a duplicate upgrade or a stomped receipt number.
      .eq('plan', 'pending')

    if (upgradeError) {
      console.error('Status-rescue upgrade failed:', upgradeError)
      return res.status(500).json({ error: 'Could not update subscription.' })
    }

    console.log(`User upgraded to PRO via status rescue (${billingCycle}):`, callingUser.id)

    // Best-effort receipt email, same lazy-import pattern as the
    // callback — a Resend hiccup here must not affect this response.
    try {
      const { data: userData } = await supabase.auth.admin.getUserById(callingUser.id)
      if (userData?.user?.email) {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        const planLabel = billingCycle === 'annual' ? 'Pro Annual' : 'Pro Monthly'
        const formattedExpiry = expiresAt.toLocaleDateString('en-KE', {
          year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Africa/Nairobi',
        })
        await resend.emails.send({
          from: 'OfliX <receipts@mail.oflix.space>',
          to: [userData.user.email],
          replyTo: 'hello@oflix.space',
          subject: `Payment received — ${planLabel} is now active`,
          html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
              <h1 style="color: #1a1a1a; font-size: 22px;">Payment received</h1>
              <p style="color: #555; line-height: 1.6;">Your OfliX ${planLabel} subscription is now active. Renews / expires ${formattedExpiry}.</p>
              <p style="color: #888; font-size: 13px;">Questions? Reply to this email or reach us at hello@oflix.space.</p>
            </div>
          `,
        })
      }
    } catch (emailError) {
      console.error('Status-rescue receipt email failed (upgrade itself was unaffected):', emailError)
    }

    return res.status(200).json({ resolved: true, resultCode: 0, resultDesc, plan: 'pro' })

  } catch (error) {
    console.error('mpesa-status error:', error)
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}