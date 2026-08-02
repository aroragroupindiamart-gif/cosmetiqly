import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../beauty_pseo.db');
const outputPath = path.join(__dirname, '../d1_export.sql');

console.log('⚡ Exporting SQLite database to Cloudflare D1 SQL Script for Cosmetiqly...');

const db = new Database(dbPath, { readonly: true });
let sql = `-- Cloudflare D1 Export Script for Cosmetiqly
DROP TABLE IF EXISTS page_matrix;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS safety_rules;

CREATE TABLE products (
  id TEXT PRIMARY KEY,
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

CREATE TABLE page_matrix (
  slug TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  rule_id TEXT NOT NULL,
  status TEXT NOT NULL,
  conflict_list TEXT,
  safety_score INTEGER NOT NULL,
  FOREIGN KEY(product_id) REFERENCES products(id),
  FOREIGN KEY(rule_id) REFERENCES safety_rules(id)
);

CREATE INDEX idx_matrix_product ON page_matrix(product_id);
CREATE INDEX idx_matrix_rule ON page_matrix(rule_id);
CREATE INDEX idx_products_brand ON products(brand);
\n`;

// Export Safety Rules
const rules = db.prepare('SELECT * FROM safety_rules').all();
for (const r of rules) {
  const escName = r.name.replace(/'/g, "''");
  const escSlug = r.slug.replace(/'/g, "''");
  const escDesc = (r.description || '').replace(/'/g, "''");
  const escBlacklist = (r.blacklisted_ingredients || '').replace(/'/g, "''");
  sql += `INSERT INTO safety_rules VALUES ('${r.id}', '${escName}', '${escSlug}', '${escDesc}', '${escBlacklist}');\n`;
}

// Export sample batch of products & matrix for Cloudflare D1 initialization
const products = db.prepare('SELECT * FROM products LIMIT 5000').all();
for (const p of products) {
  const escId = p.id.replace(/'/g, "''");
  const escBrand = p.brand.replace(/'/g, "''");
  const escName = p.name.replace(/'/g, "''");
  const escCat = (p.category || '').replace(/'/g, "''");
  const escRaw = (p.ingredients_raw || '').replace(/'/g, "''");
  const escList = (p.ingredients_list || '').replace(/'/g, "''");
  sql += `INSERT INTO products VALUES ('${escId}', '${escBrand}', '${escName}', '${escCat}', '${escRaw}', '${escList}');\n`;
}

const matrix = db.prepare('SELECT * FROM page_matrix LIMIT 10000').all();
for (const m of matrix) {
  const escSlug = m.slug.replace(/'/g, "''");
  const escProdId = m.product_id.replace(/'/g, "''");
  const escRuleId = m.rule_id.replace(/'/g, "''");
  const escList = (m.conflict_list || '').replace(/'/g, "''");
  sql += `INSERT INTO page_matrix VALUES ('${escSlug}', '${escProdId}', '${escRuleId}', '${m.status}', '${escList}', ${m.safety_score});\n`;
}

fs.writeFileSync(outputPath, sql);
console.log(`✅ Generated Cloudflare D1 SQL export at ${outputPath}`);

db.close();
