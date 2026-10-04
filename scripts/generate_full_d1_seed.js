import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../beauty_pseo.db');
const outputPath = path.join(__dirname, '../d1_full_seed.sql');

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

console.log('⚡ Generating Indexed Cloudflare D1 SQL Seed Script (67,000 Products + 15 Rules)...');

const db = new Database(dbPath, { readonly: true });

let sql = `-- Cloudflare D1 Full Seed Script with Product Slugs
DROP TABLE IF EXISTS page_matrix;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS safety_rules;

CREATE TABLE products (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  brand TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  ingredients_raw TEXT,
  ingredients_list TEXT
);

CREATE TABLE safety_rules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  blacklisted_ingredients TEXT
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_rules_slug ON safety_rules(slug);

`;

// 1. Export All 15 Safety Rules
const rules = db.prepare('SELECT * FROM safety_rules').all();
for (const r of rules) {
  const escId = r.id.replace(/'/g, "''");
  const escName = r.name.replace(/'/g, "''");
  const escSlug = r.slug.replace(/'/g, "''");
  const escDesc = (r.description || '').replace(/'/g, "''");
  const escBlacklist = (r.blacklisted_ingredients || '').replace(/'/g, "''");
  sql += `INSERT INTO safety_rules VALUES ('${escId}', '${escName}', '${escSlug}', '${escDesc}', '${escBlacklist}');\n`;
}

// 2. Export All 67,000 Products with direct matching slug
const products = db.prepare('SELECT * FROM products').all();
console.log(`Exporting ${products.length} products to SQL with indexed slugs...`);

for (const p of products) {
  const pSlug = `${slugify(p.brand)}-${slugify(p.name)}`;
  const escId = p.id.replace(/'/g, "''");
  const escSlug = pSlug.replace(/'/g, "''");
  const escBrand = p.brand.replace(/'/g, "''");
  const escName = p.name.replace(/'/g, "''");
  const escCat = (p.category || '').replace(/'/g, "''");
  const escRaw = (p.ingredients_raw || '').replace(/'/g, "''");
  const escList = (p.ingredients_list || '').replace(/'/g, "''");
  sql += `INSERT INTO products VALUES ('${escId}', '${escSlug}', '${escBrand}', '${escName}', '${escCat}', '${escRaw}', '${escList}');\n`;
}

fs.writeFileSync(outputPath, sql);
console.log(`🎉 Successfully generated full D1 seed file at ${outputPath} (${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB)`);

db.close();
