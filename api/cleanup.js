export default async function handler(req, res) {
  // Only allow GET (Vercel cron) or POST
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Supabase not configured' })
  }

  try {
    // Get all businesses older than 14 days that still have generated_html
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 14)
    const cutoffISO = cutoff.toISOString()

    // Fetch businesses created more than 14 days ago with generated_html
    const bizResponse = await fetch(
      `${supabaseUrl}/rest/v1/businesses?created_at=lt.${cutoffISO}&generated_html=not.is.null&select=id,owner_id`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    )

    const businesses = await bizResponse.json()

    if (!businesses || businesses.length === 0) {
      return res.status(200).json({ ok: true, cleaned: 0, message: 'No businesses to clean up' })
    }

    // Get owner IDs
    const ownerIds = businesses.map((b) => b.owner_id)

    // Check which owners have an active paid subscription
    const subsResponse = await fetch(
      `${supabaseUrl}/rest/v1/subscriptions?user_id=in.(${ownerIds.join(',')})&select=user_id,plan,expires_at`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    )

    const subscriptions = await subsResponse.json()

    // Build a set of owner IDs that have an active paid plan
    const now = new Date()
    const paidOwnerIds = new Set(
      (subscriptions || [])
        .filter((s) => {
          const isExpired = s.expires_at ? new Date(s.expires_at) < now : true
          const isPaid = s.plan === 'basic' || s.plan === 'pro'
          return isPaid && !isExpired
        })
        .map((s) => s.user_id)
    )

    // Filter businesses whose owners are NOT on a paid plan
    const toClean = businesses.filter((b) => !paidOwnerIds.has(b.owner_id))

    if (toClean.length === 0) {
      return res.status(200).json({ ok: true, cleaned: 0, message: 'All old businesses have active subscriptions' })
    }

    // Delete generated_html for those businesses
    const cleanIds = toClean.map((b) => b.id)
    const updateResponse = await fetch(
      `${supabaseUrl}/rest/v1/businesses?id=in.(${cleanIds.join(',')})`,
      {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ generated_html: null }),
      }
    )

    if (!updateResponse.ok) {
      const err = await updateResponse.json().catch(() => ({}))
      return res.status(500).json({ error: 'Failed to clean up', detail: err })
    }

    return res.status(200).json({
      ok: true,
      cleaned: cleanIds.length,
      message: `Deleted generated_html for ${cleanIds.length} expired free business(es)`,
    })

  } catch (err) {
    return res.status(500).json({ error: 'Server error', detail: String(err) })
  }
}