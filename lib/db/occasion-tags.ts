/**
 * Which occasions each piece genuinely suits.
 *
 * This is a hand-written list on purpose. The first version matched keywords
 * against the product description and produced nonsense — "Wedding Calendar
 * Keepsake" landed in New Baby because its description contains the word
 * "names". Meaning cannot be inferred from substrings, so it is stated.
 *
 * The owner can retag anything in the studio; this is only the starting point
 * for pieces that ship with the site.
 */

export const OCCASION_SEEDS: { key: string; label: string; emoji: string }[] = [
  { key: 'wedding', label: 'Weddings', emoji: '💍' },
  { key: 'anniversary', label: 'Anniversaries', emoji: '💛' },
  { key: 'for-mum', label: 'For Mum', emoji: '🌷' },
  { key: 'new-home', label: 'New Home', emoji: '🏡' },
  { key: 'rakhi', label: 'Rakhi', emoji: '🪢' },
  { key: 'newborn', label: 'New Baby', emoji: '🍼' },
  { key: 'farewell', label: 'Farewell & Thank You', emoji: '🎁' },
];

/** Product name -> occasion keys. Names match data/products.json exactly. */
export const PRODUCT_OCCASIONS: Record<string, string[]> = {
  // Statement decor — a housewarming or wedding present.
  'Green & Gold Geode Clock': ['new-home', 'wedding'],
  'Black & Silver Geode Clock': ['new-home', 'wedding'],
  '"Home Sweet Home" Key Holder': ['new-home'],
  'Personalised Name Tray': ['new-home', 'for-mum'],
  'Floral Coaster Set': ['new-home', 'farewell'],

  // The wedding keepsakes — these belong to the couple, not to a gift-giver.
  'Wedding Calendar Keepsake': ['wedding', 'anniversary'],
  'Varmala Preservation Frame': ['wedding', 'anniversary'],
  'Varmala Preservation Keepsake': ['wedding', 'anniversary'],
  'Couple Name Letters': ['wedding', 'anniversary'],

  // Photo and memory pieces.
  'Preserved Flower Frame': ['anniversary', 'for-mum'],
  'Resin Photo Frame': ['anniversary', 'for-mum', 'farewell'],
  'Family Photo Frame': ['for-mum', 'anniversary'],
  'Fingerprint Memory Pendant': ['newborn', 'for-mum', 'anniversary'],
  'Photo Memory Keychain': ['farewell', 'rakhi', 'anniversary'],
  'Tassel Photo Keychain': ['farewell', 'rakhi'],

  // Jewellery.
  'Resin Heart Earrings': ['for-mum', 'anniversary'],
  'Floral Jewellery Set': ['for-mum', 'anniversary'],
  'Floral Resin Pendant': ['for-mum', 'rakhi'],
  'Preserved Flower Jhumkas': ['wedding', 'for-mum'],
  'Daisy Resin Jhumkas': ['for-mum', 'rakhi'],

  // Small gifts.
  'Mini Gift Hamper': ['farewell', 'rakhi', 'for-mum'],
  'Resin Feather Bookmark': ['farewell', 'rakhi'],
  'Letter Keychain': ['rakhi', 'farewell'],
  'Crochet Keychain': ['rakhi', 'farewell'],
  'Amigurumi Plushie': ['newborn', 'rakhi'],

  // Blooms.
  'Crochet Tulip Bouquet': ['for-mum', 'anniversary', 'farewell'],
  'Fresh Flower Bouquet': ['for-mum', 'anniversary', 'farewell'],
  'Mixed Crochet Bouquet': ['for-mum', 'anniversary', 'farewell'],
};

/**
 * Bumped whenever the curated list above changes materially. The database
 * re-applies the tags once per version, which is how the bad keyword-matched
 * tags from version 1 get cleaned up in place.
 */
export const TAGGING_VERSION = 2;
