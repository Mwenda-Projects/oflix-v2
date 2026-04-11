// src/hooks/useSubscription.ts
// Single source of truth for subscription plan across all pages

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

export type Plan = 'free' | 'pending' | 'basic' | 'pro'

export interface Subscription {
  plan: Plan
  expiresAt: string | null
  isActive: boolean
  isFree: boolean
  isBasic: boolean
  isPro: boolean
  canEdit: boolean      // Pro only
  canRegenerate: boolean // Pro only
  isExpired: boolean
}

const DEFAULT: Subscription = {
  plan: 'free',
  expiresAt: null,
  isActive: false,
  isFree: true,
  isBasic: false,
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
        .select('plan, expires_at')
        .eq('user_id', user.id)
        .single()

      if (!data) {
        setSubscription(DEFAULT)
        setLoading(false)
        return
      }

      const plan = (data.plan || 'free') as Plan
      const expiresAt = data.expires_at || null
      const isExpired = expiresAt ? new Date(expiresAt) < new Date() : false
      const effectivePlan: Plan = isExpired ? 'free' : plan
      const isActive = effectivePlan === 'basic' || effectivePlan === 'pro'

      setSubscription({
        plan: effectivePlan,
        expiresAt,
        isActive,
        isFree: effectivePlan === 'free' || effectivePlan === 'pending',
        isBasic: effectivePlan === 'basic',
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