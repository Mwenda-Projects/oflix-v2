// src/lib/photos.ts
// Curated Unsplash photos per business category
// These are stable URLs that don't expire — safe to use in generated websites

export const CATEGORY_PHOTOS: Record<string, {
  hero: string
  gallery: string[]
  alt: string
}> = {
  salon: {
    hero: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80',
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80',
      'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=800&q=80',
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80',
    ],
    alt: 'Professional hair salon',
  },
  food: {
    hero: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80',
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    ],
    alt: 'Delicious restaurant food',
  },
  clinic: {
    hero: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80',
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
      'https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=800&q=80',
      'https://images.unsplash.com/photo-1581056771107-24ca5f033842?w=800&q=80',
    ],
    alt: 'Professional medical clinic',
  },
  retail: {
    hero: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80',
      'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&q=80',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80',
    ],
    alt: 'Retail shop products',
  },
  school: {
    hero: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80',
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80',
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80',
      'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&q=80',
    ],
    alt: 'School and education',
  },
  transport: {
    hero: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=800&q=80',
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&q=80',
      'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80',
      'https://images.unsplash.com/photo-1591768793355-74d04bb6608f?w=800&q=80',
    ],
    alt: 'Transport and logistics',
  },
  construction: {
    hero: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80',
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80',
    ],
    alt: 'Construction and building',
  },
  agriculture: {
    hero: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80',
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
      'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800&q=80',
      'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=800&q=80',
    ],
    alt: 'Agriculture and farming',
  },
  tech: {
    hero: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80',
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80',
      'https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=800&q=80',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
    ],
    alt: 'Technology and digital services',
  },
  other: {
    hero: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80',
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
      'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?w=800&q=80',
    ],
    alt: 'Professional business',
  },
}

// Build the photo section of the AI prompt
export function buildPhotoPrompt(category: string): string {
  const photos = CATEGORY_PHOTOS[category] || CATEGORY_PHOTOS.other

  return `
IMAGES — use these exact URLs in your HTML, do not make up image URLs:
- Hero/banner image: ${photos.hero}
- Gallery image 1: ${photos.gallery[0]}
- Gallery image 2: ${photos.gallery[1]}
- Gallery image 3: ${photos.gallery[2]}
- Gallery image 4: ${photos.gallery[3]}

Image rules:
- Use the hero image as a full-width background or large banner at the top
- Use gallery images in a services or gallery section
- All images must have object-fit: cover and appropriate dimensions
- Add alt="${photos.alt}" to all img tags
- Never use placeholder.com or any other placeholder URLs
- These are real professional photos — use them prominently to make the site look stunning`
}