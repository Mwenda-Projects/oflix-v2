// api/mpesa-callback.js
// Receives Safaricom payment confirmation and upgrades user's plan
// Adapted from The Mwenda Chronicles callback implementation

import { createClient } from '@supabase/supabase-js'

const DURATION_DAYS = { monthly: 30, annual: 365 }
const EXPECTED_AMOUNT = { monthly: 299, annual: 2499 }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // ── Verify this request actually came from Safaricom ──────────
  // Safaricom just echoes back whatever CallbackURL we gave it, so a
  // shared secret in that URL (never exposed to the browser) is what
  // stops anyone who captures a CheckoutRequestID from forging a fake
  // "payment succeeded" callback and getting Pro for free.
  if (req.query.token !== process.env.MPESA_CALLBACK_SECRET) {
    console.warn('Rejected mpesa-callback: invalid or missing token')
    // Still 200 — don't give an attacker a way to distinguish "wrong
    // token" from "processed" via status code probing.
    return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' })
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
        .update({ plan: 'free', billing_cycle: null, updated_at: new Date().toISOString() })
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

    // ── Determine billing cycle from the row WE created ──────
    // billing_cycle was stored by mpesa-stk.js at STK-initiation time,
    // which is more trustworthy than re-deriving the tier from a raw
    // amount (fragile against future price changes/promotions).
    let billingCycle = subscription.billing_cycle
    if (!billingCycle) {
      // Safety net only, for any pending row created before this field existed.
      billingCycle = amount >= 1000 ? 'annual' : 'monthly'
      console.warn('billing_cycle missing on subscription row — inferred from amount:', billingCycle)
    }

    // Defense in depth: flag (don't block) if the amount Safaricom
    // actually charged doesn't match what we expected for this cycle.
    if (EXPECTED_AMOUNT[billingCycle] && amount !== EXPECTED_AMOUNT[billingCycle]) {
      console.warn('⚠️ Amount mismatch for callback:', { CheckoutRequestID, billingCycle, amount, expected: EXPECTED_AMOUNT[billingCycle] })
    }

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + (DURATION_DAYS[billingCycle] || 30))

    // ── Upgrade the subscription ─────────────────────────────
    const { error: upgradeError } = await supabase
      .from('subscriptions')
      .update({
        plan:          'pro',
        billing_cycle: billingCycle,
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

    console.log(`🎉 User upgraded to PRO (${billingCycle}):`, subscription.user_id)

    return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' })

  } catch (error) {
    console.error('Callback error:', error)
    return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' })
  }
}