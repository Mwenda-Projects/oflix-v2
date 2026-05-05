const PROXY_URL = 'https://oflix-v2.vercel.app/api/generate'

export async function generateWebsite(business: {
  name: string
  category: string
  description: string
  phone: string
  whatsapp?: string
  address: string
  hours?: string
}): Promise<string> {

  const categoryColors: Record<string, { bg: string; accent: string; text: string }> = {
    food:         { bg: '#1a0a00', accent: '#FF6B00', text: '#fff8f0' },
    salon:        { bg: '#1a0a10', accent: '#E8A0BF', text: '#fff5f8' },
    clinic:       { bg: '#001a2c', accent: '#00AAFF', text: '#f0f8ff' },
    retail:       { bg: '#0a0a1a', accent: '#6C63FF', text: '#f5f5ff' },
    school:       { bg: '#001020', accent: '#FFD700', text: '#f5f5ff' },
    transport:    { bg: '#0a0a0a', accent: '#FF6600', text: '#ffffff' },
    construction: { bg: '#111111', accent: '#F5C400', text: '#ffffff' },
    agriculture:  { bg: '#0a1a00', accent: '#4CAF50', text: '#f5fff0' },
    tech:         { bg: '#050510', accent: '#00EEFF', text: '#f0ffff' },
    other:        { bg: '#0f0f0f', accent: '#00C896', text: '#ffffff' },
  }

  const colors = categoryColors[business.category] || categoryColors.other
  const whatsappNumber = (business.whatsapp || business.phone).replace(/\D/g, '').replace(/^0/, '254')
  const whatsappLink = `https://wa.me/${whatsappNumber}`

  const prompt = `Create a single-page business website. Return ONLY the raw HTML, nothing else.

BUSINESS:
Name: ${business.name}
Description: ${business.description}
Phone: ${business.phone}
WhatsApp: ${whatsappLink}
Address: ${business.address}${business.hours ? `\nHours: ${business.hours}` : ''}

COLORS: background ${colors.bg}, accent ${colors.accent}, text ${colors.text}

Use this EXACT structure — short CSS, complete HTML:

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>[NAME]</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, sans-serif; background: [BG]; color: [TEXT]; }
/* Write minimal CSS — under 80 lines total */
</style>
</head>
<body>
<!-- 1. Nav with business name and Call button -->
<!-- 2. Hero section with name, description, WhatsApp button -->
<!-- 3. Services section (3-4 services based on business type) -->
<!-- 4. Contact section with phone, address, hours -->
<!-- 5. Footer with "Powered by OfliX" -->
</body>
</html>

RULES:
- CSS must be SHORT (under 80 lines). No animations, no clip-paths, no keyframes.
- Mobile-first using simple flexbox and padding.
- WhatsApp link: ${whatsappLink}
- Phone link: tel:${business.phone}
- The file MUST end with </html> on the last line.
- Make it look clean and professional with the accent color ${colors.accent}.`

  const response = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 16000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || 'Generation failed')
  }

  const data = await response.json()
  const html = data.content?.find((b: { type: string }) => b.type === 'text')?.text || ''
  if (!html) throw new Error('No website was generated')

  // Strip any markdown code fences if model adds them
  return html.replace(/^```html\n?/i, '').replace(/\n?```$/i, '').trim()
}