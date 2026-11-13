import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../data/cosmetiqly_real.db');
const productsJsonPath = path.join(__dirname, '../data/products_clean.json');

console.log('🔄 Building Real Local SQLite Database for Launch Set...');

if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    barcode TEXT PRIMARY KEY,
    brand TEXT NOT NULL,
    brand_slug TEXT NOT NULL,
    name TEXT NOT NULL,
    product_slug TEXT NOT NULL,
    category TEXT NOT NULL,
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
`);

const products = JSON.parse(fs.readFileSync(productsJsonPath, 'utf8'));

const insert = db.prepare(`
  INSERT INTO products (
    barcode, brand, brand_slug, name, product_slug, category,
    ingredients_raw, ingredients_list, ingredient_count, image_url,
    source, source_url, verified_date
  ) VALUES (
    @barcode, @brand, @brand_slug, @name, @product_slug, @category,
    @ingredients_raw, @ingredients_list, @ingredient_count, @image_url,
    @source, @source_url, @verified_date
  )
`);

const insertMany = db.transaction((items) => {
  for (const item of items) {
    insert.run({
      ...item,
      ingredients_list: JSON.stringify(item.ingredients_list)
    });
  }
});

console.log(`Inserting ${products.length} real products into SQLite database...`);
insertMany(products);

console.log(`✅ Real SQLite database ready at ${dbPath}`);
db.close();
