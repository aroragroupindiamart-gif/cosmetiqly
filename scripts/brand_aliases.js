/**
 * Canonical Brand Alias & Exclusion Map (§2.4)
 * Ensures one canonical display name + one brand_slug across Tier B and import.
 */

export function normalizeForLookup(raw) {
  if (!raw) return '';
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’`]/g, ' ')
    .replace(/&/g, ' and ')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const EXCLUDED_EXACT = new Set([
  'null', 'undefined', 'unknown', 'placeholder', 'generic', 'none', 'n a', 'na',
  'l oreal norge as', 'l oreal norge as slt', 'loreal norge as', 'loreal norge as slt',
  'rewe beste wahl', 'beste wahl'
]);

const EXCLUDED_SUBSTRINGS = [
  'norge as',
  'beste wahl',
  'placeholder',
  'is sold by',
  'distribue par'
];

export function isExcludedBrand(rawBrand) {
  if (!rawBrand) return true;
  const firstPart = rawBrand.split(',')[0].trim();
  if (firstPart.length < 2) return true;
  const norm = normalizeForLookup(firstPart);
  if (!norm || norm.length < 2) return true;
  if (EXCLUDED_EXACT.has(norm)) return true;
  if (EXCLUDED_SUBSTRINGS.some(sub => norm.includes(sub))) return true;
  return false;
}

export const BRAND_ALIAS_MAP = {
  'nivea': { brand: 'Nivea', brand_slug: 'nivea' },
  'nivea men': { brand: 'Nivea', brand_slug: 'nivea' },
  'nivea baby': { brand: 'Nivea', brand_slug: 'nivea' },
  'nivea sun': { brand: 'Nivea', brand_slug: 'nivea' },
  'nivea visage': { brand: 'Nivea', brand_slug: 'nivea' },
  'cerave': { brand: 'CeraVe', brand_slug: 'cerave' },
  'avene': { brand: 'Avène', brand_slug: 'avene' },
  'eau thermale avene': { brand: 'Avène', brand_slug: 'avene' },
  'avene eau thermale': { brand: 'Avène', brand_slug: 'avene' },
  'la roche posay': { brand: 'La Roche-Posay', brand_slug: 'la-roche-posay' },
  'laroche posay': { brand: 'La Roche-Posay', brand_slug: 'la-roche-posay' },
  'l oreal': { brand: "L'Oréal Paris", brand_slug: 'l-oreal-paris' },
  'loreal': { brand: "L'Oréal Paris", brand_slug: 'l-oreal-paris' },
  'l oreal paris': { brand: "L'Oréal Paris", brand_slug: 'l-oreal-paris' },
  'loreal paris': { brand: "L'Oréal Paris", brand_slug: 'l-oreal-paris' },
  'l oreal paris men expert': { brand: "L'Oréal Paris", brand_slug: 'l-oreal-paris' },
  'l oreal men expert': { brand: "L'Oréal Paris", brand_slug: 'l-oreal-paris' },
  'l oreal paris elvive': { brand: "L'Oréal Paris", brand_slug: 'l-oreal-paris' },
  'l oreal paris skin expert': { brand: "L'Oréal Paris", brand_slug: 'l-oreal-paris' },
  'l oreal paris revitalift': { brand: "L'Oréal Paris", brand_slug: 'l-oreal-paris' },
  'head and shoulders': { brand: 'Head & Shoulders', brand_slug: 'head-shoulders' },
  'head shoulders': { brand: 'Head & Shoulders', brand_slug: 'head-shoulders' },
  'naturium': { brand: 'Naturium', brand_slug: 'naturium' },
  'neutrogena': { brand: 'Neutrogena', brand_slug: 'neutrogena' },
  'cetaphil': { brand: 'Cetaphil', brand_slug: 'cetaphil' },
  'bioderma': { brand: 'Bioderma', brand_slug: 'bioderma' },
  'eucerin': { brand: 'Eucerin', brand_slug: 'eucerin' },
  'vichy': { brand: 'Vichy', brand_slug: 'vichy' },
  'vichy laboratoires': { brand: 'Vichy', brand_slug: 'vichy' },
  'dove': { brand: 'Dove', brand_slug: 'dove' },
  'dove men care': { brand: 'Dove', brand_slug: 'dove' },
  'aveeno': { brand: 'Aveeno', brand_slug: 'aveeno' },
  'olay': { brand: 'Olay', brand_slug: 'olay' },
  'garnier': { brand: 'Garnier', brand_slug: 'garnier' },
  'himalaya': { brand: 'Himalaya', brand_slug: 'himalaya' },
  'himalaya herbals': { brand: 'Himalaya', brand_slug: 'himalaya' },
  'himalaya wellness': { brand: 'Himalaya', brand_slug: 'himalaya' },
  'mamaearth': { brand: 'Mamaearth', brand_slug: 'mamaearth' },
  'mustela': { brand: 'Mustela', brand_slug: 'mustela' },
  'weleda': { brand: 'Weleda', brand_slug: 'weleda' },
  'clinique': { brand: 'Clinique', brand_slug: 'clinique' },
  'sebamed': { brand: 'Sebamed', brand_slug: 'sebamed' },
  'svr': { brand: 'SVR', brand_slug: 'svr' },
  'laboratoire svr': { brand: 'SVR', brand_slug: 'svr' },
  'uriage': { brand: 'Uriage', brand_slug: 'uriage' },
  'ducray': { brand: 'Ducray', brand_slug: 'ducray' },
  'nuxe': { brand: 'Nuxe', brand_slug: 'nuxe' },
  'caudalie': { brand: 'Caudalie', brand_slug: 'caudalie' },
  'clarins': { brand: 'Clarins', brand_slug: 'clarins' },
  'shiseido': { brand: 'Shiseido', brand_slug: 'shiseido' },
  'maybelline': { brand: 'Maybelline', brand_slug: 'maybelline' },
  'maybelline new york': { brand: 'Maybelline', brand_slug: 'maybelline' },
  'revlon': { brand: 'Revlon', brand_slug: 'revlon' },
  'hawaiian tropic': { brand: 'Hawaiian Tropic', brand_slug: 'hawaiian-tropic' },
  'plum': { brand: 'Plum', brand_slug: 'plum' },
  'plum goodness': { brand: 'Plum', brand_slug: 'plum' },
  'simple': { brand: 'Simple', brand_slug: 'simple' },
  'pond s': { brand: "Pond's", brand_slug: 'ponds' },
  'ponds': { brand: "Pond's", brand_slug: 'ponds' },
  'ponds s': { brand: "Pond's", brand_slug: 'ponds' },
  'minimalist': { brand: 'Minimalist', brand_slug: 'minimalist' },
  'the derma co': { brand: 'The Derma Co.', brand_slug: 'the-derma-co' },
  'derma co': { brand: 'The Derma Co.', brand_slug: 'the-derma-co' },
  'pilgrim': { brand: 'Pilgrim', brand_slug: 'pilgrim' },
  'conscious chemist': { brand: 'Conscious Chemist', brand_slug: 'conscious-chemist' },
  'foxtale': { brand: 'Foxtale', brand_slug: 'foxtale' },
  'wow skin science': { brand: 'WOW Skin Science', brand_slug: 'wow-skin-science' },
  'dot and key': { brand: 'Dot & Key', brand_slug: 'dot-and-key' },
  'dot key': { brand: 'Dot & Key', brand_slug: 'dot-and-key' },
  'balea': { brand: 'Balea', brand_slug: 'balea' },
  'balea men': { brand: 'Balea', brand_slug: 'balea' },
  'balea med': { brand: 'Balea', brand_slug: 'balea' },
  'kiehl s': { brand: "Kiehl's", brand_slug: 'kiehl-s-since-1851' },
  'kiehl s since 1851': { brand: "Kiehl's", brand_slug: 'kiehl-s-since-1851' },
  'kiehls': { brand: "Kiehl's", brand_slug: 'kiehl-s-since-1851' },
  'paula s choice': { brand: "Paula's Choice", brand_slug: 'paula-s-choice' },
  'paulas choice': { brand: "Paula's Choice", brand_slug: 'paula-s-choice' },
  'the ordinary': { brand: 'The Ordinary', brand_slug: 'the-ordinary' },
  'aquaphor': { brand: 'Aquaphor', brand_slug: 'aquaphor' },
  'gold bond': { brand: 'Gold Bond', brand_slug: 'gold-bond' },
  'dermalogica': { brand: 'Dermalogica', brand_slug: 'dermalogica' },
  'philosophy': { brand: 'Philosophy', brand_slug: 'philosophy' },
  'strivectin': { brand: 'StriVectin', brand_slug: 'strivectin' },
  'murad': { brand: 'Murad', brand_slug: 'murad' },
  'panoxyl': { brand: 'PanOxyl', brand_slug: 'panoxyl' },
  'differin': { brand: 'Differin', brand_slug: 'differin' },
  'rhode': { brand: 'Rhode', brand_slug: 'rhode' },
  'rhode skin': { brand: 'Rhode', brand_slug: 'rhode' },
  'beauty of joseon': { brand: 'Beauty of Joseon', brand_slug: 'beauty-of-joseon' },
  'anua': { brand: 'Anua', brand_slug: 'anua' },
  'mediheal': { brand: 'Mediheal', brand_slug: 'mediheal' },
  'abib': { brand: 'Abib', brand_slug: 'abib' },
  'torriden': { brand: 'Torriden', brand_slug: 'torriden' },
  'klairs': { brand: 'Klairs', brand_slug: 'klairs' },
  'dear klairs': { brand: 'Klairs', brand_slug: 'klairs' },
  'purito': { brand: 'Purito', brand_slug: 'purito' },
  'isntree': { brand: 'Isntree', brand_slug: 'isntree' },
  'mizon': { brand: 'Mizon', brand_slug: 'mizon' },
  'missha': { brand: 'Missha', brand_slug: 'missha' },
  'etude': { brand: 'Etude', brand_slug: 'etude' },
  'etude house': { brand: 'Etude', brand_slug: 'etude' },
  'benton': { brand: 'Benton', brand_slug: 'benton' },
  'iunik': { brand: 'iUNIK', brand_slug: 'iunik' },
  'vaseline': { brand: 'Vaseline', brand_slug: 'vaseline' },
  'biore': { brand: 'Bioré', brand_slug: 'biore' },
  'estee lauder': { brand: 'Estée Lauder', brand_slug: 'estee-lauder' },
  'lotus herbals': { brand: 'Lotus Herbals', brand_slug: 'lotus-herbals' },
  'lotus': { brand: 'Lotus Herbals', brand_slug: 'lotus-herbals' },
  'lakme': { brand: 'Lakmé', brand_slug: 'lakme' },
  'biotique': { brand: 'Biotique', brand_slug: 'biotique' },
  'kama ayurveda': { brand: 'Kama Ayurveda', brand_slug: 'kama-ayurveda' }
};

export function normalizeBrand(rawBrand) {
  if (isExcludedBrand(rawBrand)) return null;
  let b = rawBrand.split(',')[0].trim();
  b = b.replace(/\b(is sold by|distribué par|made in|by)\b.*/i, '').trim();
  const lookup = normalizeForLookup(b);
  if (!lookup || lookup.length < 2) return null;
  if (EXCLUDED_EXACT.has(lookup)) return null;

  if (BRAND_ALIAS_MAP[lookup]) {
    return BRAND_ALIAS_MAP[lookup];
  }

  // Fallback for unmapped brands: clean title case + slugify
  const display = b.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim();
  const brandSlug = slugify(display);
  if (!brandSlug || brandSlug === 'null' || brandSlug === 'undefined') return null;
  return { brand: display, brand_slug: brandSlug };
}
