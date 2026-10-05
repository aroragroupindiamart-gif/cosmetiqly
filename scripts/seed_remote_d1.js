import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../beauty_pseo.db');

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || 'c1ebced89f0ab8555f5dc7c1766d8c55';
const DATABASE_ID = process.env.CLOUDFLARE_D1_DATABASE_ID || 'dda11c5e-f780-453e-9eff-f8fcf2cddca4';
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

function slugify(text) {
  return (text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function esc(str) {
  return (str || '').replace(/'/g, "''");
}

async function executeD1(sql) {
  if (!API_TOKEN) {
    throw new Error('Please set CLOUDFLARE_API_TOKEN in environment variables.');
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sql })
  });

  const json = await res.json();
  if (!json.success) {
    throw new Error(`D1 API Error: ${JSON.stringify(json.errors)}`);
  }
  return json.result;
}

console.log('⚡ Initializing Cloudflare D1 Remote Database (cosmetiqly-db)...');

// 1. Create Schema
const schemaSql = `
  DROP TABLE IF EXISTS page_matrix;
  DROP TABLE IF EXISTS products;
  DROP TABLE IF EXISTS safety_rules;

  CREATE TABLE products (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL,
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

await executeD1(schemaSql);
console.log('✅ Created D1 tables and indices.');

const db = new Database(dbPath, { readonly: true });

// 2. Insert Safety Rules
const rules = db.prepare('SELECT * FROM safety_rules').all();
let rulesSql = 'INSERT OR REPLACE INTO safety_rules (id, name, slug, description, blacklisted_ingredients) VALUES ';
rulesSql += rules.map(r => `('${esc(r.id)}', '${esc(r.name)}', '${esc(r.slug)}', '${esc(r.description)}', '${esc(r.blacklisted_ingredients)}')`).join(', ') + ';';
await executeD1(rulesSql);
console.log(`✅ Seeded ${rules.length} safety rules into D1.`);

// 3. Insert Products in Batches of 50
const products = db.prepare('SELECT * FROM products').all();
console.log(`📦 Seeding ${products.length} products into Cloudflare D1...`);

const BATCH_SIZE = 50;
let inserted = 0;

for (let i = 0; i < products.length; i += BATCH_SIZE) {
  const slice = products.slice(i, i + BATCH_SIZE);
  const rows = slice.map(p => {
    const pSlug = `${slugify(p.brand)}-${slugify(p.name)}`;
    return `('${esc(p.id)}', '${esc(pSlug)}', '${esc(p.brand)}', '${esc(p.name)}', '${esc(p.category)}', '${esc(p.ingredients_raw)}', '${esc(p.ingredients_list)}')`;
  }).join(', ');

  const batchSql = `INSERT OR REPLACE INTO products (id, slug, brand, name, category, ingredients_raw, ingredients_list) VALUES ${rows};`;
  await executeD1(batchSql);
  inserted += slice.length;

  if (inserted % 5000 === 0 || inserted === products.length) {
    console.log(`  Uploaded ${inserted.toLocaleString()} / ${products.length.toLocaleString()} products...`);
  }
}

console.log('🎉 Successfully seeded 100% of products into Cloudflare D1!');
db.close();
