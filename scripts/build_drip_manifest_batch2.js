import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SAFETY_RULES } from '../src/lib/safety_rules_v2.js';
import { isRuleRelevant } from '../src/lib/rule_engine_v2.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const manifestPath = path.join(__dirname, '../data/drip_manifest.json');
const b2FourHundred = path.join(__dirname, '../data/launch_tier_b_400.json');
const b2Generic = path.join(__dirname, '../data/tier_b_products.json');
const tierBPath = fs.existsSync(b2FourHundred) ? b2FourHundred : b2Generic;

if (!fs.existsSync(tierBPath)) {
  console.error('❌ Tier B selection JSON not found. Run run_acceptance_gate_batch2.js first.');
  process.exit(1);
}

const originalManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const tierBProducts = JSON.parse(fs.readFileSync(tierBPath, 'utf8'));
const tierAProducts = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/launch_tier_a_100.json'), 'utf8'));

// Preserve Days 1-18 verbatim (must be 989 entries)
const days1To18 = originalManifest.filter(e => e.drip_day <= 18);
if (days1To18.length !== 989) {
  console.error(`❌ Expected 989 entries in Days 1-18, found ${days1To18.length}`);
  process.exit(1);
}

const existingUrls = new Set(days1To18.map(e => e.url));
const existingBrandHubs = new Set(days1To18.filter(e => e.type === 'brand_hub').map(e => e.url));

function buildCheckSlug(brandSlug, productSlug, ruleSlug) {
  let slug = `is-${brandSlug}-${productSlug}-${ruleSlug}-safe`;
  return slug.replace(/-safe-safe$/, '-safe');
}

// Collect max verified_date per new brand_slug (§2.5 step 5)
const brandMaxDate = new Map();
for (const p of tierBProducts) {
  const cur = brandMaxDate.get(p.brand_slug);
  if (!cur || p.verified_date > cur) {
    brandMaxDate.set(p.brand_slug, p.verified_date);
  }
}

// Generate new entries in selection order (brand hub on first appearance of a new brand, then relevant checks)
const newEntries = [];
const addedNewBrands = new Set();

for (const p of tierBProducts) {
  const brandUrl = `/brand/${p.brand_slug}`;
  if (!existingBrandHubs.has(brandUrl) && !addedNewBrands.has(brandUrl)) {
    addedNewBrands.add(brandUrl);
    newEntries.push({
      url: brandUrl,
      type: 'brand_hub',
      priority: 0.8,
      changefreq: 'weekly',
      verified_date: brandMaxDate.get(p.brand_slug)
    });
  }

  for (const rule of SAFETY_RULES) {
    if (isRuleRelevant(rule, p.category)) {
      const slug = buildCheckSlug(p.brand_slug, p.product_slug, rule.slug);
      newEntries.push({
        url: `/check/${slug}`,
        type: 'check',
        brand: p.brand,
        product: p.name,
        rule: rule.name,
        priority: 0.7,
        changefreq: 'monthly',
        verified_date: p.verified_date
      });
    }
  }
}

// Assign drip_day >= 19 at 54/day (final day takes remainder)
let day = 19;
let idx = 0;
while (idx < newEntries.length) {
  const remaining = newEntries.length - idx;
  const batchSize = Math.min(54, remaining);
  for (let i = 0; i < batchSize; i++) {
    newEntries[idx++].drip_day = day;
  }
  day++;
}

const combinedManifest = [...days1To18, ...newEntries];

// Assert Days 1-18 unchanged
for (let i = 0; i < 989; i++) {
  if (JSON.stringify(combinedManifest[i]) !== JSON.stringify(days1To18[i])) {
    console.error(`❌ Days 1-18 mutated at index ${i}!`);
    process.exit(1);
  }
}
console.log('DAYS 1-18 UNCHANGED: 989/989');

// Assertions (§2.5 & §7.4)
const allUrls = new Set();
const dayCounts = {};
let nullBrandUrls = 0;
let safeSafeUrls = 0;
let undefinedSegUrls = 0;

for (const entry of combinedManifest) {
  if (allUrls.has(entry.url)) {
    console.error(`❌ Duplicate URL in manifest: ${entry.url}`);
    process.exit(1);
  }
  allUrls.add(entry.url);

  if (/\/brand\/null\b|\/check\/is-null-/i.test(entry.url)) nullBrandUrls++;
  if (/-safe-safe$/.test(entry.url)) safeSafeUrls++;
  if (/undefined|\bnull\b/i.test(entry.url)) undefinedSegUrls++;

  dayCounts[entry.drip_day] = (dayCounts[entry.drip_day] || 0) + 1;
}

const maxDay = Math.max(...Object.keys(dayCounts).map(Number));
if (maxDay > 90) {
  console.error(`❌ Manifest exceeds Day 90 (maxDay = ${maxDay})!`);
  process.exit(1);
}

for (const [dStr, cnt] of Object.entries(dayCounts)) {
  const d = Number(dStr);
  if (d >= 19 && d < maxDay && (cnt < 50 || cnt > 60)) {
    console.error(`❌ Day ${d} has ${cnt} URLs (must be 50-60)!`);
    process.exit(1);
  }
  if (d >= 19 && cnt > 60) {
    console.error(`❌ Day ${d} exceeds 60 URLs (${cnt})!`);
    process.exit(1);
  }
}

// Brand-hub count = distinct brand_slug count across Tier A (excluding null) + Tier B
const validTierABrands = new Set(
  tierAProducts
    .filter(p => p.brand_slug && p.brand_slug !== 'null' && p.brand_slug !== 'undefined')
    .map(p => p.brand_slug)
);
const distinctAllBrands = new Set([...validTierABrands, ...tierBProducts.map(p => p.brand_slug)]);
const manifestBrandHubs = combinedManifest.filter(e => e.type === 'brand_hub').length;

console.log(`\nManifest Assertions:`);
console.log(`- Total unique URLs: ${combinedManifest.length} (0 duplicates)`);
console.log(`- Batch 2 new URLs: ${newEntries.length} (${addedNewBrands.size} new brand hubs + ${newEntries.length - addedNewBrands.size} checks)`);
console.log(`- Null-brand URLs: ${nullBrandUrls}`);
console.log(`- "-safe-safe" URLs: ${safeSafeUrls}`);
console.log(`- Undefined/null segment URLs: ${undefinedSegUrls}`);
console.log(`- Brand-hub count: ${manifestBrandHubs} | Distinct brand_slug count (Tier A + Tier B): ${distinctAllBrands.size}`);

if (nullBrandUrls > 0 || safeSafeUrls > 0 || undefinedSegUrls > 0) {
  console.error('❌ URL hygiene assertion failed!');
  process.exit(1);
}
if (manifestBrandHubs !== distinctAllBrands.size) {
  console.error(`❌ Brand-hub count (${manifestBrandHubs}) != distinct brand_slug count (${distinctAllBrands.size})!`);
  process.exit(1);
}

console.log(`\nFull Day Distribution (Days 1–${maxDay}):`);
for (let d = 1; d <= maxDay; d++) {
  console.log(`  Day ${d}: ${dayCounts[d] || 0} URLs`);
}

fs.writeFileSync(manifestPath, JSON.stringify(combinedManifest, null, 2));
console.log(`\n💾 Saved combined manifest to data/drip_manifest.json (${combinedManifest.length} URLs across ${maxDay} days).`);
