export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const accessKey = process.env.UNSPLASH_ACCESS_KEY
  if (!accessKey) return res.status(500).json({ error: 'Unsplash key not configured' })

  const { query } = req.body
  if (!query) return res.status(400).json({ error: 'Missing query' })

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
        },
      }
    )

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      return res.status(response.status).json({ error: 'Unsplash request failed', detail: err })
    }

    const data = await response.json()
    const result = data.results?.[0]

    if (!result) {
      return res.status(200).json({ found: false })
    }

    return res.status(200).json({
      found: true,
      url: result.urls?.regular || result.urls?.full,
      alt: result.alt_description || query,
      photographerName: result.user?.name || 'Unsplash',
      photographerUrl: result.user?.links?.html || 'https://unsplash.com',
    })

  } catch (err) {
    return res.status(500).json({ error: 'Server error' })
  }
}