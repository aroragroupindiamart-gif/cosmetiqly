import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../beauty_pseo.db');
const sitemapsDir = path.join(__dirname, '../public/sitemaps');
const publicDir = path.join(__dirname, '../public');

// Clean up old sitemap files
if (fs.existsSync(sitemapsDir)) {
  fs.rmSync(sitemapsDir, { recursive: true, force: true });
}
fs.mkdirSync(sitemapsDir, { recursive: true });

console.log('🗺️ Starting High-Performance XML Sitemap Generator (with sitemap-main.xml)...');
const db = new Database(dbPath, { readonly: true });

const SITE_URL = 'https://cosmetiqly.com';
const URLS_PER_SITEMAP = 5000;
const today = new Date().toISOString().split('T')[0];

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// 1. Generate sitemap-main.xml for core authoritative pages & brand hubs
let mainXml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
// Homepage MUST have trailing slash: https://cosmetiqly.com/
mainXml += `  <url><loc>${SITE_URL}/</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>\n`;
mainXml += `  <url><loc>${SITE_URL}/directory</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>\n`;
mainXml += `  <url><loc>${SITE_URL}/about</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>\n`;
mainXml += `  <url><loc>${SITE_URL}/contact</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>\n`;
mainXml += `  <url><loc>${SITE_URL}/privacy</loc><lastmod>${today}</lastmod><changefreq>yearly</changefreq><priority>0.3</priority></url>\n`;
mainXml += `  <url><loc>${SITE_URL}/terms</loc><lastmod>${today}</lastmod><changefreq>yearly</changefreq><priority>0.3</priority></url>\n`;

// A-Z Brand Letter Hubs
const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
for (const letter of alphabet) {
  mainXml += `  <url><loc>${SITE_URL}/brands/${letter}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>\n`;
}

// All Verified Brand Hubs
const brandRows = db.prepare("SELECT DISTINCT brand FROM products WHERE brand IS NOT NULL AND brand != '' ORDER BY brand ASC").all();
for (const row of brandRows) {
  const brandSlug = slugify(row.brand);
  mainXml += `  <url><loc>${SITE_URL}/brand/${brandSlug}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
}

mainXml += '</urlset>';
fs.writeFileSync(path.join(sitemapsDir, 'sitemap-main.xml'), mainXml);

// 2. Generate chunked sitemaps for programmatic checks (5,000 URLs each)
const stmt = db.prepare('SELECT slug FROM page_matrix ORDER BY slug ASC');
const iterator = stmt.iterate();

let fileIndex = 1;
let currentUrlCount = 0;
let sitemapFiles = ['sitemap-main.xml'];
let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

for (const row of iterator) {
  xmlContent += `  <url><loc>${SITE_URL}/check/${row.slug}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n`;
  currentUrlCount++;

  if (currentUrlCount >= URLS_PER_SITEMAP) {
    xmlContent += '</urlset>';
    const filename = `sitemap-${fileIndex}.xml`;
    const filePath = path.join(sitemapsDir, filename);
    fs.writeFileSync(filePath, xmlContent);
    sitemapFiles.push(filename);

    fileIndex++;
    currentUrlCount = 0;
    xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  }
}

if (currentUrlCount > 0) {
  xmlContent += '</urlset>';
  const filename = `sitemap-${fileIndex}.xml`;
  const filePath = path.join(sitemapsDir, filename);
  fs.writeFileSync(filePath, xmlContent);
  sitemapFiles.push(filename);
}

// 3. Generate sitemap.xml index
let indexXml = '<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
for (const sfile of sitemapFiles) {
  indexXml += `  <sitemap><loc>${SITE_URL}/sitemaps/${sfile}</loc><lastmod>${today}</lastmod></sitemap>\n`;
}
indexXml += '</sitemapindex>';

fs.writeFileSync(path.join(sitemapsDir, 'sitemap-index.xml'), indexXml);
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), indexXml);
fs.writeFileSync(path.join(publicDir, 'sitemap-index.xml'), indexXml);
console.log(`🎉 Successfully generated ${sitemapFiles.length} lightweight sitemaps (including sitemap-main.xml), sitemap.xml, and sitemap-index.xml for Cosmetiqly.com!`);

db.close();
