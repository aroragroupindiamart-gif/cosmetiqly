import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../beauty_pseo.db');
const sitemapsDir = path.join(__dirname, '../public/sitemaps');

if (!fs.existsSync(sitemapsDir)) {
  fs.mkdirSync(sitemapsDir, { recursive: true });
}

console.log('🗺️ Starting XML Sitemap Generator for Cosmetiqly.com (1,000,000+ URLs)...');
const db = new Database(dbPath, { readonly: true });

const SITE_URL = 'https://cosmetiqly.com';
const URLS_PER_SITEMAP = 50000;

const stmt = db.prepare('SELECT slug FROM page_matrix ORDER BY slug ASC');
const iterator = stmt.iterate();

let fileIndex = 1;
let currentUrlCount = 0;
let sitemapFiles = [];
let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

const today = new Date().toISOString().split('T')[0];

for (const row of iterator) {
  xmlContent += `  <url><loc>${SITE_URL}/check/${row.slug}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n`;
  currentUrlCount++;

  if (currentUrlCount >= URLS_PER_SITEMAP) {
    xmlContent += '</urlset>';
    const filename = `sitemap-${fileIndex}.xml`;
    const filePath = path.join(sitemapsDir, filename);
    fs.writeFileSync(filePath, xmlContent);
    sitemapFiles.push(filename);
    console.log(`  Saved ${filename} (${currentUrlCount.toLocaleString()} URLs)`);

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
  console.log(`  Saved ${filename} (${currentUrlCount.toLocaleString()} URLs)`);
}

// Generate sitemap-index.xml
let indexXml = '<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
for (const sfile of sitemapFiles) {
  indexXml += `  <sitemap><loc>${SITE_URL}/sitemaps/${sfile}</loc><lastmod>${today}</lastmod></sitemap>\n`;
}
indexXml += '</sitemapindex>';

fs.writeFileSync(path.join(sitemapsDir, 'sitemap-index.xml'), indexXml);
console.log(`🎉 Successfully generated ${sitemapFiles.length} sitemaps and sitemap-index.xml for Cosmetiqly.com!`);

db.close();
