import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { isExcludedBrand } from './brand_aliases.js';
import { SAFETY_RULES } from '../src/lib/safety_rules_v2.js';
import { isRuleRelevant } from '../src/lib/rule_engine_v2.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cleanPath = path.join(__dirname, '../data/products_clean.json');
const tierAPath = path.join(__dirname, '../data/launch_tier_a_100.json');

if (!fs.existsSync(cleanPath)) {
  console.error('❌ data/products_clean.json not found. Run import_openbeautyfacts.js first.');
  process.exit(1);
}

const allProducts = JSON.parse(fs.readFileSync(cleanPath, 'utf8'));
const tierAProducts = JSON.parse(fs.readFileSync(tierAPath, 'utf8'));

const nonEnglishInciRegex = /\b(água|óleo|glicerina|conservante|ácido|fragrância|estearato|palmitato|extrato|álcool|manteiga|acqua|olio|acrilati|acido|profumo|estratto|huile|extrait|soin|visage|cheveux|ingredientes|composicion)\b/i;
const nonEnglishNameRegex = /\b(crème|creme|shampoing|gel douche|lait|baume|savon|soin|visage|corps|cheveux|lèvres|levres|masque|nettoyant|hydratant|solaire|eau micellaire|démêlant|après-shampoing|gesicht|körper|feuchtigkeit|reinigung|sonnenschutz|pflege|crema|champú|limpiador|hidratante|protector|jabón|loción)\b/i;

function isNonEnglishName(name) {
  return nonEnglishNameRegex.test(name || '');
}

// 1. Freshness cross-check (§2.6)
console.log('\n📊 === TIER A FRESHNESS CROSS-CHECK ===');
const cleanByBarcode = new Map(allProducts.map(p => [p.barcode, p]));
const identicalBarcodes = [];
const differingBarcodes = [];
const vanishedBarcodes = [];

for (const a of tierAProducts) {
  const fresh = cleanByBarcode.get(a.barcode);
  if (!fresh) {
    vanishedBarcodes.push(a.barcode);
  } else if (fresh.ingredients_raw === a.ingredients_raw) {
    identicalBarcodes.push(a.barcode);
  } else {
    differingBarcodes.push(a.barcode);
  }
}
console.log(`Tier A total: ${tierAProducts.length}`);
console.log(`- Byte-identical ingredients_raw: ${identicalBarcodes.length}`);
console.log(`- Differing ingredients_raw: ${differingBarcodes.length} -> [${differingBarcodes.join(', ')}]`);
console.log(`- Vanished from fresh dump: ${vanishedBarcodes.length} -> [${vanishedBarcodes.join(', ')}]`);

// 2. Exclusions: Tier A barcodes + Tier A slugs + excluded brands
const tierABarcodes = new Set(tierAProducts.map(p => p.barcode));
const tierASlugs = new Set(tierAProducts.map(p => `${p.brand_slug}-${p.product_slug}`));

const DEFAULT_EXCLUDED_SLUGS = new Set([
  'colgate', 'palmolive', 'herbal-essences', 'pantene', 'head-shoulders',
  'carrefour', 'auchan', 'unilever', 'henkel'
]);

const droppedCounts = {
  tierAOverlap: 0,
  slugOverlap: 0,
  excludedBrand: 0,
  defaultExcludedBrand: 0,
  failedFilter: 0
};

const candidates = [];
const seenCandidateSlugs = new Set(tierASlugs);
const seenCandidateBarcodes = new Set(tierABarcodes);

for (const p of allProducts) {
  if (seenCandidateBarcodes.has(p.barcode)) {
    droppedCounts.tierAOverlap++;
    continue;
  }
  const combinedSlug = `${p.brand_slug}-${p.product_slug}`;
  if (seenCandidateSlugs.has(combinedSlug)) {
    droppedCounts.slugOverlap++;
    continue;
  }
  if (isExcludedBrand(p.brand) || !p.brand_slug || p.brand_slug === 'null' || p.brand_slug === 'undefined') {
    droppedCounts.excludedBrand++;
    continue;
  }
  if (DEFAULT_EXCLUDED_SLUGS.has(p.brand_slug)) {
    droppedCounts.defaultExcludedBrand++;
    continue;
  }
  if (/\bvol\.?\s*\d+/i.test(p.name) || p.name.length < 3 || p.brand.length < 2 || nonEnglishInciRegex.test(p.ingredients_raw) || !p.ingredients_list || p.ingredients_list.length < 5) {
    droppedCounts.failedFilter++;
    continue;
  }
  seenCandidateBarcodes.add(p.barcode);
  seenCandidateSlugs.add(combinedSlug);
  candidates.push(p);
}

console.log('\n🔍 Candidate Pool After Hard Filters & Exclusions:');
console.log(`- Eligible ex-TierA candidates: ${candidates.length}`);
console.log(`- Dropped counts:`, droppedCounts);

// 3. Brand priority order (§2.3) + per-brand caps (§2.2 #9)
const BRAND_PRIORITY = [
  // Priority 1
  { slug: 'neutrogena', cap: 20 },
  { slug: 'cetaphil', cap: 20 },
  { slug: 'la-roche-posay', cap: 20 },
  { slug: 'cerave', cap: 20 },
  { slug: 'dove', cap: 15 },
  { slug: 'aveeno', cap: 15 },
  { slug: 'olay', cap: 15 },
  { slug: 'garnier', cap: 15 },
  { slug: 'nivea', cap: 10 },
  { slug: 'bioderma', cap: 15 },
  { slug: 'avene', cap: 15 },
  { slug: 'vichy', cap: 15 },
  { slug: 'eucerin', cap: 15 },
  { slug: 'himalaya', cap: 15 },
  { slug: 'mamaearth', cap: 15 },
  // High-demand thin/zero coverage (after Priority 1 per §2.3)
  { slug: 'paula-s-choice', cap: 15 },
  { slug: 'drunk-elephant', cap: 15 },
  { slug: 'tatcha', cap: 15 },
  { slug: 'skinceuticals', cap: 15 },
  { slug: 'medicube', cap: 15 },
  { slug: 'kiehl-s-since-1851', cap: 15 },
  { slug: 'estee-lauder', cap: 15 },
  // Priority 2
  { slug: 'mustela', cap: 15 },
  { slug: 'weleda', cap: 15 },
  { slug: 'l-oreal-paris', cap: 15 },
  { slug: 'clinique', cap: 15 },
  { slug: 'sebamed', cap: 15 },
  { slug: 'svr', cap: 15 },
  { slug: 'uriage', cap: 15 },
  { slug: 'ducray', cap: 15 },
  { slug: 'nuxe', cap: 15 },
  { slug: 'caudalie', cap: 15 },
  { slug: 'clarins', cap: 15 },
  { slug: 'shiseido', cap: 15 },
  { slug: 'maybelline', cap: 15, skincareFirst: true },
  { slug: 'revlon', cap: 15, skincareFirst: true },
  { slug: 'hawaiian-tropic', cap: 15 },
  // Priority 3
  { slug: 'plum', cap: 15 },
  { slug: 'simple', cap: 15 },
  { slug: 'ponds', cap: 15 },
  { slug: 'minimalist', cap: 15 },
  { slug: 'the-derma-co', cap: 15 },
  { slug: 'pilgrim', cap: 15 },
  { slug: 'conscious-chemist', cap: 15 },
  { slug: 'foxtale', cap: 15 },
  { slug: 'wow-skin-science', cap: 15 },
  { slug: 'dot-and-key', cap: 15 },
  { slug: 'lakme', cap: 15 },
  { slug: 'biotique', cap: 15 },
  { slug: 'kama-ayurveda', cap: 15 },
  { slug: 'lotus-herbals', cap: 15 },
  // Priority 4
  { slug: 'mediheal', cap: 15 },
  { slug: 'abib', cap: 15 },
  { slug: 'anua', cap: 15 },
  { slug: 'torriden', cap: 15 },
  { slug: 'klairs', cap: 15 },
  { slug: 'purito', cap: 15 },
  { slug: 'isntree', cap: 15 },
  { slug: 'mizon', cap: 15 },
  { slug: 'beauty-of-joseon', cap: 15 },
  { slug: 'missha', cap: 15 },
  { slug: 'etude', cap: 15 },
  { slug: 'benton', cap: 15 },
  { slug: 'iunik', cap: 15 },
  { slug: 'cosrx', cap: 15 },
  { slug: 'first-aid-beauty', cap: 15 },
  { slug: 'vanicream', cap: 15 },
  { slug: 'innisfree', cap: 15 },
  { slug: 'rhode', cap: 15 },
  { slug: 'panoxyl', cap: 15 },
  { slug: 'differin', cap: 15 },
  { slug: 'aquaphor', cap: 15 },
  { slug: 'gold-bond', cap: 15 },
  { slug: 'dermalogica', cap: 15 },
  { slug: 'philosophy', cap: 15 },
  { slug: 'strivectin', cap: 15 },
  { slug: 'murad', cap: 15 },
  { slug: 'balea', cap: 10 }
];

const byBrandSlug = new Map();
for (const c of candidates) {
  if (!byBrandSlug.has(c.brand_slug)) byBrandSlug.set(c.brand_slug, []);
  byBrandSlug.get(c.brand_slug).push(c);
}

// Re-measured OBF coverage counts for priority brands + sort within brand
console.log('\n📈 Re-measured OBF Coverage (ex-TierA) per Priority Brand:');
const skippedBrands = [];
for (const bp of BRAND_PRIORITY) {
  const list = byBrandSlug.get(bp.slug) || [];
  if (list.length === 0) {
    skippedBrands.push({ slug: bp.slug, reason: '0 products in fresh OBF clean dump (ex-TierA)' });
  } else {
    list.sort((a, b) => {
      // 1. English-name preference
      const aNonEn = isNonEnglishName(a.name) ? 1 : 0;
      const bNonEn = isNonEnglishName(b.name) ? 1 : 0;
      if (aNonEn !== bNonEn) return aNonEn - bNonEn;
      // 2. For makeup-led brands, skincare/cleanser/sunscreen first
      if (bp.skincareFirst) {
        const skCats = new Set(['Cleanser', 'Sunscreen', 'Moisturizer', 'Serum', 'Toner', 'Mask', 'Skincare']);
        const aSk = skCats.has(a.category) ? 0 : 1;
        const bSk = skCats.has(b.category) ? 0 : 1;
        if (aSk !== bSk) return aSk - bSk;
      }
      // 3. Ingredient photo preference (§2.2 #7)
      const aIngPhoto = a.has_ingredient_photo ? 0 : 1;
      const bIngPhoto = b.has_ingredient_photo ? 0 : 1;
      if (aIngPhoto !== bIngPhoto) return aIngPhoto - bIngPhoto;
      // 4. Product image preference
      const aImg = a.image_url ? 0 : 1;
      const bImg = b.image_url ? 0 : 1;
      if (aImg !== bImg) return aImg - bImg;
      return b.ingredient_count - a.ingredient_count;
    });
    console.log(`  - ${bp.slug}: ${list.length} available (cap ${bp.cap})`);
  }
}

// 4. Category quotas (§2.2 #8)
const QUOTAS = {
  'Sunscreen': 40,
  'Cleanser': 40,
  'Hair': 30,
  'Moisturizer': 30,
  'Body': 20,
  'Serum': 10,
  'Toner': 5,
  'Lip Care': 5,
  'Mask': 5
};

const TARGET_COUNT = 400;
const MAX_NON_EN_NAMES = 18; // <= 5% even after ~368 trim

const brandCapMap = new Map(BRAND_PRIORITY.map(b => [b.slug, b.cap]));

const selected = [];
const selectedBarcodes = new Set();
const brandCounts = new Map();
const categoryCounts = new Map();
let nonEnNameCount = 0;

function canPick(p, cap) {
  if (selectedBarcodes.has(p.barcode)) return false;
  if ((brandCounts.get(p.brand_slug) || 0) >= cap) return false;
  if (isNonEnglishName(p.name) && nonEnNameCount >= MAX_NON_EN_NAMES) return false;
  return true;
}

function pickProduct(p) {
  selected.push(p);
  selectedBarcodes.add(p.barcode);
  brandCounts.set(p.brand_slug, (brandCounts.get(p.brand_slug) || 0) + 1);
  categoryCounts.set(p.category, (categoryCounts.get(p.category) || 0) + 1);
  if (isNonEnglishName(p.name)) nonEnNameCount++;
}

// Pass 1: Satisfy category quotas in brand-priority order
for (const [cat, minNeeded] of Object.entries(QUOTAS)) {
  for (const bp of BRAND_PRIORITY) {
    if ((categoryCounts.get(cat) || 0) >= minNeeded) break;
    const list = byBrandSlug.get(bp.slug) || [];
    for (const p of list) {
      if ((categoryCounts.get(cat) || 0) >= minNeeded) break;
      if (p.category === cat && canPick(p, bp.cap)) {
        pickProduct(p);
      }
    }
  }
}

// If any quota still unmet from priority brands, search remaining clean brands (excluding default-excluded)
for (const [cat, minNeeded] of Object.entries(QUOTAS)) {
  if ((categoryCounts.get(cat) || 0) >= minNeeded) continue;
  for (const [slug, list] of byBrandSlug.entries()) {
    if ((categoryCounts.get(cat) || 0) >= minNeeded) break;
    const cap = brandCapMap.get(slug) ?? 15;
    for (const p of list) {
      if ((categoryCounts.get(cat) || 0) >= minNeeded) break;
      if (p.category === cat && canPick(p, cap)) {
        pickProduct(p);
      }
    }
  }
}

// Pass 2: Fill remaining slots up to TARGET_COUNT in brand-priority order
for (const bp of BRAND_PRIORITY) {
  if (selected.length >= TARGET_COUNT) break;
  const list = byBrandSlug.get(bp.slug) || [];
  for (const p of list) {
    if (selected.length >= TARGET_COUNT) break;
    if (canPick(p, bp.cap)) {
      pickProduct(p);
    }
  }
}

// Order final selected list by BRAND_PRIORITY order (then non-priority fallback)
const priorityIndex = new Map(BRAND_PRIORITY.map((b, i) => [b.slug, i]));
selected.sort((a, b) => {
  const ia = priorityIndex.has(a.brand_slug) ? priorityIndex.get(a.brand_slug) : 9999;
  const ib = priorityIndex.has(b.brand_slug) ? priorityIndex.get(b.brand_slug) : 9999;
  if (ia !== ib) return ia - ib;
  return 0;
});

// 5. Enforce §2.1 hard cap: Batch 2 total URLs <= 3,888 (trim non-quota excess from end of priority order)
const existingManifest = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/drip_manifest.json'), 'utf8'));
const existingBrandHubs = new Set(existingManifest.filter(e => e.type === 'brand_hub' && e.drip_day <= 18).map(e => e.url));

function countBatch2Urls(prods) {
  let checks = 0;
  const newBrands = new Set();
  for (const p of prods) {
    if (!existingBrandHubs.has(`/brand/${p.brand_slug}`)) {
      newBrands.add(p.brand_slug);
    }
    for (const r of SAFETY_RULES) {
      if (isRuleRelevant(r, p.category)) checks++;
    }
  }
  return { checks, newBrands: newBrands.size, total: checks + newBrands.size };
}

let trimmedCount = 0;
let proj = countBatch2Urls(selected);
while (proj.total > 3888 && selected.length > 0) {
  // Find last item whose category exceeds its quota minimum
  let trimIdx = -1;
  for (let i = selected.length - 1; i >= 0; i--) {
    const cat = selected[i].category;
    const curCatCount = categoryCounts.get(cat) || 0;
    const minQ = QUOTAS[cat] || 0;
    if (curCatCount > minQ) {
      trimIdx = i;
      break;
    }
  }
  if (trimIdx === -1) trimIdx = selected.length - 1;
  const [removed] = selected.splice(trimIdx, 1);
  trimmedCount++;
  brandCounts.set(removed.brand_slug, brandCounts.get(removed.brand_slug) - 1);
  categoryCounts.set(removed.category, categoryCounts.get(removed.category) - 1);
  proj = countBatch2Urls(selected);
}

console.log(`\n📐 Sizing & Hard Cap (§2.1):`);
console.log(`- Products selected: ${selected.length} (trimmed for 3,888 cap: ${trimmedCount})`);
console.log(`- Projected Batch 2 checks: ${proj.checks} (yield: ${(proj.checks / selected.length).toFixed(2)} checks/product)`);
console.log(`- Projected new brand hubs: ${proj.newBrands}`);
console.log(`- Projected total Batch 2 URLs: ${proj.total} (cap: 3,888)`);

// 6. Strict Validation Gate (§2.6)
let gateFailures = 0;
const gateBarcodes = new Set();
const gateSlugs = new Set();

for (const p of selected) {
  const cSlug = `${p.brand_slug}-${p.product_slug}`;
  if (/\bvol\.?\s*\d+/i.test(p.name) || p.name.length < 3 || p.brand.length < 2) {
    console.error(`❌ Fake/short product: ${p.barcode} (${p.brand} - ${p.name})`);
    gateFailures++;
  }
  if (nonEnglishInciRegex.test(p.ingredients_raw)) {
    console.error(`❌ Non-English INCI: ${p.barcode}`);
    gateFailures++;
  }
  if (!p.ingredients_list || p.ingredients_list.length < 5) {
    console.error(`❌ Incomplete INCI (<5): ${p.barcode}`);
    gateFailures++;
  }
  if (isExcludedBrand(p.brand) || !p.brand_slug || p.brand_slug === 'null') {
    console.error(`❌ Null/excluded brand: ${p.barcode} (${p.brand})`);
    gateFailures++;
  }
  if (gateBarcodes.has(p.barcode) || tierABarcodes.has(p.barcode)) {
    console.error(`❌ Duplicate or Tier A overlap barcode: ${p.barcode}`);
    gateFailures++;
  }
  if (gateSlugs.has(cSlug) || tierASlugs.has(cSlug)) {
    console.error(`❌ Duplicate or Tier A overlap slug: ${cSlug} (${p.barcode})`);
    gateFailures++;
  }
  gateBarcodes.add(p.barcode);
  gateSlugs.add(cSlug);
}

// Check category quotas
const quotaShortfalls = [];
for (const [cat, minNeeded] of Object.entries(QUOTAS)) {
  const actual = categoryCounts.get(cat) || 0;
  if (actual < minNeeded) {
    quotaShortfalls.push(`${cat}: ${actual}/${minNeeded}`);
  }
}

const withIngPhoto = selected.filter(p => p.has_ingredient_photo).length;
const withImageUrl = selected.filter(p => Boolean(p.image_url)).length;
const ingPhotoPct = ((withIngPhoto / selected.length) * 100).toFixed(1);
const imgPct = ((withImageUrl / selected.length) * 100).toFixed(1);
const nonEnPct = ((selected.filter(p => isNonEnglishName(p.name)).length / selected.length) * 100).toFixed(1);

console.log('\n📋 === BATCH 2 SELECTION SUMMARY ===');
console.log(`Total selected: ${selected.length}`);
console.log(`Ingredient-photo coverage: ${withIngPhoto}/${selected.length} (${ingPhotoPct}%)`);
console.log(`Product image_url coverage: ${withImageUrl}/${selected.length} (${imgPct}%)`);
console.log(`Non-English product names: ${selected.filter(p => isNonEnglishName(p.name)).length}/${selected.length} (${nonEnPct}%)`);
console.log(`Gate validation failures: ${gateFailures}`);
console.log(`Quota shortfalls: ${quotaShortfalls.length ? quotaShortfalls.join(', ') : 'NONE (all 9 quotas met)'}`);

console.log('\nPer-Category Counts:');
for (const [cat, cnt] of [...categoryCounts.entries()].sort((a, b) => b[1] - a[1])) {
  const q = QUOTAS[cat] ? ` (min ${QUOTAS[cat]})` : '';
  console.log(`  - ${cat}: ${cnt}${q}`);
}

console.log('\nDistinct Brand Slugs & Counts (Eyeball Check):');
for (const [slug, cnt] of [...brandCounts.entries()].sort((a, b) => b[1] - a[1])) {
  if (cnt > 0) console.log(`  - ${slug}: ${cnt}`);
}

console.log(`\nSkipped Priority Brands (${skippedBrands.length}):`);
for (const sb of skippedBrands) {
  console.log(`  - ${sb.slug}: ${sb.reason}`);
}

if (gateFailures > 0) {
  console.error('\n❌ Batch 2 Acceptance Gate FAILED!');
  process.exit(1);
}

// 7. Save selection JSON (honest filename per §2.6)
const outJsonName = selected.length === 400 ? 'launch_tier_b_400.json' : 'tier_b_products.json';
const outJsonPath = path.join(__dirname, '../data', outJsonName);
fs.writeFileSync(outJsonPath, JSON.stringify(selected, null, 2));
console.log(`\n💾 Saved Tier B selection to data/${outJsonName} (${selected.length} products).`);

// 8. Save 100-row sample markdown (§2.6)
const sampleRows = [];
const step = Math.max(1, Math.floor(selected.length / 100));
for (let i = 0; i < selected.length && sampleRows.length < 100; i += step) {
  sampleRows.push(selected[i]);
}
for (let i = 0; i < selected.length && sampleRows.length < 100; i++) {
  if (!sampleRows.includes(selected[i])) sampleRows.push(selected[i]);
}

let md = `# Acceptance Gate Batch 2: ${sampleRows.length} Sampled Real Products (Open Beauty Facts Verified)\n\n`;
md += `**Selection Total:** ${selected.length} products | **Image Coverage:** ${imgPct}% | **Ingredient Photo Coverage:** ${ingPhotoPct}%\n\n`;
md += `| # | Barcode | Brand | Product Name | Category | Ingredients Count | Sample INCI Tokens | Source URL |\n`;
md += `|---|---|---|---|---|---|---|---|\n`;
sampleRows.forEach((p, idx) => {
  const sampleInci = p.ingredients_list.slice(0, 3).join(', ') + '...';
  md += `| ${idx + 1} | \`${p.barcode}\` | **${p.brand}** | ${p.name.replace(/\|/g, '-')} | *${p.category}* | ${p.ingredient_count} | ${sampleInci.replace(/\|/g, '-')} | [View on OBF](${p.source_url}) |\n`;
});

fs.writeFileSync(path.join(__dirname, '../data/acceptance_gate_batch2_sample.md'), md);
console.log(`📄 Saved 100-row Batch 2 sample table to data/acceptance_gate_batch2_sample.md`);
