import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SAFETY_RULES } from '../src/lib/safety_rules_v2.js';
import { isRuleRelevant } from '../src/lib/rule_engine_v2.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const launchProducts = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/launch_tier_a_100.json'), 'utf8'));

console.log('🔄 Generating Launch Drip Manifest (Tier A Launch Set)...');

// Generate real relevant check URLs for the 100 verified launch products
const manifestEntries = [];

// 1. Static Core Hubs (Priority 1.0 - 0.8)
manifestEntries.push({ url: '/', type: 'hub', priority: 1.0, changefreq: 'daily' });
manifestEntries.push({ url: '/directory', type: 'hub', priority: 0.9, changefreq: 'daily' });
manifestEntries.push({ url: '/rules', type: 'hub', priority: 0.8, changefreq: 'weekly' });
manifestEntries.push({ url: '/methodology', type: 'editorial', priority: 0.8, changefreq: 'monthly' });
manifestEntries.push({ url: '/about', type: 'editorial', priority: 0.7, changefreq: 'monthly' });
manifestEntries.push({ url: '/contact', type: 'editorial', priority: 0.6, changefreq: 'monthly' });
manifestEntries.push({ url: '/privacy', type: 'legal', priority: 0.3, changefreq: 'yearly' });
manifestEntries.push({ url: '/terms', type: 'legal', priority: 0.3, changefreq: 'yearly' });

// 2. Brand Hubs for Launch Products
const seenBrands = new Set();
for (const p of launchProducts) {
  if (!seenBrands.has(p.brand_slug)) {
    seenBrands.add(p.brand_slug);
    manifestEntries.push({
      url: `/brand/${p.brand_slug}`,
      type: 'brand_hub',
      priority: 0.8,
      changefreq: 'weekly'
    });
  }
}

// 3. Relevant Check Pages (Only where isRuleRelevant is true)
for (const p of launchProducts) {
  for (const rule of SAFETY_RULES) {
    if (isRuleRelevant(rule, p.category)) {
      const slug = `is-${p.brand_slug}-${p.product_slug}-${rule.slug}-safe`;
      manifestEntries.push({
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

console.log(`Generated ${manifestEntries.length} verified launch entries:`);
console.log(`- Core hubs & editorial: 8`);
console.log(`- Verified Brand Hubs: ${seenBrands.size}`);
console.log(`- Relevant Clinical Check Pages: ${manifestEntries.filter(m => m.type === 'check').length}`);

// Save drip manifest
const manifestPath = path.join(__dirname, '../data/drip_manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifestEntries, null, 2));

// Generate matching sitemap.xml strictly from drip manifest
const SITE_DOMAIN = process.env.SITE_DOMAIN || 'https://cosmetiqlyy.com';
const today = new Date().toISOString().split('T')[0];

let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
for (const item of manifestEntries) {
  const fullLoc = item.url === '/' ? `${SITE_DOMAIN}/` : `${SITE_DOMAIN}${item.url}`;
  sitemapXml += `  <url><loc>${fullLoc}</loc><lastmod>${today}</lastmod><changefreq>${item.changefreq}</changefreq><priority>${item.priority.toFixed(1)}</priority></url>\n`;
}
sitemapXml += `</urlset>`;

const sitemapPublicPath = path.join(__dirname, '../public/sitemap.xml');
fs.writeFileSync(sitemapPublicPath, sitemapXml);
console.log(`🗺️ Saved matching sitemap.xml to ${sitemapPublicPath} (${manifestEntries.length} URLs).`);
