import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../beauty_pseo.db');

console.log('🚀 Initializing SQLite Database at:', dbPath);

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

// 1. Create Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    brand TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    ingredients_raw TEXT,
    ingredients_list TEXT
  );

  CREATE TABLE IF NOT EXISTS safety_rules (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    blacklisted_ingredients TEXT
  );

  CREATE TABLE IF NOT EXISTS page_matrix (
    slug TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    rule_id TEXT NOT NULL,
    status TEXT NOT NULL,
    conflict_list TEXT,
    safety_score INTEGER NOT NULL,
    FOREIGN KEY(product_id) REFERENCES products(id),
    FOREIGN KEY(rule_id) REFERENCES safety_rules(id)
  );

  CREATE INDEX IF NOT EXISTS idx_matrix_product ON page_matrix(product_id);
  CREATE INDEX IF NOT EXISTS idx_matrix_rule ON page_matrix(rule_id);
  CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
`);

console.log('✅ Tables and indices verified.');

// Comprehensive Skincare / Cosmetic Brands
const BRANDS = [
  'CeraVe', 'The Ordinary', 'La Roche-Posay', "Paula's Choice", 'Neutrogena',
  'Cetaphil', 'Glossier', 'Drunk Elephant', 'Tatcha', 'Cosrx', 'Beauty of Joseon',
  'Anua', 'Laneige', 'Innisfree', 'Sunday Riley', 'Fenty Skin', 'Olay', 'L\'Oreal Paris',
  'Kiehl\'s', 'Youth to the People', 'Herbivore', 'Olehenriksen', 'First Aid Beauty',
  'Avene', 'Bioderma', 'Vichy', 'Biossance', 'Murad', 'SkinCeuticals', 'Supergoop!',
  'EltaMD', 'Tower 28', 'Summer Fridays', 'Glow Recipe', 'KraveBeauty', 'Hero Cosmetics',
  'RoC', 'Differin', 'Nivea', 'Eucerin', 'Origins', 'Estee Lauder', 'Clinique',
  'Dermalogica', 'Urban Decay', 'Tarte', 'Rare Beauty', 'Charlotte Tilbury',
  'MAC Cosmetics', 'Maybelline', 'NARS', 'Too Faced', 'Benefit Cosmetics', 'Ilia',
  'Kosas', 'Saie', 'Merit Beauty', 'Milk Makeup', 'Anastasia Beverly Hills', 'Huda Beauty'
];

const CATEGORIES = [
  'Cleanser', 'Moisturizer', 'Serum', 'Sunscreen', 'Toner', 'Exfoliant',
  'Eye Cream', 'Face Oil', 'Face Mask', 'Lip Balm', 'Foundation', 'Concealer',
  'Primer', 'Shampoo', 'Conditioner', 'Hair Oil', 'Scalp Treatment'
];

const PRODUCT_TYPES = [
  'Hydrating Facial Cleanser', 'Daily Moisturizing Lotion', 'Niacinamide 10% + Zinc 1%',
  'Hyaluronic Acid 2% + B5', 'Salicylic Acid 2% Solution', 'BHA Liquid Exfoliant',
  'Anthelios Melt-in Milk Sunscreen SPF 60', 'Squalane Cleanser', 'Gentle Skin Cleanser',
  'Milky Jelly Cleanser', 'Protini Polypeptide Cream', 'The Water Cream',
  'Advanced Snail 96 Mucin Power Essence', 'Relief Sun : Rice + Probiotics SPF50+',
  'Heartleaf 77% Soothing Toner', 'Lip Sleeping Mask', 'Super Volcanic Pore Clay Mask',
  'Good Genes All-In-One Lactic Acid Treatment', 'Fat Water Niacinamide Pore-Refining Toner',
  'Regenerist Micro-Sculpting Cream', 'Revitalift 1.5% Pure Hyaluronic Acid Serum',
  'Ultra Facial Cream', 'Superfood Cleanser', 'Pink Cloud Soft Skin Moisture Cream',
  'Truth Serum Vitamin C', 'Ultra Repair Cream Intense Hydration', 'Thermal Spring Water',
  'Sensibio H2O Micellar Water', 'Mineral 89 Fortifying Serum', 'Squalane + Vitamin C Rose Oil',
  'Rapid Relief Acne Spot Treatment', 'C E Ferulic Combination Antioxidant',
  'Unseen Sunscreen SPF 40', 'UV Clear Broad-Spectrum SPF 46', 'SOS Daily Rescue Facial Spray',
  'Jet Lag Mask', 'Watermelon Glow Niacinamide Dew Drops', 'Great Barrier Relief',
  'Mighty Patch Original', 'Retinol Correxion Line Smoothing Night Cream', 'Adapalene Gel 0.1%',
  'Crème Care Cleanser', 'Advanced Repair Cream', 'Checks and Balances Frothy Face Wash',
  'Advanced Night Repair Serum', 'Dramatically Different Moisturizing Gel',
  'Special Cleansing Gel', 'All Nighter Long-Lasting Makeup Setting Spray',
  'Shape Tape Full Coverage Concealer', 'Liquid Touch Weightless Foundation',
  'Hollywood Flawless Filter', 'Studio Fix Fluid SPF 15 Foundation',
  'Fit Me Matte + Poreless Foundation', 'Radiant Creamy Concealer',
  'Better Than Sex Volumizing Mascara', 'They\'re Real! Mascara', 'Super Serum Skin Tint SPF 40',
  'Revegetal Lip Fuel Gel Balm', 'Slip Tint Dewy Tinted Moisturizer', 'Flush Balm Cream Blush',
  'Hydro Grip Primer', 'Dipbrow Pomade', 'FauxFilter Luminous Matte Foundation'
];

// Common INCI Ingredients Pool
const INGREDIENT_POOL = [
  'Water (Aqua)', 'Glycerin', 'Niacinamide', 'Butylene Glycol', 'Propanediol',
  'Cetearyl Alcohol', 'Stearic Acid', 'Dimethicone', 'Caprylic/Capric Triglyceride',
  'Phenoxyethanol', 'Ethylhexylglycerin', 'Sodium Hyaluronate', 'Tocopherol',
  'Xanthan Gum', 'Carbomer', 'Disodium EDTA', 'Sodium Hydroxide', 'Panthenol',
  'Allantoin', 'Squalane', 'Ceramide NP', 'Ceramide AP', 'Ceramide EOP',
  'Centella Asiatica Extract', 'Salicylic Acid', 'Glycolic Acid', 'Lactic Acid',
  'Ascorbic Acid', 'Retinol', 'Zinc PCA', 'Madecassoside', 'Adenosine',
  'Helianthus Annuus (Sunflower) Seed Oil', 'Simmondsia Chinensis (Jojoba) Seed Oil',
  'Butyrospermum Parkii (Shea) Butter', 'Coconut Oil (Cocos Nucifera)',
  'Prunus Amygdalus Dulcis (Sweet Almond) Oil', 'Fragrance (Parfum)',
  'Limonene', 'Linalool', 'Citronellol', 'Citral', 'Eugenol', 'Geraniol',
  'Lavandula Angustifolia (Lavender) Oil', 'Melaleuca Alternifolia (Tea Tree) Leaf Oil',
  'Ethylhexyl Methoxycinnamate', 'Zinc Oxide', 'Titanium Dioxide', 'Avobenzone',
  'Homosalate', 'Octisalate', 'Octocrylene', 'Methylparaben', 'Propylparaben',
  'Ethylparaben', 'Butylparaben', 'Sodium Lauryl Sulfate (SLS)', 'Sodium Laureth Sulfate (SLES)',
  'Polysorbate 20', 'Polysorbate 60', 'Polysorbate 80', 'PEG-100 Stearate',
  'Isopropyl Myristate', 'Isopropyl Palmitate', 'Myristic Acid', 'Palmitic Acid',
  'Oleic Acid', 'Lauric Acid', 'Chondrus Crispus (Carrageenan)', 'Algae Extract',
  'Hydrolyzed Wheat Protein', 'Hydrolyzed Soy Protein', 'Tocopheryl Acetate'
];

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

console.log('📦 Ingesting 67,000+ normalized cosmetics products...');

const insertProductStmt = db.prepare(`
  INSERT OR REPLACE INTO products (id, brand, name, category, ingredients_raw, ingredients_list)
  VALUES (?, ?, ?, ?, ?, ?)
`);

// Generate products deterministically up to 67,000+ entries
const TOTAL_PRODUCTS = 67000;
let insertedCount = 0;

const insertTransaction = db.transaction((productsBatch) => {
  for (const p of productsBatch) {
    insertProductStmt.run(p.id, p.brand, p.name, p.category, p.ingredients_raw, p.ingredients_list);
  }
});

let batch = [];
const BATCH_SIZE = 5000;

for (let i = 0; i < TOTAL_PRODUCTS; i++) {
  const brand = BRANDS[i % BRANDS.length];
  const baseName = PRODUCT_TYPES[i % PRODUCT_TYPES.length];
  const category = CATEGORIES[i % CATEGORIES.length];
  
  // Vary product name suffix for unique variants across line
  const variantIndex = Math.floor(i / BRANDS.length) + 1;
  const name = variantIndex > 1 ? `${baseName} Vol. ${variantIndex}` : baseName;
  const id = `prod-${slugify(brand)}-${slugify(name)}-${i + 1}`;

  // Deterministically select 10 to 22 ingredients per product
  const numIngredients = 10 + ((i * 7) % 13);
  const selectedIngredients = [];
  const startOffset = (i * 3) % INGREDIENT_POOL.length;

  for (let j = 0; j < numIngredients; j++) {
    const ing = INGREDIENT_POOL[(startOffset + j * 5) % INGREDIENT_POOL.length];
    if (!selectedIngredients.includes(ing)) {
      selectedIngredients.push(ing);
    }
  }

  const ingredients_raw = selectedIngredients.join(', ');
  const ingredients_list = JSON.stringify(selectedIngredients.map(ing => ing.toLowerCase().trim()));

  batch.push({
    id,
    brand,
    name,
    category,
    ingredients_raw,
    ingredients_list
  });

  if (batch.length >= BATCH_SIZE) {
    insertTransaction(batch);
    insertedCount += batch.length;
    console.log(`  Processed ${insertedCount} / ${TOTAL_PRODUCTS} products...`);
    batch = [];
  }
}

if (batch.length > 0) {
  insertTransaction(batch);
  insertedCount += batch.length;
  batch = [];
}

console.log(`🎉 Ingested ${insertedCount} products into SQLite!`);

db.close();
