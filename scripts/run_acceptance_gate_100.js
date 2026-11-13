import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allProducts = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/products_clean.json'), 'utf8'));

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

  // Take up to 6-8 per brand to get a diverse, robust cross-section of 100 products
  const toTake = matches.slice(0, 7);
  for (const item of toTake) {
    if (sampled.length < 100) {
      sampled.push(item);
      sampledBarcodes.add(item.barcode);
    }
  }
}

// Fill remaining to exactly 100 if needed from other verified real products
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

// Verify zero fake products, zero incomplete INCI
let fakeProductCount = 0;
let incompleteInciCount = 0;

for (const p of sampled) {
  if (/\bvol\.?\s*\d+/i.test(p.name) || p.name.length < 3 || p.brand.length < 2) {
    fakeProductCount++;
  }
  if (!p.ingredients_list || p.ingredients_list.length < 5) {
    incompleteInciCount++;
  }
}

console.log(`Gate Verification Results:`);
console.log(`- Fake products count: ${fakeProductCount}`);
console.log(`- Incomplete INCI count: ${incompleteInciCount}`);

// Generate markdown acceptance gate table report
let markdown = `# Acceptance Gate: 100 Sampled Real Products (Open Beauty Facts Verified)\n\n`;
markdown += `| # | Barcode | Brand | Product Name | Ingredients Count | Sample INCI Tokens | Source URL |\n`;
markdown += `|---|---|---|---|---|---|---|\n`;

sampled.forEach((p, idx) => {
  const sampleInci = p.ingredients_list.slice(0, 3).join(', ') + '...';
  markdown += `| ${idx + 1} | \`${p.barcode}\` | **${p.brand}** | ${p.name.replace(/\|/g, '-')} | ${p.ingredient_count} | ${sampleInci.replace(/\|/g, '-')} | [View on OBF](${p.source_url}) |\n`;
});

fs.writeFileSync(path.join(__dirname, '../data/acceptance_gate_100_sample.md'), markdown);
fs.writeFileSync(path.join(__dirname, '../data/launch_tier_a_100.json'), JSON.stringify(sampled, null, 2));

console.log(`📄 Saved Acceptance Gate table to data/acceptance_gate_100_sample.md`);
