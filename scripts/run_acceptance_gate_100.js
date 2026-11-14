import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allProducts = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/products_clean.json'), 'utf8'));

// Non-English regex to double-check
const nonEnglishRegex = /\b(água|óleo|glicerina|conservante|ácido|fragrância|estearato|palmitato|extrato|álcool|manteiga|acqua|olio|acrilati|acido|profumo|estratto|huile|extrait|soin|visage|cheveux|ingredientes|composicion)\b/i;

// Tier A Target Brands with proven international search demand
const targetBrandList = [
  'CeraVe', 'The Ordinary', 'La Roche Posay', 'Neutrogena', 'Bioderma',
  'Cetaphil', 'Avene', 'Eucerin', 'Paula S Choice', 'Vanicream',
  'First Aid Beauty', 'Innisfree', 'Laneige', 'Cosrx', 'Kiehl S', 'Balea', 'Nivea'
];

// Sample exactly 100 products evenly across these real brands
const sampled = [];
const sampledBarcodes = new Set();

for (const targetBrand of targetBrandList) {
  const matches = allProducts.filter(p => 
    p.brand.toLowerCase().includes(targetBrand.toLowerCase()) && 
    !sampledBarcodes.has(p.barcode)
  );

  const toTake = matches.slice(0, 7);
  for (const item of toTake) {
    if (sampled.length < 100) {
      sampled.push(item);
      sampledBarcodes.add(item.barcode);
    }
  }
}

if (sampled.length < 100) {
  for (const item of allProducts) {
    if (!sampledBarcodes.has(item.barcode)) {
      sampled.push(item);
      sampledBarcodes.add(item.barcode);
      if (sampled.length >= 100) break;
    }
  }
}

console.log(`✅ Sampled ${sampled.length} real products for Acceptance Gate §2.`);

// Verify zero fake products, zero non-English, zero incomplete INCI
let fakeProductCount = 0;
let nonEnglishCount = 0;
let incompleteInciCount = 0;

for (const p of sampled) {
  if (/\bvol\.?\s*\d+/i.test(p.name) || p.name.length < 3 || p.brand.length < 2) {
    fakeProductCount++;
  }
  if (nonEnglishRegex.test(p.ingredients_raw)) {
    nonEnglishCount++;
  }
  if (!p.ingredients_list || p.ingredients_list.length < 5) {
    incompleteInciCount++;
  }
}

console.log(`Gate Verification Results:`);
console.log(`- Sampled count: ${sampled.length} (Target: 100)`);
console.log(`- Fake products count: ${fakeProductCount}`);
console.log(`- Non-English INCI count: ${nonEnglishCount}`);
console.log(`- Incomplete INCI count: ${incompleteInciCount}`);

if (sampled.length !== 100 || fakeProductCount > 0 || nonEnglishCount > 0 || incompleteInciCount > 0) {
  console.error(`\n❌ Acceptance Gate FAILED!`);
  if (sampled.length !== 100) console.error(`  - Expected 100 sampled products, got ${sampled.length}`);
  if (fakeProductCount > 0) console.error(`  - Found ${fakeProductCount} fake products`);
  if (nonEnglishCount > 0) console.error(`  - Found ${nonEnglishCount} non-English INCI lists`);
  if (incompleteInciCount > 0) console.error(`  - Found ${incompleteInciCount} incomplete INCI lists`);
  process.exit(1);
}

console.log(`\n✅ Acceptance Gate PASSED: exactly 100 real products, 0 fake, 0 non-English, 0 incomplete INCI.`);

// Generate markdown acceptance gate table report
let markdown = `# Acceptance Gate: 100 Sampled Real Products (Open Beauty Facts Verified)\n\n`;
markdown += `| # | Barcode | Brand | Product Name | Category | Ingredients Count | Sample INCI Tokens | Source URL |\n`;
markdown += `|---|---|---|---|---|---|---|---|\n`;

sampled.forEach((p, idx) => {
  const sampleInci = p.ingredients_list.slice(0, 3).join(', ') + '...';
  markdown += `| ${idx + 1} | \`${p.barcode}\` | **${p.brand}** | ${p.name.replace(/\|/g, '-')} | *${p.category}* | ${p.ingredient_count} | ${sampleInci.replace(/\|/g, '-')} | [View on OBF](${p.source_url}) |\n`;
});

fs.writeFileSync(path.join(__dirname, '../data/acceptance_gate_100_sample.md'), markdown);
fs.writeFileSync(path.join(__dirname, '../data/launch_tier_a_100.json'), JSON.stringify(sampled, null, 2));

console.log(`📄 Saved Acceptance Gate table to data/acceptance_gate_100_sample.md`);
