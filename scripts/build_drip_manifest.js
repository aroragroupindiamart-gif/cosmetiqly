import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SAFETY_RULES } from '../src/lib/safety_rules_v2.js';
import { isRuleRelevant } from '../src/lib/rule_engine_v2.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const launchProducts = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/launch_tier_a_100.json'), 'utf8'));

console.log('🔄 Generating Launch Drip Manifest (Strict 50-60 URLs/day ceiling)...');

const allEntries = [];

// 1. Static Core Hubs (Priority 1.0 - 0.8) - Day 1
const coreHubs = [
  { url: '/', type: 'hub', priority: 1.0, changefreq: 'daily', drip_day: 1 },
  { url: '/directory', type: 'hub', priority: 0.9, changefreq: 'daily', drip_day: 1 },
  { url: '/rules', type: 'hub', priority: 0.8, changefreq: 'weekly', drip_day: 1 },
  { url: '/methodology', type: 'editorial', priority: 0.8, changefreq: 'monthly', drip_day: 1 },
  { url: '/about', type: 'editorial', priority: 0.7, changefreq: 'monthly', drip_day: 1 },
  { url: '/contact', type: 'editorial', priority: 0.6, changefreq: 'monthly', drip_day: 1 },
  { url: '/privacy', type: 'legal', priority: 0.3, changefreq: 'yearly', drip_day: 1 },
  { url: '/terms', type: 'legal', priority: 0.3, changefreq: 'yearly', drip_day: 1 }
];
allEntries.push(...coreHubs);

// 2. Brand Hubs (Spread across days so daily batch ceiling is respected)
const seenBrands = new Set();
const brandEntries = [];
for (const p of launchProducts) {
  if (!seenBrands.has(p.brand_slug)) {
    seenBrands.add(p.brand_slug);
    brandEntries.push({
      url: `/brand/${p.brand_slug}`,
      type: 'brand_hub',
      priority: 0.8,
      changefreq: 'weekly'
    });
  }
}

// Brand distribution:
// Day 1: Top 15 brands
// Day 2: 6 brands
// Day 3: Remaining 6 brands
brandEntries.forEach((b, idx) => {
  if (idx < 15) b.drip_day = 1;
  else if (idx < 21) b.drip_day = 2;
  else b.drip_day = 3;
});
allEntries.push(...brandEntries);

// 3. Relevant Check Pages
const checkEntries = [];
for (const p of launchProducts) {
  for (const rule of SAFETY_RULES) {
    if (isRuleRelevant(rule, p.category)) {
      const slug = `is-${p.brand_slug}-${p.product_slug}-${rule.slug}-safe`;
      checkEntries.push({
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

// Day 1: 8 core + 15 brands + 77 checks = Exactly 100 URLs
// Day 2: 6 brands + 48 checks = Exactly 54 URLs (strictly within 50-60 ceiling)
// Day 3: 6 brands + 48 checks = Exactly 54 URLs
// Day 4+: 54 checks per day until all 968 checks are scheduled
let checkIndex = 0;

// Day 1 checks: exactly 77
for (let i = 0; i < 77 && checkIndex < checkEntries.length; i++) {
  checkEntries[checkIndex++].drip_day = 1;
}

// Day 2 checks: exactly 48
for (let i = 0; i < 48 && checkIndex < checkEntries.length; i++) {
  checkEntries[checkIndex++].drip_day = 2;
}

// Day 3 checks: exactly 48
for (let i = 0; i < 48 && checkIndex < checkEntries.length; i++) {
  checkEntries[checkIndex++].drip_day = 3;
}

// Day 4+: batches of 54
let day = 4;
while (checkIndex < checkEntries.length) {
  const batchSize = Math.min(54, checkEntries.length - checkIndex);
  for (let i = 0; i < batchSize; i++) {
    checkEntries[checkIndex++].drip_day = day;
  }
  day++;
}

allEntries.push(...checkEntries);

// Validate daily counts
const dayCounts = {};
for (const entry of allEntries) {
  dayCounts[entry.drip_day] = (dayCounts[entry.drip_day] || 0) + 1;
}

console.log('Daily Drip Schedule Breakdown:');
for (const [d, count] of Object.entries(dayCounts)) {
  console.log(`- Day ${d}: ${count} URLs`);
}

// Save complete drip manifest
const manifestPath = path.join(__dirname, '../data/drip_manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(allEntries, null, 2));
console.log(`\n💾 Saved complete drip manifest to ${manifestPath} (${allEntries.length} URLs across ${Object.keys(dayCounts).length} days).`);
