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

  const categoryStyles: Record<string, string> = {
    food:         'warm and appetising — deep amber, cream, forest green. Hero with big food feel, menu highlights, hours, WhatsApp order button.',
    salon:        'elegant and luxurious — rose gold, soft blush, charcoal. Hero, services list, hours, WhatsApp booking button.',
    clinic:       'clean and trustworthy — white, calm blue, soft green. Hero, services, hours, WhatsApp appointment button.',
    retail:       'bold and modern — vibrant accent on white. Hero, featured products, hours, WhatsApp inquiry button.',
    school:       'inspiring and professional — navy, gold, white. Hero, courses, why choose us, WhatsApp enrollment button.',
    transport:    'strong and reliable — dark navy, orange accent. Hero, routes/services, WhatsApp booking button.',
    construction: 'industrial and trustworthy — dark grey, yellow. Hero, services, WhatsApp quote button.',
    agriculture:  'natural and earthy — green, brown, cream. Hero, products, WhatsApp order button.',
    tech:         'modern and minimal — dark background, electric blue. Hero, services, WhatsApp button.',
    other:        'clean and professional — white with strong colour accent. Hero, about, services, WhatsApp button.',
  }

  const style = categoryStyles[business.category] || categoryStyles.other
  const whatsappNumber = (business.whatsapp || business.phone).replace(/\D/g, '').replace(/^0/, '254')
  const whatsappLink = `https://wa.me/${whatsappNumber}`

  const prompt = `You are a world-class web designer. Build a complete, stunning, mobile-first single-page website for a real Nairobi business.

BUSINESS DETAILS:
- Name: ${business.name}
- Type: ${business.category}
- Description: ${business.description}
- Phone: ${business.phone}
- WhatsApp: ${whatsappLink}
- Address: ${business.address}${business.hours ? `\n- Hours: ${business.hours}` : ''}

DESIGN DIRECTION:
${style}

STRICT RULES:
1. Return ONLY raw HTML — no markdown, no backticks, no explanation.
2. Complete single file with <html>, <head> with Google Fonts, all CSS in <style>, all JS in <script>.
3. Mobile-first. Looks perfect on a phone.
4. Use the EXACT business name, description, phone and address above — no placeholders.
5. WhatsApp button must open: ${whatsappLink}
6. Phone must link to: tel:${business.phone}
7. At least 4 sections: Hero, Services/About, Contact, Call-to-action.
8. Smooth scroll and subtle CSS animations.
9. Small "Powered by OfliX" in the footer.
10. Must look like a KES 50,000 website — not a template, not a business card.
11. Keep CSS efficient — no repetition. You MUST finish the complete HTML including closing </body> and </html> tags.`

  const response = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
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

  return html.replace(/^```html\n?/i, '').replace(/\n?```$/i, '').trim()
}