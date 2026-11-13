import https from 'https';
import zlib from 'zlib';
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = path.join(__dirname, '../data/products_clean.json');

console.log('🔄 Streaming and applying strict clinical INCI parsing on Open Beauty Facts...');

const CSV_URL = 'https://static.openbeautyfacts.org/data/en.openbeautyfacts.org.products.csv.gz';

function slugify(text) {
  return text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function cleanBrandName(raw) {
  if (!raw) return '';
  let b = raw.split(',')[0].trim();
  // Strip "is sold by unilever", "laboratoires", etc. if appended
  b = b.replace(/\b(is sold by|distribué par|made in|by)\b.*/i, '').trim();
  b = b.replace(/-/g, ' ');
  return b.replace(/\b\w/g, c => c.toUpperCase()).trim();
}

function extractPureInci(raw) {
  if (!raw) return '';
  let cleaned = raw;

  // If text contains 'INGREDIENTS:' (or variants), take what follows
  const match = cleaned.match(/ingredients?\s*(?:(?:\/|\:|\-)\s*(?:ingr[ée]dients?)?\s*(?:\:|\-)?)?\s*([^]+)/i);
  if (match) {
    cleaned = match[1];
  }

  // Remove common non-ingredient tail sections
  cleaned = cleaned.replace(/\b(warnings?|directions?|how to use|caution|mode d'emploi|utilisez|made in|fabriqué en)[^]+/i, '');
  return cleaned.trim();
}

function parseIngredientsList(raw) {
  const pure = extractPureInci(raw);
  if (!pure) return [];

  return pure
    .replace(/\[[^\]]*\]/g, '')
    .split(/[,;•·]+|\.\s+/)
    .map(s => {
      let t = s.trim();
      // Remove leading bullet points or numbers
      t = t.replace(/^[-*•\d\.\)]+\s*/, '');
      // Remove trailing periods
      t = t.replace(/\.$/, '');
      return t;
    })
    .filter(s => {
      // Must look like an INCI token: 2-80 chars, not just digits, not instructional sentences
      if (s.length < 2 || s.length > 90) return false;
      if (/^\d+%?$/.test(s)) return false;
      if (/\b(caratteristiche|prodotto|applicare|massage|evitare|contact with eyes)\b/i.test(s)) return false;
      return true;
    });
}

const seenBarcodes = new Set();
const seenSlugs = new Set();
const cleanProducts = [];

let totalRows = 0;
let validCount = 0;

https.get(CSV_URL, res => {
  const gunzip = zlib.createGunzip();
  res.pipe(gunzip);
  const rl = readline.createInterface({ input: gunzip });

  rl.on('line', line => {
    totalRows++;
    if (totalRows === 1) return; // Header

    const cols = line.split('\t');
    const barcode = cols[0]?.trim();
    const rawName = cols[10]?.trim();
    const rawBrand = (cols[18] || cols[17] || '')?.trim();
    const category = (cols[20] || cols[19] || 'Skincare')?.split(',')[0]?.trim() || 'Skincare';
    const rawIngredients = cols[33]?.trim();
    const imageUrl = cols[130]?.trim() || cols[131]?.trim() || '';

    if (!barcode || seenBarcodes.has(barcode)) return;
    if (!rawName || !rawBrand) return;
    if (/\bvol\.?\s*\d+/i.test(rawName)) return;
    if (rawName.length < 3 || rawBrand.length < 2) return;

    // Must have at least 25 chars of ingredient text
    if (!rawIngredients || rawIngredients.length < 25) return;

    const parsedIng = parseIngredientsList(rawIngredients);
    // Mandatory Gate: at least 5 clean parsed ingredients
    if (parsedIng.length < 5) return;

    // Discard products where the list looks like non-INCI garbage instructions
    const sampleIng = parsedIng.slice(0, 3).join(' ');
    if (/\b(caratteristiche|prodotto|per uso cutaneo|warnings|caution)\b/i.test(sampleIng)) return;

    const brandName = cleanBrandName(rawBrand);
    if (!brandName || brandName.length < 2) return;

    const brandSlug = slugify(brandName);
    const productSlug = slugify(rawName);
    const combinedSlug = `${brandSlug}-${productSlug}`;

    if (!combinedSlug || seenSlugs.has(combinedSlug)) return;

    seenBarcodes.add(barcode);
    seenSlugs.add(combinedSlug);

    cleanProducts.push({
      barcode,
      brand: brandName,
      brand_slug: brandSlug,
      name: rawName,
      product_slug: productSlug,
      category,
      ingredients_raw: extractPureInci(rawIngredients),
      ingredients_list: parsedIng,
      ingredient_count: parsedIng.length,
      image_url: imageUrl,
      source: 'Open Beauty Facts',
      source_url: `https://world.openbeautyfacts.org/product/${barcode}`,
      verified_date: '2026-11-13'
    });

    validCount++;
    if (validCount % 1000 === 0) {
      console.log(`  -> Processed ${validCount} clean products (scanned ${totalRows} rows)...`);
    }
  });

  rl.on('close', () => {
    console.log(`\n🎉 Completed Scan!`);
    console.log(`Total scanned: ${totalRows}`);
    console.log(`Clean deduplicated products with strict clinical INCI: ${cleanProducts.length}`);

    fs.writeFileSync(outputPath, JSON.stringify(cleanProducts, null, 2));
    console.log(`💾 Saved clean dataset to ${outputPath} (${(fs.statSync(outputPath).size / (1024 * 1024)).toFixed(2)} MB)`);
  });
}).on('error', err => {
  console.error('Download error:', err);
});
