/**
 * Cosmetiqly Cloudflare D1 Seeding Script
 * 
 * Generates batched SQL transactions from the clean, English-INCI verified dataset
 * and prepares them for direct execution on Cloudflare D1 (local Miniflare or remote).
 * 
 * Usage:
 *   node scripts/seed_d1.js               (Generates data/seed_d1_launch.sql for Tier A launch set)
 *   node scripts/seed_d1.js --all         (Generates data/seed_d1_all.sql for all 16,334 products)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isAll = process.argv.includes('--all');
const isBatch2 = process.argv.includes('--batch2');
const fileArgIdx = process.argv.indexOf('--file');
const customFile = fileArgIdx !== -1 ? process.argv[fileArgIdx + 1] : null;

let sourceFile = path.join(__dirname, '../data/launch_tier_a_100.json');
let outputFile = path.join(__dirname, '../data/seed_d1_launch.sql');

if (customFile) {
  sourceFile = path.resolve(customFile);
  outputFile = path.join(__dirname, '../data/seed_d1_batch2.sql');
} else if (isBatch2) {
  const b2FourHundred = path.join(__dirname, '../data/launch_tier_b_400.json');
  const b2Generic = path.join(__dirname, '../data/tier_b_products.json');
  sourceFile = fs.existsSync(b2FourHundred) ? b2FourHundred : b2Generic;
  outputFile = path.join(__dirname, '../data/seed_d1_batch2.sql');
} else if (isAll) {
  sourceFile = path.join(__dirname, '../data/products_clean.json');
  outputFile = path.join(__dirname, '../data/seed_d1_all.sql');
}

const runDate = new Date().toISOString().split('T')[0];

console.log(`🔄 Generating Cloudflare D1 SQL Seed from ${path.basename(sourceFile)}...`);

if (!fs.existsSync(sourceFile)) {
  console.error(`❌ Source file not found: ${sourceFile}`);
  process.exit(1);
}

const products = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
console.log(`Loaded ${products.length} verified products.`);

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

let sql = `-- Cosmetiqly D1 Seed Script
-- Generated: ${new Date().toISOString()}
-- Total Records: ${products.length}
-- Target: Cloudflare D1 (cosmetiqly-db)

CREATE TABLE IF NOT EXISTS products (
  barcode TEXT PRIMARY KEY,
  brand TEXT NOT NULL,
  brand_slug TEXT NOT NULL,
  name TEXT NOT NULL,
  product_slug TEXT NOT NULL,
  category TEXT NOT NULL,
  raw_category TEXT,
  ingredients_raw TEXT NOT NULL,
  ingredients_list TEXT NOT NULL,
  ingredient_count INTEGER NOT NULL,
  image_url TEXT,
  source TEXT NOT NULL,
  source_url TEXT NOT NULL,
  verified_date TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_brand_slug ON products(brand_slug);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(product_slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

`;

// D1 supports multi-row inserts up to parameter limits; batch in chunks of 50
const BATCH_SIZE = 50;
for (let i = 0; i < products.length; i += BATCH_SIZE) {
  const batch = products.slice(i, i + BATCH_SIZE);
  sql += `INSERT OR REPLACE INTO products (
  barcode, brand, brand_slug, name, product_slug, category, raw_category,
  ingredients_raw, ingredients_list, ingredient_count, image_url,
  source, source_url, verified_date
) VALUES\n`;

  const values = batch.map(p => {
    return `  (${escapeSql(p.barcode)}, ${escapeSql(p.brand)}, ${escapeSql(p.brand_slug)}, ${escapeSql(p.name)}, ${escapeSql(p.product_slug)}, ${escapeSql(p.category)}, ${escapeSql(p.raw_category || p.category)}, ${escapeSql(p.ingredients_raw)}, ${escapeSql(JSON.stringify(p.ingredients_list))}, ${p.ingredient_count || p.ingredients_list.length}, ${escapeSql(p.image_url || '')}, ${escapeSql(p.source || 'Open Beauty Facts')}, ${escapeSql(p.source_url)}, ${escapeSql(p.verified_date || runDate)})`;
  });

  sql += values.join(',\n') + ';\n\n';
}

fs.writeFileSync(outputFile, sql);
const sizeMb = (fs.statSync(outputFile).size / (1024 * 1024)).toFixed(2);
console.log(`✅ Saved D1 seed SQL to ${outputFile} (${sizeMb} MB).`);
console.log(`\nTo execute on local Miniflare D1:`);
console.log(`  npx wrangler d1 execute cosmetiqly-db --local --file=${outputFile}`);
console.log(`\nTo execute on Cloudflare remote D1 (upon owner confirmation):`);
console.log(`  npx wrangler d1 execute cosmetiqly-db --remote --file=${outputFile}`);
