// api/mpesa-stk.js
// OfliX subscription STK push
// Uses exact same pattern as The Mwenda Chronicles stk-push.ts

import { createClient } from '@supabase/supabase-js'

const MPESA_BASE_URL = 'https://api.safaricom.co.ke'
const STORE_NUMBER   = '9828218'   // BusinessShortCode — same as blog
const TILL_NUMBER    = '3206805'   // PartyB — same as blog

// Basic tier retired — Pro is now billed monthly or annually.
// Amount is ALWAYS looked up here, server-side, keyed by billingCycle.
// It is never taken from the request body, so a tampered request can
// only select between these two fixed prices — never an arbitrary amount.
const BILLING = {
  monthly: { amount: 299,  label: 'OfliX Pro Monthly' },
  annual:  { amount: 2499, label: 'OfliX Pro Annual'  },
}

const PHONE_REGEX = /^(?:0|\+?254)(7\d{8}|1\d{8})$/

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
    const { phone, billingCycle, userId } = req.body

    if (!phone || !billingCycle || !userId) {
      return res.status(400).json({ error: 'Phone, billingCycle and userId are required' })
    }

    const cycleDetails = BILLING[billingCycle]
    if (!cycleDetails) {
      return res.status(400).json({ error: 'Invalid billing cycle. Choose monthly or annual.' })
    }

    // ── Auth check: confirm the caller actually IS this userId ─────
    // Without this, anyone can POST any userId + phone and trigger an
    // STK push against a stranger's number, or overwrite a stranger's
    // subscription row. The client must send its Supabase access token.
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
    if (authError || !callingUser || callingUser.id !== userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // ── Phone validation ─────────────────────────────────────────
    const cleanPhone = phone.replace(/\s/g, '')
    if (!PHONE_REGEX.test(cleanPhone)) {
      return res.status(400).json({ error: 'Enter a valid Safaricom M-Pesa number.' })
    }

    const formattedPhone = cleanPhone.startsWith('0')
      ? `254${cleanPhone.slice(1)}`
      : cleanPhone.startsWith('+254')
      ? cleanPhone.slice(1)
      : cleanPhone

    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // ── Lightweight throttle: block rapid repeat STK triggers ──────
    // Stops one authenticated user from hammering Safaricom's API /
    // spamming their own phone with repeated prompts.
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('updated_at, plan, billing_cycle, expires_at, previous_plan, previous_billing_cycle, previous_expires_at')
      .eq('user_id', userId)
      .single()

    if (existing?.plan === 'pending' && existing.updated_at) {
      const secondsSinceLast = (Date.now() - new Date(existing.updated_at).getTime()) / 1000
      if (secondsSinceLast < 30) {
        return res.status(429).json({ error: 'Please wait before requesting another payment prompt.' })
      }
    }

    // ── Snapshot the user's real entitlement before we touch it ────
    // If they're already mid-attempt (plan is currently 'pending' from
    // a prior try), carry forward THAT attempt's snapshot rather than
    // re-snapshotting 'pending' itself — otherwise a second failed
    // retry would permanently lose whatever they had before the FIRST
    // attempt (e.g. an active Pro subscriber renewing early).
    const snapshotPlan         = existing?.plan === 'pending' ? (existing.previous_plan ?? 'free') : (existing?.plan ?? 'free')
    const snapshotBillingCycle = existing?.plan === 'pending' ? (existing.previous_billing_cycle ?? null) : (existing?.billing_cycle ?? null)
    const snapshotExpiresAt    = existing?.plan === 'pending' ? (existing.previous_expires_at ?? null) : (existing?.expires_at ?? null)

    const passkey     = process.env.VITE_MPESA_PASSKEY
    const callbackUrl = `https://oflix-v2.vercel.app/api/mpesa-callback?token=${process.env.MPESA_CALLBACK_SECRET}`
    const timestamp   = getTimestamp()
    const password    = Buffer.from(`${STORE_NUMBER}${passkey}${timestamp}`).toString('base64')
    const accessToken = await getAccessToken()

    // STK push — exact same structure as blog stk-push.ts
    const stkResponse = await fetch(`${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: STORE_NUMBER,
        Password:          password,
        Timestamp:         timestamp,
        TransactionType:   'CustomerBuyGoodsOnline',  // exact same as blog
        Amount:            Math.round(cycleDetails.amount),
        PartyA:            formattedPhone,
        PartyB:            TILL_NUMBER,               // exact same as blog
        PhoneNumber:       formattedPhone,
        CallBackURL:       callbackUrl,
        AccountReference:  'OfliX',
        TransactionDesc:   `OfliX: ${cycleDetails.label}`,
      }),
    })

    const stkData = await stkResponse.json()

    console.log('STK response:', JSON.stringify(stkData))

    if (!stkResponse.ok || stkData.ResponseCode !== '0') {
      return res.status(400).json({
        error: stkData.errorMessage || stkData.ResponseDescription || 'STK Push failed',
      })
    }

    // Save pending subscription — billing_cycle is stored NOW so the
    // callback (which only gets CheckoutRequestID from Safaricom) knows
    // whether to activate monthly or annual once payment is confirmed.
    // previous_* fields let a FAILED payment restore exactly what the
    // user had before, instead of wiping an active Pro subscriber to free.
    await supabase.from('subscriptions').upsert({
      user_id:                userId,
      plan:                   'pending',
      billing_cycle:          billingCycle,
      mpesa_phone:            formattedPhone,
      checkout_request_id:    stkData.CheckoutRequestID,
      previous_plan:          snapshotPlan,
      previous_billing_cycle: snapshotBillingCycle,
      previous_expires_at:    snapshotExpiresAt,
      updated_at:             new Date().toISOString(),
    }, { onConflict: 'user_id' })

    return res.status(200).json({
      success:           true,
      message:           'Check your phone and enter your M-Pesa PIN.',
      checkoutRequestId: stkData.CheckoutRequestID,
    })

  } catch (error) {
    console.error('STK Push error:', error)
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}