import { supabase } from './supabase'

// ── Types ──────────────────────────────────────────────────────

export interface Profile {
  id: string
  full_name: string
  email: string
  created_at: string
}

export interface Business {
  id: string
  owner_id: string
  name: string
  slug: string
  category: string
  description: string
  hours?: string
  phone: string
  whatsapp: string
  email?: string
  address: string
  building?: string
  floor_unit?: string
  google_maps_url?: string
  is_live: boolean
  created_at: string
  updated_at: string
}

export interface Lead {
  id: string
  business_id: string
  action: 'whatsapp_tap' | 'directions_tap' | 'page_view' | 'contact_save'
  created_at: string
}

// ── Auth ───────────────────────────────────────────────────────

export async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })
  return { data, error: error?.message ?? null }
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error: error?.message ?? null }
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// ── Profile ────────────────────────────────────────────────────

export async function getProfile(): Promise<Profile | null> {
  const user = await getUser()
  if (!user) return null
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  return data
}

// ── Business ───────────────────────────────────────────────────

// Generate a URL-friendly slug from business name
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export async function createBusiness(input: {
  name: string
  category: string
  description: string
  phone: string
  whatsapp: string
  address: string
  building?: string
  floorUnit?: string
  googleMapsUrl?: string
  hours?: string
}): Promise<{ data: Business | null; error: string | null }> {
  const user = await getUser()
  if (!user) return { data: null, error: 'Not logged in.' }

  // Generate unique slug
  let slug = generateSlug(input.name)
  const { data: existing } = await supabase
    .from('businesses')
    .select('slug')
    .eq('slug', slug)
    .single()

  if (existing) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`
  }

  const { data, error } = await supabase
    .from('businesses')
    .insert({
      owner_id: user.id,
      name: input.name,
      slug,
      category: input.category,
      description: input.description,
      phone: input.phone,
      whatsapp: input.whatsapp || input.phone,
      address: input.address,
      building: input.building || null,
      floor_unit: input.floorUnit || null,
      google_maps_url: input.googleMapsUrl || null,
      hours: input.hours || null,
    })
    .select()
    .single()

  return { data, error: error?.message ?? null }
}

export async function getMyBusiness(): Promise<Business | null> {
  const user = await getUser()
  if (!user) return null
  const { data } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .single()
  return data
}

export async function updateBusiness(
  id: string,
  updates: Partial<Business>
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('businesses')
    .update(updates)
    .eq('id', id)
  return { error: error?.message ?? null }
}

// Public: get business by slug (for the public business page)
export async function getBusinessBySlug(slug: string): Promise<Business | null> {
  const { data } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .eq('is_live', true)
    .single()
  return data
}

// ── Leads ──────────────────────────────────────────────────────

export async function trackLead(
  businessId: string,
  action: Lead['action']
): Promise<void> {
  await supabase
    .from('leads')
    .insert({ business_id: businessId, action })
}

export async function getLeadStats(businessId: string) {
  const { data } = await supabase
    .from('leads')
    .select('action')
    .eq('business_id', businessId)

  if (!data) return { pageViews: 0, whatsappTaps: 0, directionsTaps: 0, contactSaves: 0 }

  return {
    pageViews:      data.filter((l: { action: string }) => l.action === 'page_view').length,
    whatsappTaps:   data.filter((l: { action: string }) => l.action === 'whatsapp_tap').length,
    directionsTaps: data.filter((l: { action: string }) => l.action === 'directions_tap').length,
    contactSaves:   data.filter((l: { action: string }) => l.action === 'contact_save').length,
  }
}