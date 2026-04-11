// api/mpesa-callback.js
// Receives Safaricom payment confirmation and upgrades user's plan
// Adapted from The Mwenda Chronicles callback implementation

import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  console.log('OfliX M-Pesa callback received:', JSON.stringify(req.body))

  try {
    const stkCallback = req.body?.Body?.stkCallback
    if (!stkCallback) {
      console.log('No stkCallback in body — ignoring')
      return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' })
    }

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback
    const isSuccess = ResultCode === 0

    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // ── Payment failed ────────────────────────────────────────
    if (!isSuccess) {
      await supabase
        .from('subscriptions')
        .update({ plan: 'free', updated_at: new Date().toISOString() })
        .eq('checkout_request_id', CheckoutRequestID)

      console.log('❌ Payment failed:', { CheckoutRequestID, ResultDesc })
      return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' })
    }

    // ── Extract payment details ───────────────────────────────
    let mpesaReceiptNumber = null
    let phoneNumber = null
    let amount = null

    if (CallbackMetadata?.Item) {
      for (const item of CallbackMetadata.Item) {
        if (item.Name === 'MpesaReceiptNumber') mpesaReceiptNumber = item.Value
        if (item.Name === 'PhoneNumber')        phoneNumber        = String(item.Value)
        if (item.Name === 'Amount')             amount             = item.Value
      }
    }

    console.log('✅ Payment confirmed:', { CheckoutRequestID, mpesaReceiptNumber, amount, phoneNumber })

    // ── Find the pending subscription ────────────────────────
    const { data: subscription, error: findError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('checkout_request_id', CheckoutRequestID)
      .single()

    if (findError || !subscription) {
      console.error('Could not find subscription for:', CheckoutRequestID)
      return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' })
    }

    // ── Determine plan from amount paid ──────────────────────
    let plan = 'basic'
    if (amount >= 999) plan = 'pro'
    if (amount >= 499 && amount < 999) plan = 'basic'

    // Set expiry to 31 days from now
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 31)

    // ── Upgrade the subscription ─────────────────────────────
    const { error: upgradeError } = await supabase
      .from('subscriptions')
      .update({
        plan,
        expires_at:    expiresAt.toISOString(),
        mpesa_phone:   phoneNumber,
        mpesa_receipt: mpesaReceiptNumber,
        amount_paid:   amount,
        updated_at:    new Date().toISOString(),
      })
      .eq('checkout_request_id', CheckoutRequestID)

    if (upgradeError) {
      console.error('Failed to upgrade subscription:', upgradeError)
      return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' })
    }

    console.log(`🎉 User upgraded to ${plan.toUpperCase()} plan:`, subscription.user_id)

    return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' })

  } catch (error) {
    console.error('Callback error:', error)
    return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' })
  }
}