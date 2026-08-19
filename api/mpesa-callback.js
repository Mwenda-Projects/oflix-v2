// api/mpesa-callback.js
// Receives Safaricom payment confirmation and upgrades user's plan
// Adapted from The Mwenda Chronicles callback implementation

import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const DURATION_DAYS = { monthly: 30, annual: 365 }
const EXPECTED_AMOUNT = { monthly: 299, annual: 2499 }
const PLAN_LABEL = { monthly: 'Pro Monthly', annual: 'Pro Annual' }

// Sends the payment receipt. Failures here are logged but never thrown —
// the M-Pesa payment has already succeeded and the subscription already
// upgraded by the time this runs, so an email/Resend hiccup must not
// affect the response Safaricom gets or trigger a callback retry.
async function sendReceiptEmail({ toEmail, billingCycle, amount, mpesaReceiptNumber, expiresAt }) {
  if (!toEmail) {
    console.warn('Skipping receipt email — no email on file for this user')
    return
  }

  const formattedExpiry = expiresAt.toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })
  const planLabel = PLAN_LABEL[billingCycle] || 'Pro'

  try {
    await resend.emails.send({
      from: 'OfliX <receipts@mail.oflix.space>',
      to: [toEmail],
      // Sent from the mail.oflix.space subdomain (verified separately in
      // Resend, isolated from hello@oflix.space's Zoho DNS), but replies
      // should land in the real inbox a human actually checks.
      replyTo: 'hello@oflix.space',
      subject: `Payment received — ${planLabel} is now active`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <div style="width: 40px; height: 40px; border-radius: 10px; background: #008060; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
            <span style="font-family: serif; font-weight: 900; color: white; font-size: 20px; line-height: 40px;">O</span>
          </div>
          <h1 style="color: #1a1a1a; font-size: 22px; margin-bottom: 8px;">Payment received</h1>
          <p style="color: #555; line-height: 1.6;">Your OfliX ${planLabel} subscription is now active.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #888;">Plan</td>
              <td style="padding: 8px 0; color: #1a1a1a; font-weight: 600; text-align: right;">${planLabel}</td>
            </tr>
            <tr style="border-top: 1px solid #eee;">
              <td style="padding: 8px 0; color: #888;">Amount</td>
              <td style="padding: 8px 0; color: #1a1a1a; font-weight: 600; text-align: right;">KES ${amount}</td>
            </tr>
            <tr style="border-top: 1px solid #eee;">
              <td style="padding: 8px 0; color: #888;">M-Pesa receipt</td>
              <td style="padding: 8px 0; color: #1a1a1a; font-weight: 600; text-align: right;">${mpesaReceiptNumber || 'N/A'}</td>
            </tr>
            <tr style="border-top: 1px solid #eee;">
              <td style="padding: 8px 0; color: #888;">Renews / expires</td>
              <td style="padding: 8px 0; color: #1a1a1a; font-weight: 600; text-align: right;">${formattedExpiry}</td>
            </tr>
          </table>
          <p style="color: #888; font-size: 13px; line-height: 1.6;">Questions about this payment? Just reply to this email — it reaches us directly at hello@oflix.space.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
          <p style="color: #999; font-size: 12px;">OfliX · hello@oflix.space</p>
        </div>
      `,
    })
    console.log('Receipt email sent to:', toEmail)
  } catch (emailError) {
    console.error('Failed to send receipt email (payment itself was unaffected):', emailError)
  }
}

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

    // ── Payment failed or cancelled ───────────────────────────
    if (!isSuccess) {
      // Restore whatever the user actually had before this attempt —
      // NOT a hardcoded 'free'. Without this, an active Pro subscriber
      // who cancels a renewal/cycle-switch attempt would lose their
      // paid-for access, even though nothing about their real
      // subscription changed.
      const { data: pendingRow } = await supabase
        .from('subscriptions')
        .select('previous_plan, previous_billing_cycle, previous_expires_at')
        .eq('checkout_request_id', CheckoutRequestID)
        .single()

      await supabase
        .from('subscriptions')
        .update({
          plan:                 pendingRow?.previous_plan ?? 'free',
          billing_cycle:        pendingRow?.previous_billing_cycle ?? null,
          expires_at:           pendingRow?.previous_expires_at ?? null,
          previous_plan:        null,
          previous_billing_cycle: null,
          previous_expires_at:  null,
          updated_at:           new Date().toISOString(),
        })
        .eq('checkout_request_id', CheckoutRequestID)

      console.log('Payment failed — restored previous state:', { CheckoutRequestID, ResultDesc, restoredPlan: pendingRow?.previous_plan ?? 'free' })
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

    console.log('Payment confirmed:', { CheckoutRequestID, mpesaReceiptNumber, amount, phoneNumber })

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
      console.warn('Amount mismatch for callback:', { CheckoutRequestID, billingCycle, amount, expected: EXPECTED_AMOUNT[billingCycle] })
    }

    const now = new Date()
    const currentExpiry = subscription.expires_at ? new Date(subscription.expires_at) : null
    // If they still have time left (renewing early / switching cycle
    // before expiry), stack the new period on top of what's remaining
    // instead of resetting the clock to "now" and discarding paid-for days.
    const expiresAt = (currentExpiry && currentExpiry > now) ? currentExpiry : now
    expiresAt.setDate(expiresAt.getDate() + (DURATION_DAYS[billingCycle] || 30))

    // ── Upgrade the subscription ─────────────────────────────
    const { error: upgradeError } = await supabase
      .from('subscriptions')
      .update({
        plan:                   'pro',
        billing_cycle:          billingCycle,
        expires_at:             expiresAt.toISOString(),
        mpesa_phone:            phoneNumber,
        mpesa_receipt:          mpesaReceiptNumber,
        amount_paid:            amount,
        previous_plan:          null,
        previous_billing_cycle: null,
        previous_expires_at:    null,
        updated_at:             new Date().toISOString(),
      })
      .eq('checkout_request_id', CheckoutRequestID)

    if (upgradeError) {
      console.error('Failed to upgrade subscription:', upgradeError)
      return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' })
    }

    console.log(`User upgraded to PRO (${billingCycle}):`, subscription.user_id)

    // ── Send receipt email ────────────────────────────────────
    // Fire-and-handled: awaited so logs are ordered sensibly, but any
    // failure inside sendReceiptEmail is caught internally and never
    // propagates here — the upgrade above has already succeeded and
    // must not be affected by an email provider hiccup.
    const { data: userData } = await supabase.auth.admin.getUserById(subscription.user_id)
    await sendReceiptEmail({
      toEmail: userData?.user?.email,
      billingCycle,
      amount,
      mpesaReceiptNumber,
      expiresAt,
    })

    return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' })

  } catch (error) {
    console.error('Callback error:', error)
    return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' })
  }
}