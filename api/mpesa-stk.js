// api/mpesa-stk.js
// OfliX subscription STK push
// Uses exact same pattern as The Mwenda Chronicles stk-push.ts

import { createClient } from '@supabase/supabase-js'

const MPESA_BASE_URL = 'https://api.safaricom.co.ke'
const STORE_NUMBER   = '9828218'   // BusinessShortCode — same as blog
const TILL_NUMBER    = '3206805'   // PartyB — same as blog

const PLANS = {
  basic: { amount: 499, label: 'OfliX Basic' },
  pro:   { amount: 999, label: 'OfliX Pro'   },
}

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

    // Format phone → 254XXXXXXXXX — exact same as blog
    const formattedPhone = phone.startsWith('0')
      ? `254${phone.slice(1)}`
      : phone.startsWith('+254')
      ? phone.slice(1)
      : phone

    const passkey     = process.env.VITE_MPESA_PASSKEY
    const callbackUrl = `https://oflix-v2.vercel.app/api/mpesa-callback`
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
        Amount:            Math.round(planDetails.amount),
        PartyA:            formattedPhone,
        PartyB:            TILL_NUMBER,               // exact same as blog
        PhoneNumber:       formattedPhone,
        CallBackURL:       callbackUrl,
        AccountReference:  'OfliX',
        TransactionDesc:   `OfliX: ${planDetails.label}`,
      }),
    })

    const stkData = await stkResponse.json()

    console.log('STK response:', JSON.stringify(stkData))

    if (!stkResponse.ok || stkData.ResponseCode !== '0') {
      return res.status(400).json({
        error: stkData.errorMessage || stkData.ResponseDescription || 'STK Push failed',
      })
    }

    // Save pending subscription
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    await supabase.from('subscriptions').upsert({
      user_id:             userId,
      plan:                'pending',
      mpesa_phone:         formattedPhone,
      checkout_request_id: stkData.CheckoutRequestID,
      updated_at:          new Date().toISOString(),
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