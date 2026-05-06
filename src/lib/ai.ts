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

  const categoryColors: Record<string, { bg: string; accent: string; text: string; muted: string }> = {
    food:         { bg: '#111008', accent: '#FF6B00', text: '#fff8f0', muted: '#a89070' },
    salon:        { bg: '#1a0f14', accent: '#D4A0B5', text: '#fff5f8', muted: '#a07888' },
    clinic:       { bg: '#08111a', accent: '#00AAFF', text: '#f0f8ff', muted: '#607888' },
    retail:       { bg: '#0d0d1a', accent: '#7C6FFF', text: '#f5f5ff', muted: '#706880' },
    school:       { bg: '#080e1a', accent: '#FFD700', text: '#f5f5ff', muted: '#707888' },
    transport:    { bg: '#0a0a0a', accent: '#FF6600', text: '#ffffff', muted: '#808080' },
    construction: { bg: '#111111', accent: '#F5C400', text: '#ffffff', muted: '#888880' },
    agriculture:  { bg: '#0a1208', accent: '#4CAF50', text: '#f5fff0', muted: '#608068' },
    tech:         { bg: '#050510', accent: '#00EEFF', text: '#f0ffff', muted: '#507888' },
    other:        { bg: '#0f0f0f', accent: '#00C896', text: '#ffffff', muted: '#608070' },
  }

  const c = categoryColors[business.category] || categoryColors.other
  const whatsappNumber = (business.whatsapp || business.phone).replace(/\D/g, '').replace(/^0/, '254')
  const whatsappLink = `https://wa.me/${whatsappNumber}`

  // Step 1: Ask Claude ONLY for JSON content — no HTML, no CSS
  const contentPrompt = `You are a copywriter for a Nairobi business website. Return ONLY valid JSON, no markdown, no explanation.

Business:
- Name: ${business.name}
- Type: ${business.category}
- Description: ${business.description}
- Address: ${business.address}
${business.hours ? `- Hours: ${business.hours}` : ''}

Return this exact JSON structure:
{
  "tagline": "A short powerful tagline (max 6 words)",
  "hero_title": "Big bold headline (max 5 words, all caps style)",
  "hero_subtitle": "One sentence describing what makes them special",
  "about": "2-3 sentences about the business, warm and professional",
  "service1_name": "First service name",
  "service1_desc": "One sentence description",
  "service2_name": "Second service name",
  "service2_desc": "One sentence description",
  "service3_name": "Third service name",
  "service3_desc": "One sentence description",
  "service4_name": "Fourth service name",
  "service4_desc": "One sentence description",
  "cta_text": "Call to action button text (max 5 words)"
}`

  const response = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
      messages: [{ role: 'user', content: contentPrompt }],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || 'Generation failed')
  }

  const data = await response.json()
  const raw = data.content?.find((b: { type: string }) => b.type === 'text')?.text || ''
  if (!raw) throw new Error('No content was generated')

  // Step 2: Parse JSON
  let content: Record<string, string>
  try {
    const cleaned = raw.replace(/^```json\n?/i, '').replace(/\n?```$/i, '').trim()
    content = JSON.parse(cleaned)
  } catch {
    throw new Error('Failed to parse generated content')
  }

  // Step 3: Inject into hardcoded HTML template — always complete, never truncated
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${business.name}</title>
<meta name="description" content="${content.hero_subtitle}">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Barlow+Condensed:wght@700;800;900&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:'Inter',sans-serif;background:${c.bg};color:${c.text};overflow-x:hidden;line-height:1.6}
a{text-decoration:none;color:inherit}
img{display:block;max-width:100%}
nav{position:fixed;top:0;left:0;right:0;z-index:100;height:60px;display:flex;align-items:center;justify-content:space-between;padding:0 20px;background:rgba(0,0,0,0.85);backdrop-filter:blur(12px);border-bottom:2px solid ${c.accent}}
.logo{font-family:'Barlow Condensed',sans-serif;font-size:1.3rem;font-weight:800;letter-spacing:1px;color:${c.text}}
.logo span{color:${c.accent}}
.nav-btn{background:${c.accent};color:${c.bg};font-weight:700;font-size:0.8rem;padding:8px 16px;border-radius:4px;letter-spacing:0.5px}
.hero{min-height:100vh;display:flex;align-items:flex-end;padding-bottom:60px;position:relative;overflow:hidden;background:linear-gradient(160deg,${c.bg} 0%,#1a1a1a 100%)}
.hero-grad{position:absolute;inset:0;background:linear-gradient(to top,${c.bg} 0%,transparent 60%)}
.hero-body{position:relative;z-index:2;padding:0 24px;max-width:700px}
.hero-tag{display:inline-block;background:${c.accent};color:${c.bg};font-size:0.65rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;padding:5px 12px;border-radius:2px;margin-bottom:16px}
.hero-title{font-family:'Barlow Condensed',sans-serif;font-size:clamp(2.8rem,11vw,5.5rem);font-weight:900;line-height:0.95;text-transform:uppercase;margin-bottom:12px;color:${c.text}}
.hero-title span{color:${c.accent};display:block}
.hero-sub{font-size:1rem;color:${c.muted};max-width:480px;margin-bottom:28px;line-height:1.7}
.hero-btns{display:flex;flex-wrap:wrap;gap:12px}
.btn-wa{background:#25D366;color:#fff;font-weight:700;font-size:0.9rem;padding:13px 24px;border-radius:4px;display:inline-flex;align-items:center;gap:8px}
.btn-call{background:transparent;color:${c.text};font-weight:600;font-size:0.9rem;padding:12px 24px;border-radius:4px;border:1.5px solid ${c.accent};display:inline-flex;align-items:center;gap:8px}
.btn-wa:hover,.btn-call:hover{opacity:0.88}
.hero-stats{display:flex;gap:28px;margin-top:40px;padding-top:28px;border-top:1px solid rgba(255,255,255,0.1)}
.stat-num{font-family:'Barlow Condensed',sans-serif;font-size:2rem;font-weight:900;color:${c.accent};line-height:1}
.stat-lbl{font-size:0.65rem;color:${c.muted};text-transform:uppercase;letter-spacing:1px;margin-top:2px}
.services{padding:70px 24px;background:rgba(255,255,255,0.03)}
.about-sec{padding:70px 24px}
.cta-section{padding:60px 24px;text-align:center;background:rgba(255,255,255,0.03)}
footer{padding:24px;text-align:center;border-top:1px solid rgba(255,255,255,0.08);font-size:0.8rem;color:${c.muted}}
footer a{color:${c.accent}}
.sec-label{font-size:0.65rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${c.accent};margin-bottom:10px}
.sec-title{font-family:'Barlow Condensed',sans-serif;font-size:clamp(2rem,7vw,2.8rem);font-weight:900;text-transform:uppercase;color:${c.text};margin-bottom:32px;line-height:1}
.sec-title span{color:${c.accent}}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;max-width:800px}
@media(max-width:480px){.grid{grid-template-columns:1fr}.hero-stats{gap:16px}}
.card{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:20px;transition:border-color 0.2s}
.card:hover{border-color:${c.accent}}
.card-num{font-family:'Barlow Condensed',sans-serif;font-size:2rem;font-weight:900;color:${c.accent};opacity:0.4;line-height:1;margin-bottom:8px}
.card-name{font-weight:700;font-size:1rem;color:${c.text};margin-bottom:6px}
.card-desc{font-size:0.85rem;color:${c.muted};line-height:1.6}
.about-inner{max-width:700px}
.about-text{font-size:0.95rem;color:${c.muted};line-height:1.9;margin-bottom:24px}
.detail-row{display:flex;align-items:flex-start;gap:12px;font-size:0.9rem;color:${c.muted};margin-bottom:12px}
.detail-icon{width:36px;height:36px;background:${c.accent};border-radius:4px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:1rem}
.detail-row strong{display:block;color:${c.text};font-size:0.8rem;margin-bottom:2px}
.cta-title{font-family:'Barlow Condensed',sans-serif;font-size:clamp(1.8rem,6vw,2.5rem);font-weight:900;text-transform:uppercase;color:${c.text};margin-bottom:8px}
.cta-sub{color:${c.muted};font-size:0.9rem;margin-bottom:28px}
.cta-btns{display:flex;justify-content:center;flex-wrap:wrap;gap:12px}
</style>
</head>
<body>

<nav>
  <a href="#" class="logo">${business.name.split(' ').slice(0,2).join(' ')} <span>${business.name.split(' ').slice(2).join(' ')}</span></a>
  <a href="tel:${business.phone}" class="nav-btn">📞 Call Now</a>
</nav>

<section class="hero">
  <div class="hero-grad"></div>
  <div class="hero-body">
    <div class="hero-tag">📍 ${business.address}</div>
    <h1 class="hero-title">
      ${content.hero_title.split(' ').slice(0, 3).join(' ')}
      <span>${content.hero_title.split(' ').slice(3).join(' ')}</span>
    </h1>
    <p class="hero-sub">${content.hero_subtitle}</p>
    <div class="hero-btns">
      <a href="${whatsappLink}" target="_blank" class="btn-wa">💬 WhatsApp Us</a>
      <a href="tel:${business.phone}" class="btn-call">📞 ${business.phone}</a>
    </div>
    <div class="hero-stats">
      <div><div class="stat-num">5★</div><div class="stat-lbl">Rating</div></div>
      <div><div class="stat-num">100+</div><div class="stat-lbl">Clients</div></div>
      <div><div class="stat-num">NBO</div><div class="stat-lbl">Based</div></div>
    </div>
  </div>
</section>

<section class="services">
  <div class="sec-label">What We Offer</div>
  <h2 class="sec-title">Our <span>Services</span></h2>
  <div class="grid">
    <div class="card">
      <div class="card-num">01</div>
      <div class="card-name">${content.service1_name}</div>
      <div class="card-desc">${content.service1_desc}</div>
    </div>
    <div class="card">
      <div class="card-num">02</div>
      <div class="card-name">${content.service2_name}</div>
      <div class="card-desc">${content.service2_desc}</div>
    </div>
    <div class="card">
      <div class="card-num">03</div>
      <div class="card-name">${content.service3_name}</div>
      <div class="card-desc">${content.service3_desc}</div>
    </div>
    <div class="card">
      <div class="card-num">04</div>
      <div class="card-name">${content.service4_name}</div>
      <div class="card-desc">${content.service4_desc}</div>
    </div>
  </div>
</section>

<section class="about-sec">
  <div class="about-inner">
    <div class="sec-label">About Us</div>
    <h2 class="sec-title">Who <span>We Are</span></h2>
    <p class="about-text">${content.about}</p>
    <div class="detail-row">
      <div class="detail-icon">📍</div>
      <div><strong>Location</strong>${business.address}</div>
    </div>
    <div class="detail-row">
      <div class="detail-icon">📞</div>
      <div><strong>Phone</strong><a href="tel:${business.phone}" style="color:inherit">${business.phone}</a></div>
    </div>
    ${business.hours ? `<div class="detail-row"><div class="detail-icon">🕐</div><div><strong>Hours</strong>${business.hours}</div></div>` : ''}
    <div class="detail-row">
      <div class="detail-icon">💬</div>
      <div><strong>WhatsApp</strong><a href="${whatsappLink}" target="_blank" style="color:inherit">Chat with us</a></div>
    </div>
  </div>
</section>

<section class="cta-section">
  <h2 class="cta-title">Ready to <span style="color:${c.accent}">Get Started?</span></h2>
  <p class="cta-sub">${content.tagline}</p>
  <div class="cta-btns">
    <a href="${whatsappLink}" target="_blank" class="btn-wa">💬 ${content.cta_text}</a>
    <a href="tel:${business.phone}" class="btn-call">📞 Call ${business.phone}</a>
  </div>
</section>

<footer>
  <p>© ${new Date().getFullYear()} ${business.name} · ${business.address}</p>
  <p style="margin-top:8px">Powered by <a href="https://oflix-v2.vercel.app" target="_blank">OfliX</a></p>
</footer>

</body>
</html>`

  return html
}