import imageCompression from 'browser-image-compression'
import { supabase } from '@/lib/supabase'

// Bucket used for all business-uploaded images (logo, hero, gallery, etc.)
// Create this bucket in the Supabase dashboard with:
//   - Public bucket: ON
//   - File size limit: 1 MB
//   - Allowed MIME types: image/webp, image/jpeg, image/png
export const IMAGE_BUCKET = 'business-images'

const COMPRESSION_OPTIONS = {
  maxWidthOrHeight: 1080,
  useWebWorker: true,
  fileType: 'image/webp',
  initialQuality: 0.8,
}

export interface UploadedImage {
  publicUrl: string
  path: string
}

/**
 * Compresses an image client-side to webp (~150-300KB target) and uploads
 * it to the business-images bucket under businessId/slot/uuid.webp
 */
export async function compressAndUpload(
  file: File,
  businessId: string,
  slot: string
): Promise<UploadedImage> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed.')
  }

  const isHeic =
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    /\.heic$|\.heif$/i.test(file.name)
  if (isHeic) {
    throw new Error(
      'HEIC photos from iPhone aren\'t supported yet. Please use JPG or PNG, or switch your camera format in Settings > Camera > Formats > Most Compatible.'
    )
  }

  let compressedFile: File
  try {
    compressedFile = await imageCompression(file, COMPRESSION_OPTIONS)
  } catch (err) {
    console.error('Compression failed:', err)
    throw new Error('Could not process that image. Try a different file.')
  }

  if (compressedFile.size > 1024 * 1024) {
    throw new Error('Image is still too large after compression. Try a smaller source photo.')
  }

  const fileName = `${businessId}/${slot}/${crypto.randomUUID()}.webp`

  const { error: uploadError } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(fileName, compressedFile, {
      contentType: 'image/webp',
      cacheControl: '31536000',
      upsert: false,
    })

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`)
  }

  const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(fileName)

  return { publicUrl: data.publicUrl, path: fileName }
}

/**
 * Deletes an image from storage if its URL points at our bucket.
 * Silently no-ops for external URLs (Unsplash, etc.) or missing paths.
 * Never throws — cleanup failures shouldn't block the swap flow.
 */
export async function deleteIfOwnedImage(url: string | null | undefined) {
  if (!url) return
  const marker = `/storage/v1/object/public/${IMAGE_BUCKET}/`
  const idx = url.indexOf(marker)
  if (idx === -1) return // not one of our uploaded images (e.g. Unsplash) — nothing to clean up

  const path = url.slice(idx + marker.length)
  if (!path) return

  const { error } = await supabase.storage.from(IMAGE_BUCKET).remove([path])
  if (error) {
    console.warn(`Failed to delete old image at ${path}:`, error.message)
  }
}

/**
 * Scans an HTML string for elements carrying data-img-slot, and returns
 * the slot name + current src for each. Used to render "Replace" controls
 * dynamically for whatever slots actually exist on a given business's site.
 */
export interface ImageSlot {
  slot: string
  src: string
}

export function findImageSlots(html: string): ImageSlot[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const nodes = Array.from(doc.querySelectorAll('[data-img-slot]'))
  return nodes
    .map(node => ({
      slot: node.getAttribute('data-img-slot') || '',
      src: (node as HTMLImageElement).getAttribute('src') || '',
    }))
    .filter(s => s.slot)
}

/**
 * Replaces the src of the element with the given data-img-slot value,
 * and returns the full updated HTML string. Throws if the slot isn't found.
 */
export function replaceImageSlot(html: string, slot: string, newSrc: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const node = doc.querySelector(`[data-img-slot="${CSS.escape(slot)}"]`)
  if (!node) {
    throw new Error(`Could not find image slot "${slot}" in the current page.`)
  }
  node.setAttribute('src', newSrc)
  return '<!DOCTYPE html>\n' + doc.documentElement.outerHTML
}