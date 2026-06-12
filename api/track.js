export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Supabase not configured' })
  }

  const { businessId, action } = req.body

  if (!businessId || !action) {
    return res.status(400).json({ error: 'Missing businessId or action' })
  }

  const validActions = ['whatsapp_tap', 'directions_tap', 'contact_save', 'page_view']
  if (!validActions.includes(action)) {
    return res.status(400).json({ error: 'Invalid action' })
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ business_id: businessId, action }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      return res.status(500).json({ error: 'Failed to track', detail: err })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    return res.status(500).json({ error: 'Server error' })
  }
}