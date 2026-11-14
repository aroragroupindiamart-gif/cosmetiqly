import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SAFETY_RULES } from '../src/lib/safety_rules_v2.js';
import { isRuleRelevant } from '../src/lib/rule_engine_v2.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const launchProducts = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/launch_tier_a_100.json'), 'utf8'));

console.log('🔄 Generating Launch Drip Manifest (Tier A Launch Set)...');

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

// 2. Brand Hubs
const seenBrands = new Set();
const brandEntries = [];
for (const p of launchProducts) {
  if (!seenBrands.has(p.brand_slug)) {
    seenBrands.add(p.brand_slug);
    brandEntries.push({
      url: `/brand/${p.brand_slug}`,
      type: 'brand_hub',
      priority: 0.8,
      changefreq: 'weekly',
      drip_day: brandEntries.length < 15 ? 1 : 2 // Top 15 on Day 1, remainder on Day 2
    });
  }
}
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

// Assign Drip Days:
// Target Launch Gate: Day 1 = ~100 URLs total
// (8 core + 15 brands + 77 top checks = exactly 100 URLs on Day 1)
// Subsequent batches drip at 50-60 checks per day
const day1CheckQuota = 100 - (8 + Math.min(15, brandEntries.length));

let currentDay = 1;
let currentDayCount = 0;

for (let i = 0; i < checkEntries.length; i++) {
  if (currentDay === 1) {
    checkEntries[i].drip_day = 1;
    currentDayCount++;
    if (currentDayCount >= day1CheckQuota) {
      currentDay = 2;
      currentDayCount = 0;
    }
  } else {
    checkEntries[i].drip_day = currentDay;
    currentDayCount++;
    if (currentDayCount >= 55) { // 55 per day as specified in §6
      currentDay++;
      currentDayCount = 0;
    }
  }
}

allEntries.push(...checkEntries);

console.log(`Generated ${allEntries.length} verified launch entries:`);
console.log(`- Core hubs & editorial: 8`);
console.log(`- Verified Brand Hubs: ${seenBrands.size}`);
console.log(`- Relevant Clinical Check Pages: ${checkEntries.length}`);

const day1Entries = allEntries.filter(e => e.drip_day === 1);
console.log(`\n📅 Launch Gate (Day 1 Active Batch): ${day1Entries.length} URLs`);
console.log(`- Core: ${day1Entries.filter(e => e.type === 'hub' || e.type === 'editorial' || e.type === 'legal').length}`);
console.log(`- Brand Hubs: ${day1Entries.filter(e => e.type === 'brand_hub').length}`);
console.log(`- Top Clinical Checks: ${day1Entries.filter(e => e.type === 'check').length}`);
console.log(`Total Drip Schedule Span: ${currentDay} days at 50-60 URLs/day.`);

// Save complete drip manifest
const manifestPath = path.join(__dirname, '../data/drip_manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(allEntries, null, 2));

// Save Day 1 active URLs for build-time bundling into middleware
const activeUrls = day1Entries.map(e => e.url);
const activeUrlsPath = path.join(__dirname, '../data/drip_active_urls.json');
fs.writeFileSync(activeUrlsPath, JSON.stringify(activeUrls, null, 2));

// Generate sitemap.xml strictly for active dripped URLs
const SITE_DOMAIN = process.env.SITE_DOMAIN || 'https://cosmetiqlyy.com';
const today = new Date().toISOString().split('T')[0];

let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
for (const item of day1Entries) {
  const fullLoc = item.url === '/' ? `${SITE_DOMAIN}/` : `${SITE_DOMAIN}${item.url}`;
  sitemapXml += `  <url><loc>${fullLoc}</loc><lastmod>${today}</lastmod><changefreq>${item.changefreq}</changefreq><priority>${item.priority.toFixed(1)}</priority></url>\n`;
}
sitemapXml += `</urlset>`;

const sitemapPublicPath = path.join(__dirname, '../public/sitemap.xml');
fs.writeFileSync(sitemapPublicPath, sitemapXml);
console.log(`🗺️ Saved active sitemap.xml to ${sitemapPublicPath} (${day1Entries.length} URLs).`);
