import { supabase } from '@/lib/supabase'

const PROXY_URL = 'https://oflix-v2.vercel.app/api/generate'
const UNSPLASH_PROXY_URL = 'https://oflix-v2.vercel.app/api/unsplash'

export function cleanGeneratedHtml(raw: string) {
  return raw.replace(/^```(?:html|json)?\n?/i, '').replace(/\n?```$/i, '').trim()
}

export function isValidGeneratedHtml(html?: string) {
  if (!html) return false
  const normalized = html.toLowerCase()
  return normalized.includes('<html') &&
    normalized.includes('</html>') &&
    normalized.includes('<head') &&
    normalized.includes('</head>') &&
    normalized.includes('<body') &&
    normalized.includes('</body>') &&
    normalized.includes('</style>')
}

// Fallback photos per category — used only if Unsplash search fails
const CATEGORY_PHOTOS: Record<string, { hero: string; alt: string }> = {
  salon:        { hero: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=80', alt: 'Professional hair salon' },
  food:         { hero: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80', alt: 'Delicious restaurant food' },
  clinic:       { hero: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1200&q=80', alt: 'Professional medical clinic' },
  retail:       { hero: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80', alt: 'Retail shop products' },
  school:       { hero: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&q=80', alt: 'School and education' },
  transport:    { hero: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&q=80', alt: 'Transport and logistics' },
  construction: { hero: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80', alt: 'Construction and building' },
  agriculture:  { hero: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&q=80', alt: 'Agriculture and farming' },
  tech:         { hero: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80', alt: 'Technology and digital services' },
  other:        { hero: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80', alt: 'Professional business' },
}

interface UnsplashPhoto {
  hero: string
  alt: string
  photographerName?: string
  photographerUrl?: string
}

// Fetches the current logged-in user's Supabase access token so /api/generate
// can verify the caller before spending Anthropic credits on their behalf.
async function getAuthHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) {
    throw new Error('You must be logged in to do this.')
  }
  return { Authorization: `Bearer ${session.access_token}` }
}

async function fetchUnsplashPhoto(keyword: string, category: string): Promise<UnsplashPhoto> {
  try {
    const response = await fetch(UNSPLASH_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: keyword }),
    })

    if (response.ok) {
      const data = await response.json()
      if (data.found) {
        return {
          hero: data.url,
          alt: data.alt,
          photographerName: data.photographerName,
          photographerUrl: data.photographerUrl,
        }
      }
    }
  } catch {
    // fall through to fallback
  }

  // Fallback to hardcoded category photo if Unsplash search fails or finds nothing
  const fallback = CATEGORY_PHOTOS[category] || CATEGORY_PHOTOS.other
  return { hero: fallback.hero, alt: fallback.alt }
}

export async function generateWebsite(business: {
  id: string
  name: string
  category: string
  description: string
  phone: string
  whatsapp?: string
  address: string
  building?: string
  floorUnit?: string
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

  // Display address: building (optional) + area — clean, shown on the page
  const displayAddress = business.building
    ? `${business.building}, ${business.address}`
    : business.address

  // Maps search query: building + area — floor/unit excluded (Maps navigates to buildings, not floors)
  const mapsQueryAddress = business.building
    ? `${business.building}, ${business.address}`
    : business.address
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQueryAddress + ', Nairobi, Kenya')}`

  const websiteUrl = `https://oflix-v2.vercel.app/b/${business.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`

  // Step 1: Ask Claude for JSON content + an image search keyword
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
  "cta_text": "Call to action button text (max 5 words)",
  "image_keyword": "A specific 2-4 word English search term for a stock photo that accurately represents THIS business (e.g. 'pharmacy medicine shelves', 'hair salon interior', 'car mechanic garage', 'plumber fixing pipes'). Be precise based on the actual description, not just the category."
}`

  const authHeader = await getAuthHeader()

  const response = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
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

  // Step 3: Fetch a relevant photo from Unsplash based on the AI's keyword
  const imageKeyword = content.image_keyword || business.category
  const photo = await fetchUnsplashPhoto(imageKeyword, business.category)

  // Step 4: Inject into hardcoded HTML template
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
.hero{min-height:100vh;display:flex;align-items:flex-end;padding-bottom:60px;position:relative;overflow:hidden}
.hero-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;z-index:0}
.hero-overlay{position:absolute;inset:0;background:linear-gradient(to top,${c.bg} 0%,rgba(0,0,0,0.55) 60%,rgba(0,0,0,0.2) 100%);z-index:1}
.hero-body{position:relative;z-index:2;padding:0 24px;max-width:700px;width:100%;margin:0 auto}
.hero-tag{display:inline-block;background:${c.accent};color:${c.bg};font-size:0.65rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;padding:5px 12px;border-radius:2px;margin-bottom:16px}
.hero-title{font-family:'Barlow Condensed',sans-serif;font-size:clamp(2.8rem,11vw,5.5rem);font-weight:900;line-height:0.95;text-transform:uppercase;margin-bottom:12px;color:#ffffff}
.hero-title span{color:${c.accent};display:block}
.hero-sub{font-size:1rem;color:rgba(255,255,255,0.8);max-width:480px;margin-bottom:28px;line-height:1.7}
.hero-btns{display:flex;flex-wrap:wrap;gap:12px}
.btn-wa{background:#25D366;color:#fff;font-weight:700;font-size:0.9rem;padding:13px 24px;border-radius:4px;display:inline-flex;align-items:center;gap:8px}
.btn-call{background:transparent;color:#ffffff;font-weight:600;font-size:0.9rem;padding:12px 24px;border-radius:4px;border:1.5px solid ${c.accent};display:inline-flex;align-items:center;gap:8px}
.btn-directions{background:transparent;color:#ffffff;font-weight:600;font-size:0.9rem;padding:12px 24px;border-radius:4px;border:1.5px solid rgba(255,255,255,0.4);display:inline-flex;align-items:center;gap:8px}
.btn-wa:hover,.btn-call:hover,.btn-directions:hover{opacity:0.88}
.hero-stats{display:flex;gap:28px;margin-top:40px;padding-top:28px;border-top:1px solid rgba(255,255,255,0.2)}
.stat-num{font-family:'Barlow Condensed',sans-serif;font-size:2rem;font-weight:900;color:${c.accent};line-height:1}
.stat-lbl{font-size:0.65rem;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:1px;margin-top:2px}
.services{padding:70px 24px;background:rgba(255,255,255,0.03)}
.about-sec{padding:70px 24px}
.cta-section{padding:60px 24px;text-align:center;background:rgba(255,255,255,0.03)}
footer{padding:24px;text-align:center;border-top:1px solid rgba(255,255,255,0.08);font-size:0.8rem;color:${c.muted}}
footer a{color:${c.accent}}
.sec-label{font-size:0.65rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${c.accent};margin-bottom:10px}
.sec-title{font-family:'Barlow Condensed',sans-serif;font-size:clamp(2rem,7vw,2.8rem);font-weight:900;text-transform:uppercase;color:${c.text};margin-bottom:32px;line-height:1}
.sec-title span{color:${c.accent}}
.section-inner{max-width:1100px;width:100%;margin:0 auto}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;width:100%}
@media(max-width:480px){.grid{grid-template-columns:1fr}.hero-stats{gap:16px}.hero-btns{flex-direction:column}}
@media(min-width:900px){.grid{grid-template-columns:repeat(4,1fr);gap:20px}}
@media(min-width:1024px){.hero-body{max-width:900px}.about-inner{max-width:800px}}
.card{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:20px;transition:border-color 0.2s}
.card:hover{border-color:${c.accent}}
.card-num{font-family:'Barlow Condensed',sans-serif;font-size:2rem;font-weight:900;color:${c.accent};opacity:0.4;line-height:1;margin-bottom:8px}
.card-name{font-weight:700;font-size:1rem;color:${c.text};margin-bottom:6px}
.card-desc{font-size:0.85rem;color:${c.muted};line-height:1.6}
.about-inner{max-width:700px;width:100%;margin:0 auto}
.about-text{font-size:0.95rem;color:${c.muted};line-height:1.9;margin-bottom:24px}
.detail-row{display:flex;align-items:flex-start;gap:12px;font-size:0.9rem;color:${c.muted};margin-bottom:12px}
.detail-icon{width:36px;height:36px;background:${c.accent};border-radius:4px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:1rem}
.detail-row strong{display:block;color:${c.text};font-size:0.8rem;margin-bottom:2px}
.contact-btns{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px}
.btn-contact{display:inline-flex;align-items:center;gap:8px;padding:13px 20px;border-radius:4px;font-weight:700;font-size:0.9rem;cursor:pointer;border:none}
.btn-save{background:${c.accent};color:${c.bg}}
.btn-map{background:rgba(255,255,255,0.08);color:${c.text};border:1.5px solid rgba(255,255,255,0.2)!important}
.cta-inner{max-width:700px;width:100%;margin:0 auto}
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
  <img class="hero-img" src="${photo.hero}" alt="${photo.alt}" data-img-slot="hero">
  <div class="hero-overlay"></div>
  <div class="hero-body">
    <div class="hero-tag">📍 ${displayAddress}</div>
    <h1 class="hero-title">
      ${content.hero_title.split(' ').slice(0, 3).join(' ')}
      <span>${content.hero_title.split(' ').slice(3).join(' ')}</span>
    </h1>
    <p class="hero-sub">${content.hero_subtitle}</p>
    <div class="hero-btns">
      <a href="${whatsappLink}" target="_blank" class="btn-wa" onclick="trackWA()">💬 WhatsApp Us</a>
      <a href="tel:${business.phone}" class="btn-call">📞 ${business.phone}</a>
      <a href="${mapsLink}" target="_blank" class="btn-directions" onclick="trackDir()">🗺️ Get Directions</a>
    </div>
    <div class="hero-stats">
      <div><div class="stat-num">5★</div><div class="stat-lbl">Rating</div></div>
      <div><div class="stat-num">100+</div><div class="stat-lbl">Clients</div></div>
      <div><div class="stat-num">NBO</div><div class="stat-lbl">Based</div></div>
    </div>
  </div>
</section>

<section class="services" id="services">
  <div class="section-inner">
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
  </div>
</section>

<section class="about-sec" id="about">
  <div class="about-inner">
    <div class="sec-label">About Us</div>
    <h2 class="sec-title">Who <span>We Are</span></h2>
    <p class="about-text">${content.about}</p>
    <div class="detail-row">
      <div class="detail-icon">📍</div>
      <div><strong>Location</strong>${displayAddress}${business.floorUnit ? `<br><span style="opacity:0.75;font-size:0.85em">${business.floorUnit}</span>` : ''}</div>
    </div>
    <div class="detail-row">
      <div class="detail-icon">📞</div>
      <div><strong>Phone</strong><a href="tel:${business.phone}" style="color:inherit">${business.phone}</a></div>
    </div>
    ${business.hours ? `<div class="detail-row"><div class="detail-icon">🕐</div><div><strong>Hours</strong>${business.hours}</div></div>` : ''}
    <div class="detail-row">
      <div class="detail-icon">💬</div>
      <div><strong>WhatsApp</strong><a href="${whatsappLink}" target="_blank" onclick="trackWA()" style="color:inherit">Chat with us</a></div>
    </div>
    <div class="contact-btns">
      <button class="btn-contact btn-save" onclick="saveContact()">📱 Save Contact</button>
      <a href="${mapsLink}" target="_blank" class="btn-contact btn-map" onclick="trackDir()">🗺️ Get Directions</a>
    </div>
  </div>
</section>

<section class="cta-section" id="contact">
  <div class="cta-inner">
    <h2 class="cta-title">Ready to <span style="color:${c.accent}">Get Started?</span></h2>
    <p class="cta-sub">${content.tagline}</p>
    <div class="cta-btns">
      <a href="${whatsappLink}" target="_blank" class="btn-wa" onclick="trackWA()">💬 ${content.cta_text}</a>
      <a href="tel:${business.phone}" class="btn-call">📞 Call ${business.phone}</a>
    </div>
  </div>
</section>

<footer>
  <p>© ${new Date().getFullYear()} ${business.name} · ${displayAddress}</p>
  <p style="margin-top:8px">Powered by <a href="https://oflix-v2.vercel.app" target="_blank">OfliX</a>${photo.photographerName ? ` · Photo by <a href="${photo.photographerUrl}?utm_source=oflix&utm_medium=referral" target="_blank">${photo.photographerName}</a> on <a href="https://unsplash.com/?utm_source=oflix&utm_medium=referral" target="_blank">Unsplash</a>` : ''}</p>
</footer>

<script>
var BUSINESS_ID = "${business.id}";
var TRACK_URL = "https://oflix-v2.vercel.app/api/track";

function track(action) {
  try { window.parent.postMessage({ type: 'oflix_track', event: action }, '*'); } catch(e) {}
  try {
    fetch(TRACK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId: BUSINESS_ID, action: action }),
    }).catch(function(){});
  } catch(e) {}
}

function trackWA() { track('whatsapp_tap'); }
function trackDir() { track('directions_tap'); }

function saveContact() {
  track('contact_save');
  var businessName = "${business.name.replace(/"/g, '\\"')}";
  var callNumber = "${business.phone}";
  var waNumber = "+${whatsappNumber}";
  var address = "${displayAddress.replace(/"/g, '\\"')}";
  var siteUrl = "${websiteUrl}";
  var vcf = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'FN:' + businessName,
    'ORG:' + businessName,
    'TEL;TYPE=CELL:' + callNumber,
    'TEL;TYPE=WHATSAPP:' + waNumber,
    'ADR;TYPE=WORK:;;' + address + ';;;;',
    'URL:' + siteUrl,
    'END:VCARD'
  ].join('\\n');
  setTimeout(function() {
    window.location.href = 'data:text/x-vcard;charset=utf-8,' + encodeURIComponent(vcf);
  }, 300);
}
</script>

</body>
</html>`

  return html
}