import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../beauty_pseo.db');

console.log('⚡ Starting Permutation Engine at:', dbPath);

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

// 1. Define 15 Medical & Lifestyle Safety Rules
const SAFETY_RULES = [
  {
    id: 'rule-fungal-acne',
    name: 'Fungal Acne (Malassezia)',
    slug: 'fungal-acne',
    description: 'Screens for lipids, fatty acids, polysorbates, and esters that feed Malassezia yeast and trigger fungal acne / pityrosporum folliculitis.',
    blacklisted: ['polysorbate 20', 'polysorbate 60', 'polysorbate 80', 'isopropyl myristate', 'isopropyl palmitate', 'myristic acid', 'palmitic acid', 'oleic acid', 'lauric acid', 'stearic acid', 'coconut oil', 'sweet almond oil', 'sunflower seed oil', 'shea butter', 'peg-100 stearate']
  },
  {
    id: 'rule-pregnancy',
    name: 'Pregnancy & Lactation',
    slug: 'pregnancy',
    description: 'Checks for high-risk obstetric ingredients including retinoids, high-dose salicylic acid, hydroquinone, and chemical sunscreens contraindicated during pregnancy.',
    blacklisted: ['retinol', 'salicylic acid', 'hydroquinone', 'avobenzone', 'homosalate', 'octisalate', 'octocrylene']
  },
  {
    id: 'rule-non-comedogenic',
    name: 'Non-Comedogenic (Pore-Clogging)',
    slug: 'non-comedogenic',
    description: 'Identifies ingredients with high comedogenic ratings (4-5) that trap sebum and block pores leading to blackheads and inflammatory acne breakouts.',
    blacklisted: ['coconut oil', 'isopropyl myristate', 'isopropyl palmitate', 'myristic acid', 'carraceenan', 'algae extract', 'lauric acid', 'sodium lauryl sulfate (sls)']
  },
  {
    id: 'rule-silicone-free',
    name: 'Silicone-Free',
    slug: 'silicone-free',
    description: 'Verifies the absence of occlusive silicones that form a barrier layer over the skin surface.',
    blacklisted: ['dimethicone', 'cyclomethicone', 'cyclopentasiloxane', 'amodimethicone', 'dimethiconol', 'phenyl trimethicone']
  },
  {
    id: 'rule-fragrance-free',
    name: 'Fragrance & Essential Oil-Free',
    slug: 'fragrance-free',
    description: 'Ensures the product contains zero synthetic perfumes or volatile essential plant oils known to cause contact dermatitis.',
    blacklisted: ['fragrance (parfum)', 'limonene', 'linalool', 'citronellol', 'citral', 'eugenol', 'geraniol', 'lavender oil', 'tea tree leaf oil']
  },
  {
    id: 'rule-paraben-free',
    name: 'Paraben-Free',
    slug: 'paraben-free',
    description: 'Screens for synthetic alkyl ester preservatives associated with endocrine disrupting potential.',
    blacklisted: ['methylparaben', 'propylparaben', 'ethylparaben', 'butylparaben', 'isobutylparaben']
  },
  {
    id: 'rule-sulfate-free',
    name: 'Sulfate-Free',
    slug: 'sulfate-free',
    description: 'Verifies freedom from harsh cleansing surfactants that strip skin natural lipid moisture barriers.',
    blacklisted: ['sodium lauryl sulfate (sls)', 'sodium laureth sulfate (sles)', 'ammonium lauryl sulfate']
  },
  {
    id: 'rule-alcohol-free',
    name: 'Drying Alcohol-Free',
    slug: 'alcohol-free',
    description: 'Ensures absence of simple drying denatured alcohols that induce transepidermal water loss and skin redness.',
    blacklisted: ['alcohol denat', 'sd alcohol', 'isopropyl alcohol', 'ethanol', 'ethyl alcohol']
  },
  {
    id: 'rule-vegan-cruelty',
    name: 'Vegan & Cruelty-Free',
    slug: 'vegan-cruelty-free',
    description: 'Verifies the product excludes animal-derived byproducts such as snail mucin, beeswax, lanolin, carmine, and gelatin.',
    blacklisted: ['snail mucin', 'beeswax', 'lanolin', 'carmine', 'gelatin', 'collagen']
  },
  {
    id: 'rule-reef-safe',
    name: 'Reef-Safe Sunscreen',
    slug: 'reef-safe',
    description: 'Screens solar products for chemical UV filters linked to coral reef bleaching and marine toxicity in ocean ecosystems.',
    blacklisted: ['oxybenzone', 'octinoxate', 'ethylhexyl methoxycinnamate', 'octocrylene', 'avobenzone']
  },
  {
    id: 'rule-rosacea-eczema',
    name: 'Rosacea & Eczema-Trigger Free',
    slug: 'rosacea-eczema',
    description: 'Filters out physical and chemical skin irritants that precipitate erythema flares, stinging, and compromised skin barrier symptoms.',
    blacklisted: ['glycolic acid', 'lactic acid', 'salicylic acid', 'retinol', 'fragrance (parfum)', 'alcohol denat', 'sodium lauryl sulfate (sls)', 'lavender oil']
  },
  {
    id: 'rule-malassezia-free',
    name: 'Malassezia Yeast Free',
    slug: 'malassezia-free',
    description: 'Rigorous medical verification against lipid sources that harbor Malassezia furfur and seborrheic dermatitis triggers.',
    blacklisted: ['polysorbate 20', 'polysorbate 60', 'polysorbate 80', 'stearic acid', 'palmitic acid', 'myristic acid', 'coconut oil', 'shea butter']
  },
  {
    id: 'rule-nut-allergy',
    name: 'Nut-Allergy Safe',
    slug: 'nut-allergy-safe',
    description: 'Screens for botanical oils and extracts derived from tree nuts that pose severe contact allergen risks.',
    blacklisted: ['sweet almond oil', 'macadamia nut oil', 'walnut shell powder', 'argan oil', 'hazelnut oil']
  },
  {
    id: 'rule-gluten-free',
    name: 'Gluten-Free',
    slug: 'gluten-free',
    description: 'Checks for grain-derived proteins and extracts containing gluten proteins for individuals with celiac disease or gluten sensitivity.',
    blacklisted: ['hydrolyzed wheat protein', 'barley extract', 'rye seed extract', 'wheat germ oil']
  },
  {
    id: 'rule-phthalate-free',
    name: 'Phthalate-Free',
    slug: 'phthalate-free',
    description: 'Ensures product is formulated without plasticizing chemical fixatives associated with hormone disruption.',
    blacklisted: ['dibutyl phthalate', 'diethyl phthalate', 'dimethyl phthalate', 'fragrance (parfum)']
  }
];

// Insert Safety Rules into Database
const insertRuleStmt = db.prepare(`
  INSERT OR REPLACE INTO safety_rules (id, name, slug, description, blacklisted_ingredients)
  VALUES (?, ?, ?, ?, ?)
`);

for (const rule of SAFETY_RULES) {
  insertRuleStmt.run(
    rule.id,
    rule.name,
    rule.slug,
    rule.description,
    JSON.stringify(rule.blacklisted)
  );
}
console.log('✅ Safety Rules populated (15 rules).');

// Helper to slugify brand and product names cleanly
function createPageSlug(brand, productName, ruleSlug) {
  const cleanBrand = brand.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const cleanProd = productName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return `is-${cleanBrand}-${cleanProd}-${ruleSlug}-safe`;
}

// Fetch all products
console.log('🔍 Querying products table...');
const products = db.prepare('SELECT id, brand, name, ingredients_list FROM products').all();
console.log(`📊 Found ${products.length} products. Calculating matrix permutations (${products.length} × ${SAFETY_RULES.length} = ${products.length * SAFETY_RULES.length} pages)...`);

const insertMatrixStmt = db.prepare(`
  INSERT OR REPLACE INTO page_matrix (slug, product_id, rule_id, status, conflict_list, safety_score)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const insertMatrixTransaction = db.transaction((matrixBatch) => {
  for (const row of matrixBatch) {
    insertMatrixStmt.run(row.slug, row.product_id, row.rule_id, row.status, row.conflict_list, row.safety_score);
  }
});

let matrixBatch = [];
const BATCH_SIZE = 10000;
let totalGenerated = 0;
const startTime = Date.now();

for (const product of products) {
  const ingList = JSON.parse(product.ingredients_list || '[]');
  const ingSet = new Set(ingList.map(i => i.toLowerCase().trim()));

  for (const rule of SAFETY_RULES) {
    const slug = createPageSlug(product.brand, product.name, rule.slug);
    
    // Evaluate conflicts
    const matchedConflicts = [];
    for (const blacklistedItem of rule.blacklisted) {
      const trigger = blacklistedItem.toLowerCase().trim();
      // Check exact ingredient string match or substring match
      for (const userIng of ingList) {
        if (userIng.includes(trigger) || trigger.includes(userIng)) {
          if (!matchedConflicts.includes(userIng)) {
            matchedConflicts.push(userIng);
          }
        }
      }
    }

    const isSafe = matchedConflicts.length === 0;
    const status = isSafe ? 'PASS' : 'FAIL';
    
    // Calculate safety score (100% if safe, minus 25% per conflicting trigger down to min 15%)
    const safety_score = isSafe ? 100 : Math.max(15, 100 - (matchedConflicts.length * 25));

    matrixBatch.push({
      slug,
      product_id: product.id,
      rule_id: rule.id,
      status,
      conflict_list: JSON.stringify(matchedConflicts),
      safety_score
    });

    if (matrixBatch.length >= BATCH_SIZE) {
      insertMatrixTransaction(matrixBatch);
      totalGenerated += matrixBatch.length;
      console.log(`  Generated ${totalGenerated} / ${products.length * SAFETY_RULES.length} pages...`);
      matrixBatch = [];
    }
  }
}

if (matrixBatch.length > 0) {
  insertMatrixTransaction(matrixBatch);
  totalGenerated += matrixBatch.length;
  matrixBatch = [];
}

const duration = ((Date.now() - startTime) / 1000).toFixed(2);
console.log(`🎉 SUCCESS! Generated ${totalGenerated} programmatic pages in ${duration}s.`);

// Verify SQLite table counts
const matrixCount = db.prepare('SELECT COUNT(*) as cnt FROM page_matrix').get();
console.log(`📈 Final SQLite Indexed Rows in page_matrix: ${matrixCount.cnt.toLocaleString()} records.`);

db.close();
