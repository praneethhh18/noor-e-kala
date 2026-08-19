/**
 * What a customer can put on a piece, and how it should look in the preview.
 *
 * Eleven of the twenty-eight pieces have a name, date or photo applied to them,
 * and every one of them is currently sold using a photo of somebody else's
 * name. This describes the piece well enough to render the buyer's own words
 * onto it before they order.
 */
export type PersonaliseStyle = 'engraved' | 'script' | 'letters';

export type Personalise = {
  /** Field label, e.g. "Names to put on it". */
  label: string;
  placeholder: string;
  /** Sensible cap so the preview stays legible and she can actually make it. */
  max: number;
  /** How the text is rendered on the piece. */
  style: PersonaliseStyle;
  /** Finish options she can actually produce. First one is the default. */
  colours: { name: string; value: string }[];
  /** Roughly where the text sits on the product photo, in percent. */
  position?: { x: number; y: number };
  /** Extra prompt shown under the field, e.g. "Send the photo on WhatsApp". */
  hint?: string;
  /**
   * Optional photo of the piece with no lettering on it. When set, the buyer's
   * text is drawn onto this image instead of shown beside it — which only works
   * because the image is blank. Product photos are not, so they cannot be used.
   */
  previewImage?: string;
};

export function parsePersonalise(raw: unknown): Personalise | null {
  if (!raw) return null;
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!parsed || typeof parsed.label !== 'string') return null;
    return {
      label: parsed.label,
      placeholder: String(parsed.placeholder ?? ''),
      max: Number(parsed.max) || 24,
      style: (['engraved', 'script', 'letters'] as const).includes(parsed.style) ? parsed.style : 'engraved',
      colours: Array.isArray(parsed.colours) && parsed.colours.length
        ? parsed.colours
        : [{ name: 'Gold', value: '#C9A227' }],
      position: parsed.position ?? { x: 50, y: 50 },
      hint: parsed.hint ?? undefined,
      previewImage: parsed.previewImage ?? undefined,
    };
  } catch {
    return null;
  }
}

const GOLD = { name: 'Gold', value: '#C9A227' };
const ROSE = { name: 'Rose gold', value: '#D99A8A' };
const SILVER = { name: 'Silver', value: '#C9CDD2' };
const WHITE = { name: 'White', value: '#FFFFFF' };
const INK = { name: 'Deep brown', value: '#3B2C26' };

/** Starting configuration for the pieces that ship with the site. */
export const PERSONALISE_SEEDS: Record<string, Personalise> = {
  'Personalised Name Tray': {
    label: 'Name to put on the tray',
    placeholder: 'Hafsa',
    max: 16,
    style: 'script',
    colours: [GOLD, ROSE, WHITE],
    position: { x: 50, y: 62 },
  },
  'Couple Name Letters': {
    label: 'Two initials or short names',
    placeholder: 'S & M',
    max: 20,
    style: 'letters',
    colours: [ROSE, GOLD, WHITE],
    position: { x: 50, y: 52 },
  },
  'Letter Keychain': {
    label: 'Letter or initial',
    placeholder: 'A',
    max: 3,
    style: 'letters',
    colours: [GOLD, SILVER, ROSE],
    position: { x: 50, y: 50 },
  },
  'Wedding Calendar Keepsake': {
    label: 'Names and wedding date',
    placeholder: 'Rajat & Priyanka · 24.11.2025',
    max: 40,
    style: 'engraved',
    colours: [GOLD, INK],
    position: { x: 50, y: 58 },
    hint: 'I will lay this out beautifully — the exact spacing is up to me.',
  },
  'Fingerprint Memory Pendant': {
    label: 'Name or word beside the print',
    placeholder: 'Dad',
    max: 12,
    style: 'engraved',
    colours: [GOLD, SILVER],
    position: { x: 56, y: 46 },
    hint: 'Send a clear fingerprint photo on WhatsApp and I will guide you.',
  },
  'Resin Photo Frame': {
    label: 'Name or short line',
    placeholder: 'Our little family',
    max: 24,
    style: 'script',
    colours: [GOLD, WHITE, ROSE],
    position: { x: 50, y: 78 },
    hint: 'Send your photo on WhatsApp after ordering.',
  },
  'Family Photo Frame': {
    label: 'Family name or line',
    placeholder: 'Family',
    max: 24,
    style: 'script',
    colours: [GOLD, WHITE],
    position: { x: 50, y: 80 },
    hint: 'Send your photo on WhatsApp after ordering.',
  },
  'Photo Memory Keychain': {
    label: 'Name on the back',
    placeholder: 'Aanya',
    max: 14,
    style: 'engraved',
    colours: [GOLD, SILVER],
    position: { x: 50, y: 70 },
    hint: 'Send your photo on WhatsApp after ordering.',
  },
  'Tassel Photo Keychain': {
    label: 'Name on the back',
    placeholder: 'Meera',
    max: 14,
    style: 'engraved',
    colours: [GOLD, ROSE],
    position: { x: 50, y: 72 },
    hint: 'Send your photo on WhatsApp after ordering.',
  },
  'Varmala Preservation Frame': {
    label: 'Names and date for the frame',
    placeholder: 'Rajat & Priyanka · 24.11.2025',
    max: 40,
    style: 'engraved',
    colours: [GOLD, INK],
    position: { x: 50, y: 82 },
    hint: 'Post your varmala to me within a few days of the wedding — I will explain how.',
  },
  'Varmala Preservation Keepsake': {
    label: 'Names and date',
    placeholder: 'Aisha & Omar · 12.02.2026',
    max: 40,
    style: 'engraved',
    colours: [GOLD, INK],
    position: { x: 50, y: 80 },
    hint: 'Post your varmala to me within a few days of the wedding — I will explain how.',
  },
};

/**
 * Bumped when the shipped configuration changes. Re-applies the seeds above to
 * the pieces that ship with the site, so a bad setting (v1 capped couple names
 * at 12 characters, which cut "Aanya & Rohan" short) can be corrected in an
 * existing database. Pieces the owner adds herself are never touched.
 */
export const PERSONALISE_VERSION = 2;
