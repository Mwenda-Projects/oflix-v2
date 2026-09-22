import { supabase } from '@/lib/supabase'

const PROXY_URL = 'https://oflix.space/api/generate'
const UNSPLASH_PROXY_URL = 'https://oflix.space/api/unsplash'

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

// ── Structured site content ─────────────────────────────────────
// Replaces the old fixed service1..4 fields with a flexible offerings
// array (any count, optional price per item), and pulls the per-category
// color/font choices into the same object as `style` so a "make it feel
// warmer" edit can update five small values instead of triggering a
// full-page rewrite.
export interface SiteOffering {
  name: string
  description: string
  price?: string | null
}

export interface SiteStyle {
  bg: string
  accent: string
  text: string
  muted: string
  display_font: string
}

export interface SiteData {
  tagline: string
  hero_title: string
  hero_subtitle: string
  about: string
  offerings: SiteOffering[]
  cta_text: string
  style: SiteStyle
}

// Extracts the exact hero <img> tag from an already-rendered page, so a
// fast structured edit can preserve it verbatim — including a photo the
// owner uploaded through the image manager, which must never be
// silently replaced by a fresh Unsplash search just because the colors
// changed. Returns null if the tag can't be found, signalling callers
// to fall back to the slow full-page path instead of guessing.
export function extractHeroImageHtml(html: string): string | null {
  const match = html.match(/<img class="hero-img"[^>]*>/)
  return match ? match[0] : null
}

// Extracts the exact Unsplash photographer-credit fragment from the
// footer, if present, so it survives a fast structured edit unchanged.
// Returns '' (no credit) if the current image has none — e.g. it was
// replaced with an owner-uploaded photo.
export function extractPhotoCreditHtml(html: string): string {
  const match = html.match(/ · Photo by .*?<\/a> on <a[^>]*>Unsplash<\/a>/)
  return match ? match[0] : ''
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

// Display-font pairing per category. Body copy always stays on Inter for
// readability — only the display face (headlines) changes, so each
// category cluster reads with its own personality instead of every
// business sharing one typeface with a different accent color.
const CATEGORY_FONTS: Record<string, { display: string }> = {
  food:         { display: "'Fraunces', serif" },
  salon:        { display: "'Fraunces', serif" },
  clinic:       { display: "'Space Grotesk', sans-serif" },
  retail:       { display: "'Space Grotesk', sans-serif" },
  school:       { display: "'Space Grotesk', sans-serif" },
  transport:    { display: "'Barlow Condensed', sans-serif" },
  construction: { display: "'Barlow Condensed', sans-serif" },
  agriculture:  { display: "'Barlow Condensed', sans-serif" },
  tech:         { display: "'Space Grotesk', sans-serif" },
  other:        { display: "'Barlow Condensed', sans-serif" },
}

const CATEGORY_COLORS: Record<string, SiteStyle> = {
  food:         { bg: '#111008', accent: '#FF6B00', text: '#fff8f0', muted: '#a89070', display_font: CATEGORY_FONTS.food.display },
  salon:        { bg: '#1a0f14', accent: '#D4A0B5', text: '#fff5f8', muted: '#a07888', display_font: CATEGORY_FONTS.salon.display },
  clinic:       { bg: '#08111a', accent: '#00AAFF', text: '#f0f8ff', muted: '#607888', display_font: CATEGORY_FONTS.clinic.display },
  retail:       { bg: '#0d0d1a', accent: '#7C6FFF', text: '#f5f5ff', muted: '#706880', display_font: CATEGORY_FONTS.retail.display },
  school:       { bg: '#080e1a', accent: '#FFD700', text: '#f5f5ff', muted: '#707888', display_font: CATEGORY_FONTS.school.display },
  transport:    { bg: '#0a0a0a', accent: '#FF6600', text: '#ffffff', muted: '#808080', display_font: CATEGORY_FONTS.transport.display },
  construction: { bg: '#111111', accent: '#F5C400', text: '#ffffff', muted: '#888880', display_font: CATEGORY_FONTS.construction.display },
  agriculture:  { bg: '#0a1208', accent: '#4CAF50', text: '#f5fff0', muted: '#608068', display_font: CATEGORY_FONTS.agriculture.display },
  tech:         { bg: '#050510', accent: '#00EEFF', text: '#f0ffff', muted: '#507888', display_font: CATEGORY_FONTS.tech.display },
  other:        { bg: '#0f0f0f', accent: '#00C896', text: '#ffffff', muted: '#608070', display_font: CATEGORY_FONTS.other.display },
}

// Small inline SVG icon set replacing emoji glyphs. Emoji render
// inconsistently across OS/browser and read as a template tell — these
// use stroke="currentColor" so they automatically match whatever text
// color they're dropped into, with no extra styling needed per use.
const ICON = {
  phone: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-2px"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  chat: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-2px"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`,
  pin: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-2px"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  clock: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-2px"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  save: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-2px"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`,
}

interface UnsplashPhoto {
  hero: string
  alt: string
  photographerName?: string
  photographerUrl?: string
}

interface BusinessInput {
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
}

function buildHeroImgTag(photo: UnsplashPhoto): string {
  return `<img class="hero-img" src="${photo.hero}" alt="${photo.alt}" data-img-slot="hero">`
}

function buildPhotoCreditHtml(photo: UnsplashPhoto): string {
  return photo.photographerName
    ? ` · Photo by <a href="${photo.photographerUrl}?utm_source=oflix&utm_medium=referral" target="_blank">${photo.photographerName}</a> on <a href="https://unsplash.com/?utm_source=oflix&utm_medium=referral" target="_blank">Unsplash</a>`
    : ''
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

// ── Pure renderer: SiteData + business facts + hero image markup → HTML ──
// No AI calls happen in here. Both initial generation and the fast edit
// path call this with different SiteData, which is what keeps a schema
// edit cheap — only the small JSON changes, the same local function turns
// it into the page.
export function renderSiteHtml(
  business: BusinessInput,
  siteData: SiteData,
  heroImageHtml: string,
  photoCreditHtml: string
): string {
  const style = siteData.style
  const whatsappNumber = (business.whatsapp || business.phone).replace(/\D/g, '').replace(/^0/, '254')
  const whatsappLink = `https://wa.me/${whatsappNumber}`

  const displayAddress = business.building
    ? `${business.building}, ${business.address}`
    : business.address

  const mapsQueryAddress = business.building
    ? `${business.building}, ${business.address}`
    : business.address
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQueryAddress + ', Nairobi, Kenya')}`

  const businessSlug = business.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const websiteUrl = `https://${businessSlug}.oflix.space`

  const nameWords = business.name.trim().split(/\s+/)
  const navLogoMain = nameWords.length > 1 ? nameWords.slice(0, -1).join(' ') : nameWords[0]
  const navLogoAccent = nameWords.length > 1 ? nameWords[nameWords.length - 1] : ''

  const offeringsHtml = siteData.offerings.map(o => `
      <div class="card">
        <div class="card-mark"></div>
        <div class="card-name">${o.name}</div>
        <div class="card-desc">${o.description}</div>
        ${o.price ? `<div class="card-price">${o.price}</div>` : ''}
      </div>`).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${business.name}</title>
<meta name="description" content="${siteData.hero_subtitle}">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Barlow+Condensed:wght@700;800;900&family=Fraunces:opsz,wght@9..144,600;9..144,700;9..144,900&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:'Inter',sans-serif;background:${style.bg};color:${style.text};overflow-x:hidden;line-height:1.6}
a{text-decoration:none;color:inherit}
img{display:block;max-width:100%}
nav{position:fixed;top:0;left:0;right:0;z-index:100;height:60px;display:flex;align-items:center;justify-content:space-between;padding:0 20px;background:rgba(0,0,0,0.85);backdrop-filter:blur(12px);border-bottom:2px solid ${style.accent}}
.logo{font-family:${style.display_font};font-size:1.3rem;font-weight:800;letter-spacing:1px;color:${style.text}}
.logo span{color:${style.accent}}
.nav-btn{background:${style.accent};color:${style.bg};font-weight:700;font-size:0.8rem;padding:8px 16px;border-radius:4px;letter-spacing:0.5px;display:inline-flex;align-items:center;gap:6px}
.hero{min-height:100vh;display:flex;align-items:flex-end;padding-bottom:60px;position:relative;overflow:hidden}
.hero-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;z-index:0}
.hero-overlay{position:absolute;inset:0;background:linear-gradient(to top,${style.bg} 0%,rgba(0,0,0,0.55) 60%,rgba(0,0,0,0.2) 100%);z-index:1}
.hero-body{position:relative;z-index:2;padding:0 24px;max-width:700px;width:100%;margin:0 auto}
.hero-tag{display:inline-flex;align-items:center;gap:6px;background:${style.accent};color:${style.bg};font-size:0.65rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;padding:5px 12px;border-radius:2px;margin-bottom:16px}
.hero-title{font-family:${style.display_font};font-size:clamp(2.8rem,11vw,5.5rem);font-weight:900;line-height:0.95;text-transform:uppercase;margin-bottom:12px;color:#ffffff}
.hero-title span{color:${style.accent};display:block}
.hero-sub{font-size:1rem;color:rgba(255,255,255,0.8);max-width:480px;margin-bottom:28px;line-height:1.7}
.hero-btns{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:8px}
.btn-wa{background:#25D366;color:#fff;font-weight:700;font-size:0.9rem;padding:13px 24px;border-radius:4px;display:inline-flex;align-items:center;gap:8px}
.btn-call{background:transparent;color:#ffffff;font-weight:600;font-size:0.9rem;padding:12px 24px;border-radius:4px;border:1.5px solid ${style.accent};display:inline-flex;align-items:center;gap:8px}
.btn-directions{background:transparent;color:#ffffff;font-weight:600;font-size:0.9rem;padding:12px 24px;border-radius:4px;border:1.5px solid rgba(255,255,255,0.4);display:inline-flex;align-items:center;gap:8px}
.btn-wa:hover,.btn-call:hover,.btn-directions:hover{opacity:0.88}
.services{padding:70px 24px;background:rgba(255,255,255,0.03)}
.about-sec{padding:70px 24px}
.cta-section{padding:60px 24px;text-align:center;background:rgba(255,255,255,0.03)}
footer{padding:24px;text-align:center;border-top:1px solid rgba(255,255,255,0.08);font-size:0.8rem;color:${style.muted}}
footer a{color:${style.accent}}
.sec-label{font-size:0.65rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${style.accent};margin-bottom:10px}
.sec-title{font-family:${style.display_font};font-size:clamp(2rem,7vw,2.8rem);font-weight:900;text-transform:uppercase;color:${style.text};margin-bottom:32px;line-height:1}
.sec-title span{color:${style.accent}}
.section-inner{max-width:1100px;width:100%;margin:0 auto}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;width:100%}
@media(max-width:480px){.grid{grid-template-columns:1fr}.hero-btns{flex-direction:column}}
@media(min-width:900px){.grid{grid-template-columns:repeat(4,1fr);gap:20px}}
@media(min-width:1024px){.hero-body{max-width:900px}.about-inner{max-width:800px}}
.card{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:20px;transition:border-color 0.2s}
.card:hover{border-color:${style.accent}}
.card-mark{width:28px;height:3px;background:${style.accent};border-radius:2px;margin-bottom:14px}
.card-name{font-weight:700;font-size:1rem;color:${style.text};margin-bottom:6px}
.card-desc{font-size:0.85rem;color:${style.muted};line-height:1.6}
.card-price{font-size:0.8rem;font-weight:700;color:${style.accent};margin-top:8px}
.about-inner{max-width:700px;width:100%;margin:0 auto}
.about-text{font-size:0.95rem;color:${style.muted};line-height:1.9;margin-bottom:24px}
.detail-row{display:flex;align-items:flex-start;gap:12px;font-size:0.9rem;color:${style.muted};margin-bottom:12px}
.detail-icon{width:36px;height:36px;background:${style.accent};border-radius:4px;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:${style.bg}}
.detail-row strong{display:block;color:${style.text};font-size:0.8rem;margin-bottom:2px}
.contact-btns{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px}
.btn-contact{display:inline-flex;align-items:center;gap:8px;padding:13px 20px;border-radius:4px;font-weight:700;font-size:0.9rem;cursor:pointer;border:none}
.btn-save{background:${style.accent};color:${style.bg}}
.btn-map{background:rgba(255,255,255,0.08);color:${style.text};border:1.5px solid rgba(255,255,255,0.2)!important}
.cta-inner{max-width:700px;width:100%;margin:0 auto}
.cta-title{font-family:${style.display_font};font-size:clamp(1.8rem,6vw,2.5rem);font-weight:900;text-transform:uppercase;color:${style.text};margin-bottom:8px}
.cta-sub{color:${style.muted};font-size:0.9rem;margin-bottom:28px}
.cta-btns{display:flex;justify-content:center;flex-wrap:wrap;gap:12px}
</style>
</head>
<body>

<nav>
  <a href="#" class="logo">${navLogoMain}${navLogoAccent ? ` <span>${navLogoAccent}</span>` : ''}</a>
  <a href="tel:${business.phone}" class="nav-btn">${ICON.phone} Call Now</a>
</nav>

<section class="hero">
  ${heroImageHtml}
  <div class="hero-overlay"></div>
  <div class="hero-body">
    <div class="hero-tag">${ICON.pin} ${displayAddress}</div>
    <h1 class="hero-title">
      ${siteData.hero_title.split(' ').slice(0, 3).join(' ')}
      <span>${siteData.hero_title.split(' ').slice(3).join(' ')}</span>
    </h1>
    <p class="hero-sub">${siteData.hero_subtitle}</p>
    <div class="hero-btns">
      <a href="${whatsappLink}" target="_blank" class="btn-wa" onclick="trackWA()">${ICON.chat} WhatsApp Us</a>
      <a href="tel:${business.phone}" class="btn-call">${ICON.phone} ${business.phone}</a>
      <a href="${mapsLink}" target="_blank" class="btn-directions" onclick="trackDir()">${ICON.pin} Get Directions</a>
    </div>
  </div>
</section>

<section class="services" id="services">
  <div class="section-inner">
    <div class="sec-label">What We Offer</div>
    <h2 class="sec-title">Our <span>Services</span></h2>
    <div class="grid">${offeringsHtml}
    </div>
  </div>
</section>

<section class="about-sec" id="about">
  <div class="about-inner">
    <div class="sec-label">About Us</div>
    <h2 class="sec-title">Who <span>We Are</span></h2>
    <p class="about-text">${siteData.about}</p>
    <div class="detail-row">
      <div class="detail-icon">${ICON.pin}</div>
      <div><strong>Location</strong>${displayAddress}${business.floorUnit ? `<br><span style="opacity:0.75;font-size:0.85em">${business.floorUnit}</span>` : ''}</div>
    </div>
    <div class="detail-row">
      <div class="detail-icon">${ICON.phone}</div>
      <div><strong>Phone</strong><a href="tel:${business.phone}" style="color:inherit">${business.phone}</a></div>
    </div>
    ${business.hours ? `<div class="detail-row"><div class="detail-icon">${ICON.clock}</div><div><strong>Hours</strong>${business.hours}</div></div>` : ''}
    <div class="detail-row">
      <div class="detail-icon">${ICON.chat}</div>
      <div><strong>WhatsApp</strong><a href="${whatsappLink}" target="_blank" onclick="trackWA()" style="color:inherit">Chat with us</a></div>
    </div>
    <div class="contact-btns">
      <button class="btn-contact btn-save" onclick="saveContact()">${ICON.save} Save Contact</button>
      <a href="${mapsLink}" target="_blank" class="btn-contact btn-map" onclick="trackDir()">${ICON.pin} Get Directions</a>
    </div>
  </div>
</section>

<section class="cta-section" id="contact">
  <div class="cta-inner">
    <h2 class="cta-title">Ready to <span style="color:${style.accent}">Get Started?</span></h2>
    <p class="cta-sub">${siteData.tagline}</p>
    <div class="cta-btns">
      <a href="${whatsappLink}" target="_blank" class="btn-wa" onclick="trackWA()">${ICON.chat} ${siteData.cta_text}</a>
      <a href="tel:${business.phone}" class="btn-call">${ICON.phone} Call ${business.phone}</a>
    </div>
  </div>
</section>

<footer>
  <p>© ${new Date().getFullYear()} ${business.name} · ${displayAddress}</p>
  <p style="margin-top:8px">Powered by <a href="https://oflix.space" target="_blank">OfliX</a>${photoCreditHtml}</p>
</footer>

<script>
var BUSINESS_ID = "${business.id}";
var TRACK_URL = "https://oflix.space/api/track";

function track(action) {
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
}

// ── Initial generation: AI writes SiteData, we render it locally ────
export async function generateWebsite(business: BusinessInput): Promise<{ html: string; siteData: SiteData }> {
  const style = CATEGORY_COLORS[business.category] || CATEGORY_COLORS.other

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
  "offerings": [
    { "name": "Offering name", "description": "One sentence description", "price": "KES amount, per unit, or null if not applicable" }
  ],
  "cta_text": "Call to action button text (max 5 words)",
  "image_keyword": "A specific 2-4 word English search term for a stock photo that accurately represents THIS business (e.g. 'pharmacy medicine shelves', 'hair salon interior', 'car mechanic garage', 'plumber fixing pipes'). Be precise based on the actual description, not just the category."
}

Return between 3 and 5 offerings. Only include a "price" when the business would naturally display one (e.g. a price list, a menu, per-kg or per-session rates) — otherwise set it to null.`

  const authHeader = await getAuthHeader()

  const response = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
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

  let content: Record<string, any>
  try {
    const cleaned = raw.replace(/^```json\n?/i, '').replace(/\n?```$/i, '').trim()
    content = JSON.parse(cleaned)
  } catch {
    throw new Error('Failed to parse generated content')
  }

  const imageKeyword = content.image_keyword || business.category
  const photo = await fetchUnsplashPhoto(imageKeyword, business.category)

  const siteData: SiteData = {
    tagline: content.tagline,
    hero_title: content.hero_title,
    hero_subtitle: content.hero_subtitle,
    about: content.about,
    offerings: (Array.isArray(content.offerings) ? content.offerings : []).slice(0, 6),
    cta_text: content.cta_text,
    style,
  }

  const html = renderSiteHtml(
    business,
    siteData,
    buildHeroImgTag(photo),
    buildPhotoCreditHtml(photo)
  )

  return { html, siteData }
}

// ── Fast edit path: small JSON in, small JSON out, rendered locally ──
// Used only for edits that can be fully described within SiteData
// (content and style/theme changes). Anything that would require adding
// a section SiteData has no field for (a gallery, a reordering of
// sections) is asked to return the input unchanged, which callers treat
// as "this needs the full custom-edit path instead."
export async function editSiteData(siteData: SiteData, editPrompt: string): Promise<SiteData> {
  const prompt = `You are editing structured content data for a Nairobi business website. Return ONLY valid JSON, no markdown, no explanation.

CURRENT DATA:
${JSON.stringify(siteData, null, 2)}

REQUESTED CHANGE: "${editPrompt}"

Apply ONLY the requested change. Keep everything else exactly the same. Return the complete data using this exact structure:
{
  "tagline": "...",
  "hero_title": "...",
  "hero_subtitle": "...",
  "about": "...",
  "offerings": [{ "name": "...", "description": "...", "price": "... or null" }],
  "cta_text": "...",
  "style": { "bg": "#hexcolor", "accent": "#hexcolor", "text": "#hexcolor", "muted": "#hexcolor", "display_font": "'FontName', serif" }
}

If the request cannot be satisfied by only changing these fields — for example it asks to add a new section like a photo gallery, or reorder the page — return the CURRENT DATA completely unchanged.`

  const authHeader = await getAuthHeader()

  const response = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || 'Edit failed')
  }

  const data = await response.json()
  const raw = data.content?.find((b: { type: string }) => b.type === 'text')?.text || ''
  if (!raw) throw new Error('No content was generated')

  const cleaned = raw.replace(/^```json\n?/i, '').replace(/\n?```$/i, '').trim()
  let updated: SiteData
  try {
    updated = JSON.parse(cleaned)
  } catch {
    throw new Error('Failed to parse edited content')
  }

  // Shape guard — never let a malformed response corrupt the site.
  if (!updated || !Array.isArray(updated.offerings) || !updated.style) {
    throw new Error('Edit returned an unexpected shape')
  }
  updated.offerings = updated.offerings.slice(0, 8)

  return updated
}