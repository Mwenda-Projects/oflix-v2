// src/hooks/useSubscription.ts
// Single source of truth for subscription plan across all pages

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

export type Plan = 'free' | 'pending' | 'pro'
export type BillingCycle = 'monthly' | 'annual' | null

export interface Subscription {
  plan: Plan
  billingCycle: BillingCycle
  expiresAt: string | null
  isActive: boolean
  isFree: boolean
  isPro: boolean
  canEdit: boolean      // Pro only
  canRegenerate: boolean // Pro only
  isExpired: boolean
}

const DEFAULT: Subscription = {
  plan: 'free',
  billingCycle: null,
  expiresAt: null,
  isActive: false,
  isFree: true,
  isPro: false,
  canEdit: false,
  canRegenerate: false,
  isExpired: false,
}

export function useSubscription() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<Subscription>(DEFAULT)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) {
      setSubscription(DEFAULT)
      setLoading(false)
      return
    }

    const load = async () => {
      const { data } = await supabase
        .from('subscriptions')
        .select('plan, expires_at, billing_cycle')
        .eq('user_id', user.id)
        .single()

      if (!data) {
        setSubscription(DEFAULT)
        setLoading(false)
        return
      }

      const plan = (data.plan || 'free') as Plan
      const billingCycle = (data.billing_cycle || null) as BillingCycle
      const expiresAt = data.expires_at || null
      const isExpired = expiresAt ? new Date(expiresAt) < new Date() : false
      const effectivePlan: Plan = isExpired ? 'free' : plan

      setSubscription({
        plan: effectivePlan,
        billingCycle: effectivePlan === 'pro' ? billingCycle : null,
        expiresAt,
        isActive: effectivePlan === 'pro',
        isFree: effectivePlan === 'free' || effectivePlan === 'pending',
        isPro: effectivePlan === 'pro',
        canEdit: effectivePlan === 'pro',
        canRegenerate: effectivePlan === 'pro',
        isExpired,
      })
      setLoading(false)
    }

    load()
  }, [user?.id])

  return { subscription, loading }
}