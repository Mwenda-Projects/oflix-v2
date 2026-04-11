// api/mpesa-stk.js
// Triggers M-Pesa STK push for OfliX subscription payments
// Adapted from The Mwenda Chronicles store implementation

import { createClient } from '@supabase/supabase-js'

const MPESA_BASE_URL = 'https://api.safaricom.co.ke'

// ── Plans ──────────────────────────────────────────────────────
const PLANS = {
  basic: { amount: 499, name: 'OfliX Basic', label: 'Basic Plan — KES 499/month' },
  pro:   { amount: 999, name: 'OfliX Pro',   label: 'Pro Plan — KES 999/month'   },
}

// ── Helpers ────────────────────────────────────────────────────
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

// ── Handler ────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { phone, plan, userId } = req.body

    if (!phone || !plan || !userId) {
      return res.status(400).json({ error: 'Phone, plan and userId are required' })
    }

    const planDetails = PLANS[plan]
    if (!planDetails) {
      return res.status(400).json({ error: 'Invalid plan. Choose basic or pro.' })
    }

    // Format phone → 254XXXXXXXXX
    const formattedPhone = phone.startsWith('0')
      ? `254${phone.slice(1)}`
      : phone.startsWith('+254')
      ? phone.slice(1)
      : phone

    const shortcode   = process.env.VITE_MPESA_SHORTCODE
    const passkey     = process.env.VITE_MPESA_PASSKEY
    const callbackUrl = `${process.env.VITE_MPESA_CALLBACK_URL || 'https://oflix-v2.vercel.app'}/api/mpesa-callback`
    const timestamp   = getTimestamp()
    const password    = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64')
    const accessToken = await getAccessToken()

    // Trigger STK push
    const stkResponse = await fetch(`${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password:          password,
        Timestamp:         timestamp,
        TransactionType:   'CustomerPayBillOnline',
        Amount:            planDetails.amount,
        PartyA:            formattedPhone,
        PartyB:            shortcode,
        PhoneNumber:       formattedPhone,
        CallBackURL:       callbackUrl,
        AccountReference:  'OfliX',
        TransactionDesc:   planDetails.label,
      }),
    })

    const stkData = await stkResponse.json()

    if (!stkResponse.ok || stkData.ResponseCode !== '0') {
      return res.status(400).json({
        error: stkData.errorMessage || stkData.ResponseDescription || 'STK Push failed',
      })
    }

    // Save pending subscription to Supabase
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    await supabase.from('subscriptions').upsert({
      user_id:              userId,
      plan:                 'pending',
      mpesa_phone:          formattedPhone,
      checkout_request_id:  stkData.CheckoutRequestID,
      updated_at:           new Date().toISOString(),
    }, { onConflict: 'user_id' })

    return res.status(200).json({
      success:           true,
      message:           'Check your phone and enter your M-Pesa PIN to complete payment.',
      checkoutRequestId: stkData.CheckoutRequestID,
    })

  } catch (error) {
    console.error('STK Push error:', error)
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}